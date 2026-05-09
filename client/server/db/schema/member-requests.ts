import "server-only";
import { integer, text } from "drizzle-orm/pg-core";
import type { Creator } from "~/helpers/types.ts";
import { tableTimestamps } from "~/server/db/dbUtils.ts";
import { membersTable } from "~/server/db/schema/auth-schema.ts";
import { type PersonResponse, personsTable } from "~/server/db/schema/persons.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";
import type { OrganizationRole } from "~/server/organization-permissions.ts";

export const memberRequestsTable = rrSchema.table("member_requests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  memberId: text()
    .references(() => membersTable.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  requestedRole: text().$type<OrganizationRole>(),
  requestedPersonId: integer().references(() => personsTable.id, { onDelete: "cascade" }),
  comment: text(),
  ...tableTimestamps,
});

export type InsertMemberRequest = typeof memberRequestsTable.$inferInsert;
export type SelectMemberRequest = typeof memberRequestsTable.$inferSelect;

export type FullMemberRequest = SelectMemberRequest & {
  // user?: Creator;
  requestedPerson: PersonResponse | null;
};
