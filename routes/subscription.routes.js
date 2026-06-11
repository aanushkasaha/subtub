import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import {
  createSubscription,
  getUserSubscriptions,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => {
  res.send({ message: "Fetch all subscriptions." });
});

subscriptionRouter.get("/:id", (req, res) => {
  res.send({ message: "Fetch subscription." });
});

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id", (req, res) => {
  res.send({ message: "Update subscription." });
});

subscriptionRouter.delete("/:id", (req, res) => {
  res.send({ message: "Delete subscription." });
});

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

subscriptionRouter.put("/:id/cancel", (req, res) => {
  res.send({ message: "Cancel subscription." });
});

subscriptionRouter.get("/upcoming-renewals", (req, res) => {
  res.send({ message: "Fetch all upcoming renewals." });
});

export default subscriptionRouter;
