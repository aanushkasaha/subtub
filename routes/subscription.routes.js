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

subscriptionRouter.get("/:id", authorize, getSubscription);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id", authorize, updateSubscription);

subscriptionRouter.delete("/:id", authorize, deleteSubscription);

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);

subscriptionRouter.get("/upcoming-renewals", authorize, getUpcomingRenewals);

export default subscriptionRouter;
