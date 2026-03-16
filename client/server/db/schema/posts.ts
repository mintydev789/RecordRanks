import "server-only";
import { getColumns } from "drizzle-orm";
import { integer, text, timestamp } from "drizzle-orm/pg-core";
import { tableTimestamps } from "~/server/db/dbUtils";
import { usersTable } from "~/server/db/schema/auth-schema";
import { rrSchema } from "~/server/db/schema/schema";

export const postsTable = rrSchema.table("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  postId: text().notNull().unique(),
  title: text().notNull(),
  content: text().notNull(),
  date: timestamp().defaultNow().notNull(),
  createdBy: text().references(() => usersTable.id, { onDelete: "set null" }),
  ...tableTimestamps,
});

export type InsertPost = typeof postsTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;

const { createdBy: _, createdAt: _1, updatedAt: _2, ...postsPublicCols } = getColumns(postsTable);
export { postsPublicCols };

export type PostResponse = Pick<SelectPost, keyof typeof postsPublicCols>;
