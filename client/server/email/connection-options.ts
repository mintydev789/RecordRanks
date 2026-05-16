import "server-only";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index";

if (!process.env.EMAIL_HOST) console.error("EMAIL_HOST environment variable not set!");
if (!process.env.EMAIL_PORT) console.error("EMAIL_PORT environment variable not set!");
if (process.env.NODE_ENV === "production") {
  if (!process.env.EMAIL_USERNAME) console.error("EMAIL_USERNAME environment variable not set!");
  if (!process.env.EMAIL_PASSWORD) console.error("EMAIL_PASSWORD environment variable not set!");
}

const port = Number(process.env.EMAIL_PORT);

export const nodemailerConnectionOptions: SMTPTransport.Options = {
  host: process.env.EMAIL_HOST,
  port,
  secure: port === 465,
  auth:
    process.env.NODE_ENV === "production" || process.env.EMAIL_USERNAME
      ? {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        }
      : undefined,
};
