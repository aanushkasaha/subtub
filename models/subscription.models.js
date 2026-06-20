import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Subscription name is required."],
      maxlength: [100, "Name cannot exceed 100 characters."],
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required."],
      min: [0, "Price cannot be negative."],
    },
    currency: {
      type: String,
      required: [true, "Currency is required."],
      enum: ["INR", "USD"],
      default: "INR",
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required."],
      enum: ["daily", "weekly", "monthly", "annually"],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      enum: [
        "sports",
        "news",
        "technology",
        "finance",
        "entertainment",
        "lifestyle",
        "politics",
        "others",
      ],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required."],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required."],
      validate: {
        validator: (val) => val <= new Date(),
        message: "Start date must not be in the future.",
      },
    },
    renewalDate: {
      type: Date, // not required — pre-save hook calculates it
      validate: {
        validator: function (val) {
          return val > this.startDate;
        },
        message: "Renewal date must be after start date.",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
      index: true,
    },
  },
  { timestamps: true },
);

// Mongoose 9 no longer passes a next() callback to pre("save") hooks —
// the first argument is now the save() call's options object instead.
// A plain (non-callback) function just needs to finish; no next() needed.
subscriptionSchema.pre("save", function () {
  // Auto-calculate renewalDate from frequency
  if (!this.renewalDate) {
    const date = new Date(this.startDate);

    switch (this.frequency) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "annually":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    this.renewalDate = date;
  }

  // Auto-expire if renewal date has passed
  if (this.renewalDate < new Date() && this.status === "active") {
    this.status = "expired";
  }
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
