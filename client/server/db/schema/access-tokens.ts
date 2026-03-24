import "server-only";
import { getColumns } from "drizzle-orm";
import { integer, text } from "drizzle-orm/pg-core";
import { usersTable } from "~/server/db/schema/auth-schema.ts";
import { contestsTable } from "~/server/db/schema/contests.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";
import { tableTimestamps } from "../dbUtils.ts";

export const accessTokensTable = rrSchema.table("access_tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tokenHash: text().notNull().unique(),
  competitionId: text()
    .references(() => contestsTable.competitionId, { onUpdate: "cascade" })
    .notNull(),
  createdBy: text().references(() => usersTable.id, { onDelete: "set null" }), // this can be null if the user has been deleted
  ...tableTimestamps,
});

export type InsertAccessToken = typeof accessTokensTable.$inferInsert;
export type SelectAccessToken = typeof accessTokensTable.$inferSelect;

const { createdAt: _, updatedAt: _1, ...accessTokensPublicCols } = getColumns(accessTokensTable);

export { accessTokensPublicCols };

export type AccessTokenResponse = Pick<SelectAccessToken, keyof typeof accessTokensPublicCols>;
