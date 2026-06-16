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
