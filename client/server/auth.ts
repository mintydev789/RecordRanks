import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, genericOAuth, username } from "better-auth/plugins";
import { C, HAS_CREDENTIAL_AUTH, HAS_WCA_AUTH } from "~/helpers/constants.ts";
import { db } from "~/server/db/provider.ts";
import {
  accountsTable as accounts,
  sessionsTable as sessions,
  usersTable as users,
  verificationsTable as verifications,
} from "~/server/db/schema/auth-schema.ts";
import {
  sendAccountDeletedEmail,
  sendPasswordChangedEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "~/server/email/mailer.ts";
import { ac, admin, mod, user, videoBasedResultReviewer } from "~/server/permissions.ts";
import { logMessage } from "~/server/serverOnlyFunctions.ts";

if (!process.env.BETTER_AUTH_URL) console.error("BETTER_AUTH_URL environment variable not set!");
if (!process.env.BETTER_AUTH_SECRET) console.error("BETTER_AUTH_SECRET environment variable not set!");

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      sessions,
      accounts,
      verifications,
    },
    usePlural: true,
  }),
  plugins: [
    nextCookies(),
    username({
      maxUsernameLength: 40,
      usernameValidator: (username) => /^[0-9a-zA-Z-_.]*$/.test(username),
    }),
    adminPlugin({
      ac,
      roles: { admin, mod, videoBasedResultReviewer, user },
    }),
    genericOAuth({
      config: [
        HAS_WCA_AUTH
          ? {
              providerId: C.wcaOAuthProviderId,
              clientId: process.env.WCA_OAUTH_CLIENT_ID!,
              clientSecret: process.env.WCA_OAUTH_SECRET,
              discoveryUrl: "https://www.worldcubeassociation.org/.well-known/openid-configuration",
              // issuer: "https://www.worldcubeassociation.org",
              // requireIssuerValidation: true, // the WCA doesn't support this
              scopes: ["public", "openid", "email", "profile"],
            }
          : undefined,
      ].filter((provider) => provider !== undefined),
    }),
  ],
  emailAndPassword: {
    enabled: HAS_CREDENTIAL_AUTH,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.EMAIL_HOST) logMessage("RR0031", `Sending reset password email for user with ID ${user.id}`);

      sendResetPasswordEmail(user.email, url);
    },
    onPasswordReset: async ({ user }) => {
      if (process.env.EMAIL_HOST) logMessage("RR0032", `Sending password changed email for user with ID ${user.id}`);

      sendPasswordChangedEmail(user.email);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (process.env.EMAIL_HOST) logMessage("RR0030", `Sending verification email for new user with ID ${user.id}`);

      sendVerificationEmail(user.email, url);
    },
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        unique: true,
      },
      personId: {
        type: "number",
        required: false,
        unique: true,
      },
    },
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        if (process.env.EMAIL_HOST) logMessage("RR0036", `Sending user deleted email for user with ID ${user.id}`);

        sendAccountDeletedEmail(user.email);
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      disableImplicitLinking: true,
      allowDifferentEmails: false,
      // updateUserInfoOnLink: true, // this doesn't work https://github.com/better-auth/better-auth/issues/8742
    },
  },
});
