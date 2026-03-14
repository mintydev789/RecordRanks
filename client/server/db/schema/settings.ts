import "server-only";
import { getColumns } from "drizzle-orm";
import { integer, text } from "drizzle-orm/pg-core";
import { tableTimestamps } from "~/server/db/dbUtils";
import { rrSchema } from "~/server/db/schema/schema";

export const settingsTable = rrSchema.table("settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: text().notNull().unique(),
  group: text(),
  value: text().notNull(),
  description: text(),
  ...tableTimestamps,
});

export type InsertSetting = typeof settingsTable.$inferInsert;
export type SelectSetting = typeof settingsTable.$inferSelect;

const { createdAt: _, updatedAt: _1, ...settingsPublicCols } = getColumns(settingsTable);
export { settingsPublicCols };

export type SettingResponse = Pick<SelectSetting, keyof typeof settingsPublicCols>;
