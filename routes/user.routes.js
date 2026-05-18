import { Router } from "express";
const userRouter = Router();

// /users ----> static parameter, always gonna look like this.
// /:id -----> dynamic parameters, gonna change depending on the id.

userRouter.get("/", (req, res) => {
  res.send({ message: "Fetch All Users" });
});

userRouter.get("/:id", (req, res) => {
  res.send({ message: "Fetch User Details" });
});

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
