import "server-only";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index";

if (!process.env.EMAIL_HOST) console.error("EMAIL_HOST environment variable not set!");
if (!process.env.EMAIL_PORT) console.error("EMAIL_PORT environment variable not set!");
if (process.env.NODE_ENV === "production") {
  if (!process.env.EMAIL_USERNAME) console.error("EMAIL_USERNAME environment variable not set!");
  if (!process.env.EMAIL_PASSWORD) console.error("EMAIL_PASSWORD environment variable not set!");
}

export const nodemailerConnectionOptions: SMTPTransport.Options = {
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.NODE_ENV === "production", // Use true for port 465, false for port 587
  auth:
    process.env.NODE_ENV === "production" || process.env.EMAIL_USERNAME
      ? {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        }
      : undefined,
};
