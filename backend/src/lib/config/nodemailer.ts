import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const { EMAIL_USER, EMAIL_PASS } = process.env;

if (!EMAIL_USER) {
  console.error(
    "Nodemailer Config Error:EMAIL_USER is not defined in environment variables."
  );
  throw new Error("Server configuration error: EMAIL_USER missing.");
}

if (!EMAIL_PASS) {
  console.error(
    "Nodemailer Config Error:EMAIL_PASS is not defined in environment variables."
  );
  throw new Error("Server configuration error: EMAIL_PASS missing.");
}

export const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
