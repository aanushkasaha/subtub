import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      maxLength: 20,
    },

    email: {
      type: String,
      required: [true, "User email is required"],
      unique: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "User password is required"],
      minLength: 6,
    },
  },
  { timestamps: true },
);

const user = mongoose.model("User", userSchema);
export default user;
