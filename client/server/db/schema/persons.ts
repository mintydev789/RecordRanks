import "server-only";
import { getColumns } from "drizzle-orm";
import { boolean, integer, text, varchar } from "drizzle-orm/pg-core";
import { tableTimestamps } from "~/server/db/dbUtils.ts";
import { usersTable } from "~/server/db/schema/auth-schema.ts";
import { regionsTable } from "~/server/db/schema/regions.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";

export const personsTable = rrSchema.table("persons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  localizedName: text(),
  regionCode: varchar({ length: 2 })
    .references(() => regionsTable.code, { onUpdate: "cascade" })
    .notNull(),
  wcaId: varchar({ length: 10 }).unique(),
  approved: boolean().default(false).notNull(),
  // Before the v0.13, createdExternally wasn't a column, and createdBy was just set to undefined if the person was created externally
  createdBy: text().references(() => usersTable.id, { onDelete: "set null" }),
  createdExternally: boolean().default(false).notNull(),
  ...tableTimestamps,
});

export type InsertPerson = typeof personsTable.$inferInsert;
export type SelectPerson = typeof personsTable.$inferSelect;

const {
  createdBy: _,
  createdExternally: _1,
  createdAt: _2,
  updatedAt: _3,
  ...personsPublicCols
} = getColumns(personsTable);

export { personsPublicCols };

export type PersonResponse = Pick<SelectPerson, keyof typeof personsPublicCols>;
