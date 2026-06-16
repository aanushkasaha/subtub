import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters."],
      maxlength: [50, "Name cannot exceed 50 characters."],
    },

    email: {
      type: String,
      required: [true, "User email is required."],
      unique: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address."],
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "User password is required."],
      minlength: [6, "Password must be at least 6 characters."],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
