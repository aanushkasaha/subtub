import Subscription from "../models/subscription.models.js";
import dayjs from "dayjs"; //lightweight package for manipulating date type shi.

//module only allows import, not const require type shi.
//so manually require karwaya hai, zyaada kam lmao.

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { serve } = require("@upstash/workflow/express"); //upstash was written in common vanilla js, so import modules wont work.

const REMINDERS = [7, 5, 2, 1]; //kitne din baad baad reminder bhejna hai.

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") return;

  const renewalDate = dayjs(subscription.renewalDate);
  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date has been passed for ${subscriptionId}. Stopping workflow.`,
    );
    return;
  }
  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");
    //lets say renewal date: 22nd feb,
    //reminder dates are: 15th, 17th, 20th, 21st of feb.
    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `Reminder ${daysBefore} days before`,
        reminderDate,
      ); //label is the second parameter.
      await triggerReminder(context, `Reminder ${daysBefore} days before`);
    }
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping ntil ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label) => {
  return await context.run(label, () => {
    console.log(`Triggering ${label} reminder...`);
    //right now its console.log() but it can be anything, email, sms, legit kuch bhi ho sakta hai.
  });
};
