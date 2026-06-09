import { Router } from "express";
import { getUser, getUsers } from "../controllers/user.controllers";
import authorize from "../middleware/auth.middleware";
const userRouter = Router();

// /users ----> static parameter, always gonna look like this.
// /:id -----> dynamic parameters, gonna change depending on the id.

userRouter.get("/", getUsers);

userRouter.get("/:id", authorize, getUser);

userRouter.post("/", (req, res) => {
  res.send({ message: "Create A New User" });
});

userRouter.put("/:id", (req, res) => {
  res.send({ message: "Update User" });
});

userRouter.delete("/:id", (req, res) => {
  res.send({ message: "Delete User" });
});

export default userRouter;
