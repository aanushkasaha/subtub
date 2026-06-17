import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/user.controllers.js";
import authorize from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.get("/:id", authorize, getUser);
userRouter.put("/:id", authorize, updateUser);
userRouter.delete("/:id", authorize, deleteUser);

export default userRouter;
