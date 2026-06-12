import { workflowClient } from "../config/upstash.js";
import Subscription from "../models.subscription.model.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (error) {
    next(error);
  }
};
export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }
    //check if the user is the same as the one in token.
    const subscriptions = await Subscription.find({ user: req.params.id });

    return res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }
    if (req.user.id !== subscription.user.toString()) {
      const error = new Error("you are not the owner of this subscription");
      error.status = 402;
      throw error;
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user.id) {
      const error = new Error("You are not the owner of this subscription");
      error.status = 401;
      throw error;
    }

    const allowedFields = [
      "name",
      "price",
      "currency",
      "frequency",
      "category",
      "paymentMethod",
      "renewalDate",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Subscription.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user.id) {
      const error = new Error("You are not the owner of this subscription");
      error.status = 401;
      throw error;
    }

    await Subscription.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ success: true, message: "Subscription deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user.id) {
      const error = new Error("You are not the owner of this subscription");
      error.status = 401;
      throw error;
    }

    if (subscription.status === "cancelled") {
      const error = new Error("Subscription is already cancelled");
      error.status = 400;
      throw error;
    }

    subscription.status = "cancelled";
    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const subscriptions = await Subscription.find({
      user: req.user.id,
      status: "active",
      renewalDate: { $gte: today, $lte: sevenDaysFromNow },
    }).sort({ renewalDate: 1 });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};
