import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getSubscription,
  getUpcomingRenewals,
  getUserSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

// Static routes first
subscriptionRouter.get("/upcoming-renewals", authorize, getUpcomingRenewals);
subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

// Dynamic routes after
subscriptionRouter.get("/:id", authorize, getSubscription);
subscriptionRouter.post("/", authorize, createSubscription);
subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);
subscriptionRouter.put("/:id", authorize, updateSubscription);
subscriptionRouter.delete("/:id", authorize, deleteSubscription);

export default subscriptionRouter;
