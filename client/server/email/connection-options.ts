import "server-only";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index";

if (!process.env.EMAIL_HOST) console.error("EMAIL_HOST environment variable not set!");
if (process.env.NODE_ENV === "production") {
  if (!process.env.EMAIL_USERNAME) console.error("EMAIL_USERNAME environment variable not set!");
  if (!process.env.EMAIL_PASSWORD) console.error("EMAIL_PASSWORD environment variable not set!");
}

export const nodemailerConnectionOptions: SMTPTransport.Options = {
  host: process.env.EMAIL_HOST,
  port: process.env.NODE_ENV === "production" ? 465 : 587,
  secure: process.env.NODE_ENV === "production", // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};
