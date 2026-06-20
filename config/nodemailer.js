import nodemailer from "nodemailer";
import { EMAIL_PASSWORD } from "./env.js"; // add .js extension for ESM resolution

export const accountEmail = "aanushka.applies@gmail.com";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: accountEmail,
    pass: EMAIL_PASSWORD,
  },
  family: 4,
});

// Verify connection at startup
transporter.verify((error) => {
  if (error) {
    console.error("Mail transporter error:", error);
  } else {
    console.log("Mail transporter ready");
  }
});
