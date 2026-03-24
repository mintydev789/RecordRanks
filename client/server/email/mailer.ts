import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadEnvConfig } from "@next/env";
import Handlebars from "handlebars";
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer/index";
import { Countries } from "~/helpers/Countries.ts";
import { C, IS_CUBING_CONTESTS_INSTANCE } from "~/helpers/constants.ts";
import { videoBasedFormats } from "~/helpers/roundFormats.ts";
import { getFormattedTime, getIsCompType, getIsUrgent } from "~/helpers/utilityFunctions.ts";
import type { SelectContest } from "~/server/db/schema/contests.ts";
import { type LogCode, LogCodes } from "~/server/logger.ts";
import { rolesObject } from "~/server/permissions.ts";
import { logMessage } from "~/server/serverOnlyFunctions.ts";
import type { SelectEvent } from "../db/schema/events.ts";
import type { ResultResponse } from "../db/schema/results.ts";

// This is needed when running Better Auth DB migrations
if (process.env.NODE_ENV !== "production") loadEnvConfig(process.cwd(), true);

if (!process.env.PROD_HOSTNAME) console.error("PROD_HOSTNAME environment variable not set!");
if (!process.env.NEXT_PUBLIC_BASE_URL) console.error("NEXT_PUBLIC_BASE_URL environment variable not set!");
if (!process.env.NEXT_PUBLIC_CONTACT_EMAIL) console.error("NEXT_PUBLIC_CONTACT_EMAIL environment variable not set!");
if (!process.env.EMAIL_USERNAME) console.error("EMAIL_USERNAME environment variable not set!");
if (!process.env.EMAIL_PASSWORD) console.error("EMAIL_PASSWORD environment variable not set!");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.NODE_ENV === "production" ? 465 : 587,
  secure: process.env.NODE_ENV === "production", // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const noReplyEmail: Mail.Address = {
  name: "No Reply",
  address: `no-reply@${process.env.PROD_HOSTNAME}`,
};
const adminEmail: Mail.Address = {
  name: "Admin",
  address: process.env.NEXT_PUBLIC_CONTACT_EMAIL!,
};
const contestsEmail: Mail.Address = {
  name: "Contests",
  address: `contests@${process.env.PROD_HOSTNAME}`,
};
const resultsEmail: Mail.Address = {
  name: "Results",
  address: `results@${process.env.PROD_HOSTNAME}`,
};
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME!;

async function send({
  templateFileName = "default.hbs",
  context,
  callback,
}: {
  templateFileName?: string;
  context: Record<string, string | number | boolean>;
  callback: (html: string) => Promise<void>;
}) {
  if (process.env.VITEST) return;
  if (!process.env.EMAIL_HOST) {
    if (process.env.NODE_ENV === "production")
      console.warn("Warning: Not sending email, because EMAIL_HOST environment variable isn't set!");
    return;
  }

  try {
    const currFilePath = import.meta.url.replace(/^file:/, "");
    const templateContents = await readFile(join(currFilePath, "../templates", templateFileName), "utf-8");
    const template = Handlebars.compile(templateContents, { strict: true });
    const html = template(context);

    await callback(html);
  } catch (err) {
    logMessage("RR5001", `Error while sending email with template ${templateFileName}: ${err}`);
  }
}

/////////////////////
// Email functions //
/////////////////////

export function sendEmail(to: string, subject: string, content: string) {
  send({
    context: {
      projectName,
      content,
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: noReplyEmail,
        to,
        subject,
        html,
      });
    },
  });
}

export function sendErrorEmail(to: string, errorCode: LogCode, errorMessage: string) {
  send({
    templateFileName: "error.hbs",
    context: {
      projectName,
      errorMessage,
      errorCode,
      errorCodeDescription: LogCodes[errorCode],
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: noReplyEmail,
        to,
        subject: "Website error",
        html,
      });
    },
  });
}

export function sendVerificationEmail(to: string, url: string) {
  send({
    templateFileName: "email-verification.hbs",
    context: {
      baseUrl,
      projectName,
      verificationLink: url,
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: noReplyEmail,
        to,
        subject: "Email verification",
        html,
      });
    },
  });
}

export function sendResetPasswordEmail(to: string, url: string) {
  send({
    templateFileName: "password-reset-request.hbs",
    context: {
      baseUrl,
      projectName,
      passwordResetLink: url,
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: noReplyEmail,
        to,
        subject: "Password reset",
        html,
      });
    },
  });
}

export function sendPasswordChangedEmail(to: string) {
  send({
    templateFileName: "password-changed.hbs",
    context: {
      baseUrl,
      projectName,
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: noReplyEmail,
        to,
        subject: "Password change successful",
        html,
      });
    },
  });
}

export function sendAccountDeletedEmail(to: string) {
  send({
    templateFileName: "account-deleted.hbs",
    context: {
      baseUrl,
      projectName,
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: noReplyEmail,
        to,
        subject: "Account deleted",
        html,
      });
    },
  });
}

export function sendRolesChangedEmail(
  to: string,
  roles: string[],
  { canAccessModDashboard }: { canAccessModDashboard: boolean },
) {
  send({
    templateFileName: "roles-changed.hbs",
    context: {
      baseUrl,
      projectName,
      roles: roles.map((r) => (rolesObject as any)[r]).join(", "),
      canAccessModDashboard,
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: noReplyEmail,
        to,
        subject: "Roles changed",
        html,
      });
    },
  });
}

