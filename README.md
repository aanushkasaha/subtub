# subtub

A subscription tracking API. Users sign up, log their subscriptions (Netflix, Spotify, gym, whatever), and get automated email reminders before each one renews — 7 days out, 5 days, 2 days, 1 day, and on the final day.

**Live API:** https://subtub-api.onrender.com/
*(Free-tier Render instance — it spins down when idle, so the first request after a while may take 20–30s to wake up.)*

## Why this exists

I built this to go deep on a few things that don't show up in most tutorial-shaped backends: a durable background workflow that has to "remember" it's mid-task across multiple days, webhook signature verification, and what it actually takes to debug someone else's auth and database code after the fact. It's a student project, not a production system — the design decisions below are honest about what's solid and what's a deliberate scope cut.

## What it does

- Email/password auth with JWT, password hashing (bcrypt), and httpOnly-cookie-friendly sign-in
- CRUD on subscriptions, scoped so a user can only ever see or modify their own
- Auto-calculated renewal dates based on billing frequency (daily/weekly/monthly/annually)
- Auto-expiry of subscriptions whose renewal date has passed
- A durable reminder workflow: on subscription creation, a multi-day job is scheduled that wakes up at each reminder milestone and emails the user — even if the server restarts in between
- Rate limiting and bot detection on every route in production

## Architecture

```
Client
  │
  ▼
Arcjet (rate limit + bot detection)   ← skipped in dev, so Postman isn't flagged as a bot
  │
  ▼
Express routes  →  JWT auth middleware  →  Controllers  →  Mongoose models  →  MongoDB
  │
  ▼
Subscription created → triggers Upstash Workflow (QStash)
                              │
                              ▼
                    sleeps until next reminder milestone
                    (durable across days/restarts)
                              │
                              ▼
                    Nodemailer sends the reminder email
```

### The reminder workflow, specifically

This is the part of the project I think is actually interesting. A normal `setTimeout` or cron job can't reliably wait *7 days* — the process will restart, redeploy, or crash long before then. Instead, subscription creation triggers an [Upstash Workflow](https://upstash.com/docs/workflow) run that:

1. Looks up the subscription and bails early if it's missing, has no owning user (e.g. the user account was deleted), or isn't active.
2. Walks through five reminder milestones (7/5/2/1/0 days before renewal), using `context.sleepUntil()` to durably pause until each one — the workflow state is persisted by QStash, not held in memory, so a server restart mid-sleep doesn't lose the job.
3. Sends an email at each milestone it's due for, then stops after the final-day reminder.
4. Verifies every incoming request is genuinely from QStash (via signed request headers, checked through `@upstash/qstash`'s `Receiver`) before doing anything — otherwise this endpoint would be a public, unauthenticated way to trigger arbitrary emails.

### Other decisions worth knowing about

- **Mongo transactions on signup.** User creation is wrapped in a session/transaction so a failure partway through (e.g. between creating the user and signing the JWT) can't leave a half-created account behind.
- **Workflow scheduling is decoupled from the subscription write.** If Upstash is briefly unreachable when a subscription is created, the subscription still saves successfully and the API still returns 201 — the user just won't get a `workflowRunId` back. A reminder workflow failing to *schedule* shouldn't make subscription creation fail; those are different failure domains.
- **Centralized error middleware** translates raw Mongoose/JWT errors (`CastError`, duplicate-key `11000`, `ValidationError`, `TokenExpiredError`, etc.) into consistent status codes and messages, instead of leaking driver-level error shapes to the client.
- **Known rough edge, left as-is on purpose:** the ownership check ("is this resource actually yours?") is implemented inline in four separate controller functions rather than pulled into a shared helper. It's correct everywhere it's used, just repetitive — I'm leaving it as a known refactor rather than fixing it preemptively, since I'd rather let the eventual test suite tell me whether it's actually worth extracting.

## Tech stack

| Layer | Choice |
|---|---|
| Runtime / framework | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcrypt |
| Background jobs | Upstash Workflow + QStash |
| Email | Nodemailer (Gmail SMTP) |
| Security | Arcjet (rate limiting, bot detection) |
| Deployment | Render |

## API reference

Base URL: `https://subtub-api.onrender.com/api/v1` (or `http://localhost:<PORT>/api/v1` locally)

All authenticated routes expect `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/auth/sign-up` | No | `{ name, email, password }` |
| POST | `/auth/sign-in` | No | `{ email, password }` |
| POST | `/auth/sign-out` | No | — |

### Users

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| GET | `/users/:id` | Yes | — |
| PUT | `/users/:id` | Yes | Fields to update |
| DELETE | `/users/:id` | Yes | — |

### Subscriptions

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| GET | `/subscriptions/upcoming-renewals` | Yes | — *(renewals in the next 7 days for the logged-in user)* |
| GET | `/subscriptions/user/:id` | Yes | — *(all subscriptions for user `:id`; must match the logged-in user)* |
| GET | `/subscriptions/:id` | Yes | — |
| POST | `/subscriptions` | Yes | `{ name, price, currency, frequency, category, paymentMethod, startDate, renewalDate? }` |
| PUT | `/subscriptions/:id` | Yes | Any of: `name, price, currency, frequency, category, paymentMethod, renewalDate` |
| PUT | `/subscriptions/:id/cancel` | Yes | — |
| DELETE | `/subscriptions/:id` | Yes | — |

`frequency`: `daily` \| `weekly` \| `monthly` \| `annually`
`category`: `sports` \| `news` \| `technology` \| `finance` \| `entertainment` \| `lifestyle` \| `politics` \| `others`
`currency`: `INR` \| `USD`

`renewalDate` is optional on create — if omitted, it's auto-calculated from `startDate` + `frequency`.

### Workflows (internal)

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/workflows/subscription/reminder` | QStash signature | Not meant to be called directly — triggered by Upstash when a reminder workflow run starts or wakes from sleep. |

## Running locally

```bash
git clone https://github.com/aanushkasaha/subtub.git
cd subtub
npm install
cp .env.example .env.development.local   # then fill in the values, see below
npm run dev
```

Note the filename: this project loads env vars from `.env.<NODE_ENV>.local` (e.g. `.env.development.local`), not a plain `.env`.

### Environment variables

See `.env.example` for the full list with comments. You'll need:
- A MongoDB connection string (e.g. from MongoDB Atlas)
- A JWT secret and expiry
- Arcjet API key (free tier works — [arcjet.com](https://arcjet.com))
- Upstash QStash token + signing keys (free tier works — [upstash.com](https://upstash.com))
- Gmail app password for Nodemailer (sender address is currently hardcoded in `config/nodemailer.js` — see "What I'd build next")

In development (`NODE_ENV=development`), Arcjet's bot-detection middleware is skipped, since it otherwise flags tools like Postman as bot traffic.

## What I'd build next

- Automated tests (currently manually verified via Postman — no test suite yet)
- CI on push (lint + tests via GitHub Actions)
- Move the hardcoded sender email in `config/nodemailer.js` into an env var, so the project isn't tied to one Gmail account
- Pagination on `GET /subscriptions/user/:id` for users with a large number of subscriptions
- Extract the repeated ownership-check logic in `subscription.controller.js` into a shared helper once tests make the duplication concretely annoying

## Background

This started as a guided build, then went through a full audit and bug-fixing pass on my own — nine separate bug categories (a wrong bcrypt package, a Mongoose 9 breaking change in `pre("save")` hooks no longer passing a `next()` callback, missing ownership checks on subscription routes, QStash signature verification, broken imports, and others), all fixed and re-verified via Postman before deploying to Render.
