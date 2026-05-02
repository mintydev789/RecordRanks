import "server-only";
import { sql } from "drizzle-orm";
import { bigint, boolean, check, integer, jsonb, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { getColumns } from "drizzle-orm/utils";
import { recordCategoryEnum, recordTypeEnum } from "~/server/db/schema/record-configs.ts";
import { regionsTable } from "~/server/db/schema/regions.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";
import { tableTimestamps } from "../dbUtils.ts";
import { usersTable } from "./auth-schema.ts";
import { contestsTable, type SelectContest } from "./contests.ts";
import { eventsTable, type SelectEvent } from "./events.ts";
import type { SelectPerson } from "./persons.ts";
import { roundsTable } from "./rounds.ts";

export type Attempt = {
  // The result format is described in the exports README
  result: number;
  memo?: number;
};

export const resultsTable = rrSchema.table(
  "results",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    eventId: text()
      .references(() => eventsTable.eventId, { onUpdate: "cascade" })
      .notNull(),
    date: timestamp().notNull(),
    approved: boolean().default(false).notNull(),
    personIds: integer().array().notNull(),
    // These two are only set if participants are from the same region/super-region
    regionCode: varchar({ length: 2 }).references(() => regionsTable.code, { onUpdate: "cascade" }),
    superRegionCode: text(),
    attempts: jsonb().$type<Attempt>().array().notNull(),
    best: bigint({ mode: "number" }).notNull(),
    average: bigint({ mode: "number" }).notNull(),
    recordCategory: recordCategoryEnum().notNull(),
    regionalSingleRecord: recordTypeEnum(),
    regionalAverageRecord: recordTypeEnum(),
    competitionId: text().references(() => contestsTable.competitionId, { onUpdate: "cascade" }), // only used for contest results
    roundId: integer().references(() => roundsTable.id), // only used for contest results
    ranking: integer(), // only used for contest results
    proceeds: boolean(), // only used for contest results from non-final rounds
    videoLink: text(), // only used for video-based results
    discussionLink: text(), // only used for video-based results (also optional for those)
    // Before v0.13, createdExternally wasn't a column, and createdBy was only set for video-based results
    createdBy: text().references(() => usersTable.id, { onDelete: "set null" }),
    createdExternally: boolean().default(false).notNull(),
    ...tableTimestamps,
  },
  (table) => [
    check(
      "results_check",
      sql`(${table.competitionId} IS NOT NULL
          AND ${table.recordCategory} <> 'online'
          AND ${table.roundId} IS NOT NULL
          AND ${table.ranking} IS NOT NULL)
        OR (${table.competitionId} IS NULL
          AND ${table.recordCategory} = 'online'
          AND ${table.roundId} IS NULL
          AND ${table.ranking} IS NULL
          AND ${table.proceeds} IS NULL)`,
    ),
  ],
);

export type InsertResult = typeof resultsTable.$inferInsert;
export type SelectResult = typeof resultsTable.$inferSelect;

export type FullResult = SelectResult & {
  event: SelectEvent;
  contest?: SelectContest;
  persons: SelectPerson[];
};

const {
  createdBy: _,
  createdExternally: _1,
  createdAt: _2,
  updatedAt: _3,
  ...resultsPublicCols
} = getColumns(resultsTable);

export { resultsPublicCols };

export type ResultResponse = Pick<SelectResult, keyof typeof resultsPublicCols>;
