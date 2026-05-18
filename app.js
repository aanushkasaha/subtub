import express from "express";
const app = express();
app.get("/", (req, res) => {
  res.send("Welcome to subtub: Your favourite Subscription Tracker API");
});
app.listen(3000, () => {
  console.log("Subscription Tracker API is running on port 3000");
});

export default app;
