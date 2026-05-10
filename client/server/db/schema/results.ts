import "server-only";
import { sql } from "drizzle-orm";
import * as d from "drizzle-orm/pg-core";
import { getColumns } from "drizzle-orm/utils";
import { recordCategoryEnum, recordTypeEnum } from "~/server/db/schema/record-configs.ts";
import { regionsTable } from "~/server/db/schema/regions.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";
import { tableTimestamps } from "../dbUtils.ts";
import { organizationsTable, usersTable } from "./auth-schema.ts";
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
    id: d.integer().primaryKey().generatedAlwaysAsIdentity(),
    organizationId: d
      .text()
      .references(() => organizationsTable.id)
      .notNull(),
    eventId: d
      .text()
      .references(() => eventsTable.eventId, { onUpdate: "cascade" })
      .notNull(),
    date: d.timestamp().notNull(),
    approved: d.boolean().default(false).notNull(),
    personIds: d.integer().array().notNull(),
    // These two are only set if participants are from the same region/super-region
    regionCode: d.varchar({ length: 2 }).references(() => regionsTable.code, { onUpdate: "cascade" }),
    superRegionCode: d.text(),
    attempts: d.jsonb().$type<Attempt>().array().notNull(),
    best: d.bigint({ mode: "number" }).notNull(),
    average: d.bigint({ mode: "number" }).notNull(),
    recordCategory: recordCategoryEnum().notNull(),
    regionalSingleRecord: recordTypeEnum(),
    regionalAverageRecord: recordTypeEnum(),
    competitionId: d.text().references(() => contestsTable.competitionId, { onUpdate: "cascade" }), // only used for contest results
    roundId: d.integer().references(() => roundsTable.id), // only used for contest results
    ranking: d.integer(), // only used for contest results
    proceeds: d.boolean(), // only used for contest results from non-final rounds
    videoLink: d.text(), // only used for video-based results
    discussionLink: d.text(), // only used for video-based results (also optional for those)
    // Before v0.13, createdExternally wasn't a column, and createdBy was only set for video-based results
    createdBy: d.text().references(() => usersTable.id, { onDelete: "set null" }),
    createdExternally: d.boolean().default(false).notNull(),
    ...tableTimestamps,
  },
  (table) => [
    d.check(
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
  organizationId: _,
  createdBy: _1,
  createdExternally: _2,
  createdAt: _3,
  updatedAt: _4,
  ...resultsPublicCols
} = getColumns(resultsTable);

export { resultsPublicCols };

export type ResultResponse = Pick<SelectResult, keyof typeof resultsPublicCols>;
