import { integer, text } from "drizzle-orm/pg-core";
import "server-only";
import { tableTimestamps } from "~/server/db/dbUtils.ts";
import { usersTable } from "~/server/db/schema/auth-schema.ts";
import { type PersonResponse, personsTable } from "~/server/db/schema/persons.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";

export const userRequestsTable = rrSchema.table("user_requests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  requestedRole: text(),
  requestedPersonId: integer().references(() => personsTable.id, { onDelete: "cascade" }),
  comment: text(),
  ...tableTimestamps,
});

export type InsertUserRequest = typeof userRequestsTable.$inferInsert;
export type SelectUserRequest = typeof userRequestsTable.$inferSelect;

export type FullUserRequest = SelectUserRequest & {
  requestedPerson: PersonResponse | null;
};
