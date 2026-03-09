import "server-only";
import { getColumns, sql } from "drizzle-orm";
import { boolean, check, integer, smallint, text } from "drizzle-orm/pg-core";
import { RoundProceedValues, RoundTypeValues } from "~/helpers/types.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";
import { tableTimestamps } from "../dbUtils.ts";
import { roundFormatEnum } from "./events.ts";

export const roundTypeEnum = rrSchema.enum("round_type", RoundTypeValues);
export const roundProceedEnum = rrSchema.enum("round_proceed", RoundProceedValues);

export const roundsTable = rrSchema.table(
  "rounds",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    competitionId: text().notNull(),
    eventId: text().notNull(),
    roundNumber: smallint().notNull(),
    roundTypeId: roundTypeEnum().notNull(),
    format: roundFormatEnum().notNull(),
    timeLimitCentiseconds: integer(),
    // If this is not null, it's implied that the round itself is included in the cumulative limit rounds
    timeLimitCumulativeRoundIds: integer().array(),
    cutoffAttemptResult: integer(),
    cutoffNumberOfAttempts: integer(),
    proceedType: roundProceedEnum(),
    proceedValue: integer(),
    open: boolean().default(false).notNull(),
    ...tableTimestamps,
  },
  (table) => [
    // Cumulative round IDs can only be set when the round has a time limit
    check(
      "rounds_timelimit_check",
      sql`${table.timeLimitCumulativeRoundIds} IS NULL OR ${table.timeLimitCentiseconds} IS NOT NULL`,
    ),
    check(
      "rounds_cutoff_check",
      sql`(${table.cutoffAttemptResult} IS NOT NULL AND ${table.cutoffNumberOfAttempts} IS NOT NULL)
        OR (${table.cutoffAttemptResult} IS NULL AND ${table.cutoffNumberOfAttempts} IS NULL)`,
    ),
    check(
      "rounds_proceed_check",
      sql`(${table.proceedType} IS NOT NULL AND ${table.proceedValue} IS NOT NULL)
        OR (${table.proceedType} IS NULL AND ${table.proceedValue} IS NULL)`,
    ),
    check("rounds_finals_check", sql`${table.roundTypeId} <> 'f' OR ${table.proceedType} IS NULL`),
  ],
);

export type InsertRound = typeof roundsTable.$inferInsert;
export type SelectRound = typeof roundsTable.$inferSelect;

const { createdAt: _, updatedAt: _1, ...roundsPublicCols } = getColumns(roundsTable);
export { roundsPublicCols };

export type RoundResponse = Pick<SelectRound, keyof typeof roundsPublicCols>;

// Below is a draft of how tournaments could be implemented with two new tables

// round.format = "h2h" (head-to-head)
// round.brackets: {
//   bracketNumber: 1, 2, 3, etc. (for Swiss and Round Robin there's always just one bracket)
//   bracketType: "main" | "losers" | "double-elim-finals" | "double-elim-reset" | "swiss" | "round-robin"
//   stages: 1, 2, 3, etc.
//   seedingStrategy: "best-vs-worst" | "best-vs-2nd" | "random"
// }[]

// These get populated when the tournament round is first created
// matches: {
//   id
//   competitionId
//   roundId
//   bracket
//   stage: 1, 2, 3, etc.
//   position: 1, 2, 3, etc. (just the vertical position within a given stage)
//   open: boolean
//   matchFormat: 1/2/3 (first to N sets)
//   team1: personReference[]
//   team2: personReference[]
//   winner: 1/2/null (null while one of the sets has setWinner = null)
// }

// These are created whenever a new set starts
// sets: {
//   id
//   competitionId
//   roundId
//   matchId
//   setFormat: 1/2/3 (first to N wins)
//   winners: 0/1/2[] (0 means draw)
//   // result.attempts[] corresponds to winners[]. These are optional, because it could be an event that has no actual results to record.
//   result1?: resultReference (add a matchId field to the results table)
//   result2?: resultReference
//   setWinner: 1/2/null
// }
