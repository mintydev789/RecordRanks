import "server-only";
import { betterAuth, type SocialProviders } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin as adminPlugin,
  type GenericOAuthConfig,
  genericOAuth,
  organization,
  testUtils,
  username,
} from "better-auth/plugins";
import { dbMock as db } from "~/__mocks__/db-mock.ts";
import { regionsTable, settingsTable } from "~/__mocks__/db-schema.ts";
import { HAS_CREDENTIAL_AUTH, HAS_GOOGLE_AUTH, HAS_WCA_AUTH } from "~/helpers/constants.ts";
import { getDefaultRegions } from "~/helpers/default-regions.ts";
import { getDefaultOrgSettings } from "~/helpers/default-settings.ts";
import { getHasRole } from "~/helpers/utility-functions.ts";
import {
  accountsTable as accounts,
  invitationsTable as invitations,
  membersTable as members,
  organizationsTable as organizations,
  sessionsTable as sessions,
  usersTable as users,
  verificationsTable as verifications,
} from "~/server/db/schema/auth-schema.ts";
import {
  admin as orgAdminRole,
  organizationAc,
  member as orgMemberRole,
  mod as orgModRole,
  owner as orgOwnerRole,
  videoBasedResultReviewer as orgVideoBasedResultReviewerRole,
} from "~/server/organization-permissions.ts";
import { ac, admin, user } from "~/server/permissions.ts";

export const authMock = betterAuth({
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
    testUtils(),
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
      requireEmailVerificationOnInvitation: true,
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
          await db.transaction(async (tx) => {
            await tx.insert(regionsTable).values(getDefaultRegions(organization.id));

            await tx.insert(settingsTable).values(getDefaultOrgSettings(organization.id));
          });
        },
      },
    }),
    genericOAuth({
      config: [
        HAS_WCA_AUTH
          ? ({
              providerId: "wca",
              clientId: process.env.WCA_OAUTH_CLIENT_ID!,
              clientSecret: process.env.WCA_OAUTH_SECRET,
              discoveryUrl: "https://www.worldcubeassociation.org/.well-known/openid-configuration",
              // issuer: "https://www.worldcubeassociation.org",
              // requireIssuerValidation: true, // the WCA doesn't support this
              mapProfileToUser: async (profile) => ({ ...profile, emailVerified: true }),
              scopes: ["public", "openid", "email", "profile"],
            } satisfies GenericOAuthConfig)
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
  } satisfies SocialProviders,
  emailAndPassword: {
    enabled: HAS_CREDENTIAL_AUTH,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {},
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
    },
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
});
