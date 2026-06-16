import User from "../models/User.models.js";

//fetch all users from the database.
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

//fetch a sigular user from the database.
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); //passwod hatake sab field chahiye.
    //user isnt found.
    if (!user) {
      const error = new Error("User Not Found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

import User from "../models/User.models.js";
import bcrypt from "bcryptjs";

export const updateUser = async (req, res, next) => {
  try {
    // Only allow a user to update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own account." });
    }

    const { name, email, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase().trim();
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters." });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update." });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Only allow a user to delete their own account
    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    next(error);
  }
};
