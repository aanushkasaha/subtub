import express from "express";
import { PORT, NODE_ENV } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import connect_db from "./database/mongodb.js";
import errorMiddleware from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Arcjet's bot detection flags tools like Postman as bots, which is
// useful in production (real attack traffic) but just friction during
// local development/testing. Skip it in development, keep it everywhere else.
if (NODE_ENV !== "development") {
  app.use(arcjetMiddleware);
}

app.get("/", (req, res) => {
  res.send("Welcome to subtub: Your favourite Subscription Tracker API");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connect_db();
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Subscription Tracker API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
