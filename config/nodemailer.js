import nodemailer from "nodemailer";
import { EMAIL_PASSWORD } from "./env";

export const accountEmail = "aanushka.applies@gmail.com";
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: accountEmail,
    pass: EMAIL_PASSWORD,
  },
});
