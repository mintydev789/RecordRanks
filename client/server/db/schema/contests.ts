import "server-only";
import { getColumns, sql } from "drizzle-orm";
import { check, integer, jsonb, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { C } from "~/helpers/constants.ts";
import type { Schedule } from "~/helpers/types/Schedule.ts";
import { ContestStateValues, ContestTypeValues } from "~/helpers/types.ts";
import { tableTimestamps } from "~/server/db/dbUtils.ts";
import { regionsTable } from "~/server/db/schema/regions.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";
import { usersTable } from "./auth-schema.ts";

export const contestStateEnum = rrSchema.enum("contest_state", ContestStateValues);
export const contestTypeEnum = rrSchema.enum("contest_type", ContestTypeValues);

export const contestsTable = rrSchema.table(
  "contests",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    competitionId: text().notNull().unique(),
    state: contestStateEnum().default("created").notNull(),
    name: text().notNull(),
    shortName: varchar({ length: C.maxContestShortName }).notNull(),
    type: contestTypeEnum().notNull(),
    regionCode: varchar({ length: 2 }).references(() => regionsTable.code, { onUpdate: "cascade" }),
    city: text(),
    venue: text(),
    address: text(),
    latitudeMicrodegrees: integer(),
    longitudeMicrodegrees: integer(),
    startDate: timestamp().notNull(),
    endDate: timestamp().notNull(),
    startTime: timestamp(), // only used for meetups
    timezone: text(), // only used for meetups
    organizerIds: integer().array().notNull(),
    contact: text(),
    description: text(),
    competitorLimit: integer(),
    participants: integer().default(0).notNull(),
    schedule: jsonb().$type<Schedule>(), // not used for meetups
    adminNotes: text(),
    createdBy: text().references(() => usersTable.id, { onDelete: "set null" }), // this can be null if the user has been deleted
    ...tableTimestamps,
  },
  (table) => [
    check(
      "contests_comp_check",
      sql`(${table.type} <> 'comp' AND ${table.type} <> 'wca-comp')
        OR (${table.regionCode} IS NOT NULL
          AND ${table.city} IS NOT NULL
          AND ${table.venue} IS NOT NULL
          AND ${table.address} IS NOT NULL
          AND ${table.latitudeMicrodegrees} IS NOT NULL
          AND ${table.longitudeMicrodegrees} IS NOT NULL
          AND ${table.startTime} IS NULL
          AND ${table.timezone} IS NULL
          AND ${table.competitorLimit} IS NOT NULL
          AND ${table.schedule} IS NOT NULL)`,
    ),
    check(
      "contests_meetup_check",
      sql`${table.type} <> 'meetup'
        OR (${table.regionCode} IS NOT NULL
          AND ${table.city} IS NOT NULL
          AND ${table.venue} IS NOT NULL
          AND ${table.address} IS NOT NULL
          AND ${table.latitudeMicrodegrees} IS NOT NULL
          AND ${table.longitudeMicrodegrees} IS NOT NULL
          AND ${table.startTime} IS NOT NULL
          AND ${table.timezone} IS NOT NULL
          AND ${table.schedule} IS NULL)`,
    ),
    check(
      "contests_online_check",
      sql`${table.type} <> 'online'
        OR (${table.regionCode} IS NULL
          AND ${table.city} IS NULL
          AND ${table.venue} IS NULL
          AND ${table.address} IS NULL
          AND ${table.latitudeMicrodegrees} IS NULL
          AND ${table.longitudeMicrodegrees} IS NULL
          AND ${table.startTime} IS NULL)`,
    ),
  ],
);

export type InsertContest = typeof contestsTable.$inferInsert;
export type SelectContest = typeof contestsTable.$inferSelect;

const {
  schedule: _, // technically not a private column, but it's not needed most of the time
  adminNotes: _1,
  createdBy: _2,
  createdAt: _3,
  updatedAt: _4,
  ...contestsPublicCols
} = getColumns(contestsTable);

export { contestsPublicCols };

export type ContestResponse = Pick<SelectContest, keyof typeof contestsPublicCols>;
