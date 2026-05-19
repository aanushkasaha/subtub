import { Router } from "express";
const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => {
  res.send({ message: "Fetch all subscriptions." });
});

subscriptionRouter.get("/:id", (req, res) => {
  res.send({ message: "Fetch subscription." });
});

subscriptionRouter.post("/:id", (req, res) => {
  res.send({ message: "Create subscription." });
});

subscriptionRouter.put("/:id", (req, res) => {
  res.send({ message: "Update subscription." });
});

subscriptionRouter.delete("/:id", (req, res) => {
  res.send({ message: "Delete subscription." });
});

subscriptionRouter.get("/user/:id", (req, res) => {
  res.send({ message: "Fetch all user subscription." });
});

subscriptionRouter.put("/:id/cancel", (req, res) => {
  res.send({ message: "Cancel subscription." });
});

subscriptionRouter.get("/upcoming-renewals", (req, res) => {
  res.send({ message: "Fetch all upcoming renewals." });
});

export default subscriptionRouter;
