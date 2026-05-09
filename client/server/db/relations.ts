import "server-only";
import { defineRelations } from "drizzle-orm";
import { accessTokensTable as accessTokens } from "~/server/db/schema/access-tokens.ts";
import { postsTable as posts } from "~/server/db/schema/posts.ts";
import { settingsTable as settings } from "~/server/db/schema/settings.ts";
import {
  accountsTable as accounts,
  invitationsTable as invitations,
  membersTable as members,
  organizationsTable as organizations,
  sessionsTable as sessions,
  usersTable as users,
  verificationsTable as verifications,
} from "./schema/auth-schema.ts";
import { collectiveSolutionsTable as collectiveSolutions } from "./schema/collective-solutions.ts";
import { contestsTable as contests } from "./schema/contests.ts";
import { eventsTable as events } from "./schema/events.ts";
import { memberRequestsTable as memberRequests } from "./schema/member-requests.ts";
import { personsTable as persons } from "./schema/persons.ts";
import { recordConfigsTable as recordConfigs } from "./schema/record-configs.ts";
import { regionsTable as regions } from "./schema/regions.ts";
import { resultsTable as results } from "./schema/results.ts";
import { roundsTable as rounds } from "./schema/rounds.ts";

export const relations = defineRelations(
  {
    // Better Auth relations
    users,
    sessions,
    accounts,
    verifications,
    organizations,
    members,
    invitations,

    // RecordRanks relations
    memberRequests,
    events,
    contests,
    accessTokens,
    rounds,
    results,
    persons,
    regions,
    recordConfigs,
    collectiveSolutions,
    posts,
    settings,
  },
  (r) => ({
    // Better Auth relations
    users: {
      sessions: r.many.sessions(),
      accounts: r.many.accounts(),
      members: r.many.members(),
      invitations: r.many.invitations(),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
        optional: false,
      }),
    },
    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
        optional: false,
      }),
    },
    verifications: {},
    organizations: {
      members: r.many.members(),
      invitations: r.many.invitations(),
    },
    members: {
      organization: r.one.organizations({
        from: r.members.organizationId,
        to: r.organizations.id,
        optional: false,
      }),
      user: r.one.users({
        from: r.members.userId,
        to: r.users.id,
        optional: false,
      }),
      person: r.one.persons({
        from: r.members.personId,
        to: r.persons.id,
      }),
    },
    invitations: {
      organization: r.one.organizations({
        from: r.invitations.organizationId,
        to: r.organizations.id,
        optional: false,
      }),
      inviter: r.one.users({
        from: r.invitations.inviterId,
        to: r.users.id,
        optional: false,
      }),
    },

    // RecordRanks relations
    memberRequests: {
      member: r.one.members({
        from: r.memberRequests.memberId,
        to: r.members.id,
        optional: false,
      }),
      requestedPerson: r.one.persons({
        from: r.memberRequests.requestedPersonId,
        to: r.persons.id,
      }),
    },
    events: {},
    contests: {
      region: r.one.regions({
        from: r.contests.regionCode,
        to: r.regions.code,
        optional: false,
      }),
      rounds: r.many.rounds(),
      // Relevant issue: https://github.com/drizzle-team/drizzle-orm/issues/4988
      // organizers: r.many.persons({
      //   from: r.contests.organizerIds,
      //   to: r.persons.id,
      // }),
      accessToken: r.one.accessTokens(),
      creator: r.one.users({
        from: r.contests.createdBy,
        to: r.users.id,
      }),
    },
    accessTokens: {
      contest: r.one.contests({
        from: r.accessTokens.competitionId,
        to: r.contests.competitionId,
        optional: false,
      }),
      creator: r.one.users({
        from: r.accessTokens.createdBy,
        to: r.users.id,
      }),
    },
    rounds: {
      contest: r.one.contests({
        from: r.rounds.competitionId,
        to: r.contests.competitionId,
        optional: false,
      }),
      event: r.one.events({
        from: r.rounds.eventId,
        to: r.events.eventId,
        optional: false,
      }),
      results: r.many.results(),
    },
    results: {
      event: r.one.events({
        from: r.results.eventId,
        to: r.events.eventId,
        optional: false,
      }),
      // persons: r.many.persons({
      //   from: r.results.personIds,
      //   to: r.persons.id,
      //   where: { id: { in: r.results.personIds } },
      // }),
      region: r.one.regions({
        from: r.results.regionCode,
        to: r.regions.code,
      }),
      contest: r.one.contests({
        from: r.results.competitionId,
        to: r.contests.competitionId,
      }),
      round: r.one.rounds({
        from: r.results.roundId,
        to: r.rounds.id,
      }),
      creator: r.one.users({
        from: r.results.createdBy,
        to: r.users.id,
      }),
    },
    persons: {
      region: r.one.regions({
        from: r.persons.regionCode,
        to: r.regions.code,
        optional: false,
      }),
      member: r.one.members(),
      creator: r.one.users({
        from: r.persons.createdBy,
        to: r.users.id,
      }),
    },
    regions: {},
    recordConfigs: {},
    collectiveSolutions: {
      event: r.one.events({
        from: r.collectiveSolutions.eventId,
        to: r.events.eventId,
        optional: false,
      }),
      lastUserWhoInteracted: r.one.users({
        from: r.collectiveSolutions.lastUserWhoInteractedId,
        to: r.users.id,
      }),
    },
    posts: {
      author: r.one.users({
        from: r.posts.createdBy,
        to: r.users.id,
      }),
    },
    settings: {},
  }),
);