export function sendContestSubmittedEmail(recipients: string[], contest: SelectContest, creator: string) {
  const urgent = getIsUrgent(new Date(contest.startDate));

  send({
    templateFileName: "contest-submitted.hbs",
    context: {
      baseUrl,
      projectName,
      competitionId: contest.competitionId,
      wcaCompetition: contest.type === "wca-comp",
      contestName: contest.name,
      contestUrl: `${baseUrl}/competitions/${contest.competitionId}`,
      creator,
      startDate: contest.startDate.toDateString(),
      location: `${contest.city}, ${Countries.find((c) => c.code === contest.regionCode)?.name ?? "NOT FOUND"}`,
      urgent,
    },
    callback: async (html) => {
      const subject = `${urgent ? "Urgent: " : ""}Contest submitted: ${contest.shortName}`;

      if (recipients.length > 0) {
        await transporter.sendMail({
          from: contestsEmail,
          replyTo: adminEmail,
          to: recipients,
          bcc: adminEmail,
          subject,
          html,
          priority: urgent ? "high" : "normal",
        });
      } else {
        await transporter.sendMail({
          from: contestsEmail,
          to: adminEmail,
          subject,
          html,
          priority: urgent ? "high" : "normal",
        });
      }
    },
  });
}

export function sendContestApprovedEmail(
  to: string,
  contest: Pick<SelectContest, "competitionId" | "name" | "shortName">,
) {
  send({
    templateFileName: "contest-approved.hbs",
    context: {
      projectName,
      contestName: contest.name,
      contestUrl: `${baseUrl}/competitions/${contest.competitionId}`,
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: contestsEmail,
        to,
        subject: `Contest approved: ${contest.shortName}`,
        html,
      });
    },
  });
}

export function sendContestFinishedEmail(
  recipients: string[],
  contest: Pick<SelectContest, "competitionId" | "name" | "shortName" | "type" | "participants">,
  creator: string,
) {
  const duesAmount = IS_CUBING_CONTESTS_INSTANCE ? C.duePerCompetitor * contest.participants : 0;

  send({
    templateFileName: "contest-finished.hbs",
    context: {
      baseUrl,
      projectName,
      contestName: contest.name,
      contestUrl: `${baseUrl}/competitions/${contest.competitionId}`,
      creator,
      duesAmount: getIsCompType(contest.type) && duesAmount >= 1 ? duesAmount.toFixed(2) : "",
      isUnofficialCompetition: contest.type === "comp",
    },
    callback: async (html) => {
      const subject = `Contest finished: ${contest.shortName}`;

      if (recipients.length > 0) {
        await transporter.sendMail({
          from: contestsEmail,
          replyTo: adminEmail,
          to: recipients,
          bcc: adminEmail,
          subject,
          html,
        });
      } else {
        await transporter.sendMail({
          from: contestsEmail,
          to: adminEmail,
          subject,
          html,
        });
      }
    },
  });
}

export function sendContestPublishedEmail(
  to: string,
  contest: Pick<SelectContest, "competitionId" | "name" | "shortName">,
) {
  send({
    templateFileName: "contest-published.hbs",
    context: {
      projectName,
      contestName: contest.name,
      contestUrl: `${baseUrl}/competitions/${contest.competitionId}`,
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: contestsEmail,
        to,
        subject: `Contest published: ${contest.shortName}`,
        html,
      });
    },
  });
}

export function sendVideoBasedResultSubmittedEmail(
  to: string,
  videoBasedResultsContactEmail: string | null,
  event: SelectEvent,
  result: ResultResponse,
  creatorName: string,
  creatorPersonName: string | undefined,
) {
  send({
    templateFileName: "video-based-result-submitted.hbs",
    context: {
      baseUrl,
      projectName,
      eventName: event.name,
      roundFormat: videoBasedFormats.find((rf) => rf.attempts === result.attempts.length)!.label,
      best:
        getFormattedTime(result.best, { event, showMultiPoints: true }) +
        (result.regionalSingleRecord ? ` (${result.regionalSingleRecord})` : ""),
      average:
        result.average !== 0
          ? getFormattedTime(result.average, { event }) +
            (result.regionalAverageRecord ? ` (${result.regionalAverageRecord})` : "")
          : "",
      videoLink: result.videoLink!,
      discussionLink: result.discussionLink ?? "",
      creatorName,
      creatorPersonName: creatorPersonName ?? "",
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: resultsEmail,
        replyTo: videoBasedResultsContactEmail ?? adminEmail,
        to,
        bcc: videoBasedResultsContactEmail ?? adminEmail,
        subject: `Result submitted: ${event.name}`,
        html,
      });
    },
  });
}

export function sendVideoBasedResultApprovedEmail(to: string, event: SelectEvent) {
  send({
    templateFileName: "video-based-result-approved.hbs",
    context: {
      baseUrl,
      projectName,
      eventId: event.eventId,
      eventName: event.name,
    },
    callback: async (html) => {
      await transporter.sendMail({
        from: resultsEmail,
        to,
        subject: `Result approved`,
        html,
      });
    },
  });
}
