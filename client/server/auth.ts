import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, genericOAuth, organization, username } from "better-auth/plugins";
import { C, HAS_CREDENTIAL_AUTH, HAS_GOOGLE_AUTH, HAS_WCA_AUTH } from "~/helpers/constants.ts";
import { getDefaultRegions } from "~/helpers/default-regions.ts";
import { getDefaultOrgSettings } from "~/helpers/default-settings.ts";
import { getHasRole } from "~/helpers/utilityFunctions.ts";
import { db } from "~/server/db/provider.ts";
import {
  accountsTable as accounts,
  invitationsTable as invitations,
  membersTable as members,
  organizationsTable as organizations,
  sessionsTable as sessions,
  usersTable as users,
  verificationsTable as verifications,
} from "~/server/db/schema/auth-schema.ts";
import { recordConfigsTable } from "~/server/db/schema/record-configs.ts";
import { regionsTable } from "~/server/db/schema/regions.ts";
import { settingsTable } from "~/server/db/schema/settings.ts";
import {
  sendAccountDeletedEmail,
  sendOrganizationInvitationEmail,
  sendPasswordChangedEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "~/server/email/mailer.ts";
import {
  admin as orgAdminRole,
  organizationAc,
  member as orgMemberRole,
  mod as orgModRole,
  owner as orgOwnerRole,
  videoBasedResultReviewer as orgVideoBasedResultReviewerRole,
} from "~/server/organization-permissions.ts";
import { ac, admin, user } from "~/server/permissions.ts";
import { logMessage } from "~/server/server-only-functions.ts";

if (!process.env.BETTER_AUTH_URL) console.error("BETTER_AUTH_URL environment variable not set!");
if (!process.env.BETTER_AUTH_SECRET) console.error("BETTER_AUTH_SECRET environment variable not set!");

// MAKE SURE TO UPDATE THE AUTH MOCK ACCORDINGLY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      sessions,
      accounts,
      verifications,
      organizations,
      members,
      invitations,
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
      // authClient has to match this
      ac,
      roles: { admin, user },
    }),
    organization({
      allowUserToCreateOrganization: (user) => getHasRole("admin", user.role), // this refers to the role in the admin plugin
      // authClient has to match this
      ac: organizationAc,
      roles: {
        owner: orgOwnerRole,
        admin: orgAdminRole,
        mod: orgModRole,
        videoBasedResultReviewer: orgVideoBasedResultReviewerRole,
        member: orgMemberRole,
      },
      cancelPendingInvitationsOnReInvite: true,
      membershipLimit: 1000, // TO-DO: THIS IS TEMPORARY!!!
      // requireEmailVerificationOnInvitation: TO-DO: MAKE THIS REQUIRED FOR CREDENTIALS AUTH!!!
      sendInvitationEmail: async (data) => {
        if (process.env.EMAIL_HOST)
          logMessage("RR0039", `Sending invitation to ${data.organization.name} to email ${data.email}`);

        sendOrganizationInvitationEmail(data.email, {
          organizationName: data.organization.name,
          organizationSlug: data.organization.slug,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          inviteLink: `${process.env.NEXT_PUBLIC_BASE_URL}/accept-invitation/${data.id}`,
        });
      },
      schema: {
        member: {
          additionalFields: {
            personId: {
              type: "number",
              required: false,
              unique: true,
              input: false,
            },
          },
        },
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization }) => {
          await db.insert(regionsTable).values(getDefaultRegions(organization.id));

          await db.insert(settingsTable).values(getDefaultOrgSettings(organization.id));

          const recordTypeValues = ["WR", "ER", "NAR", "SAR", "AsR", "AfR", "OcR", "NR"];
          for (let i = 0; i < recordTypeValues.length; i++) {
            const recordTypeId = recordTypeValues[i];
            await db.insert(recordConfigsTable).values([
              {
                organizationId: organization.id,
                recordTypeId,
                category: "competitions",
                label: recordTypeId,
                rank: (i + 1) * 10,
                color:
                  recordTypeId === "WR" ? C.color.danger : recordTypeId === "NR" ? C.color.success : C.color.warning,
              },
              {
                organizationId: organization.id,
                recordTypeId,
                category: "meetups",
                label: `M${recordTypeId}`,
                rank: 100 + (i + 1) * 10,
                color:
                  recordTypeId === "WR" ? C.color.danger : recordTypeId === "NR" ? C.color.success : C.color.warning,
              },
              {
                organizationId: organization.id,
                recordTypeId,
                category: "online",
                label: `O${recordTypeId}`,
                rank: 200 + (i + 1) * 10,
                color:
                  recordTypeId === "WR" ? C.color.danger : recordTypeId === "NR" ? C.color.success : C.color.warning,
              },
            ]);
          }
        },
      },
    }),
    genericOAuth({
      config: [
        HAS_WCA_AUTH
          ? {
              providerId: "wca",
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
  socialProviders: {
    google: HAS_GOOGLE_AUTH
      ? {
          prompt: "select_account",
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }
      : undefined,
  },
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
      enabled: false,
    },
  },
});
