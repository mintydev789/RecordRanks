import "server-only";
import { getColumns } from "drizzle-orm";
import { integer, text } from "drizzle-orm/pg-core";
import { tableTimestamps } from "~/server/db/dbUtils.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";

// More groups and keys can be added here
export type SettingGroup = "default" | "page-contents" | "features";
export type SettingKey =
  // default
  | "error-logs-contact-email"
  | "video-based-results-contact-email"

  // page-contents
  | "home-page-description"
  | "about-page-content"
  | "rules-page-content"
  | "moderator-instructions-page-content"
  | "moderator-instructions-description"
  | "video-based-results-instructions"
  | "member-request-instructions"
  | "public-exports-readme"

  // features
  | "contest-types"
  | "collective-cubing-enabled";

export const settingsTable = rrSchema.table("settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: text().$type<SettingKey>().notNull().unique(),
  group: text().$type<SettingGroup>(),
  value: text().notNull(),
  description: text(),
  ...tableTimestamps,
});

export type InsertSetting = typeof settingsTable.$inferInsert;
export type SelectSetting = typeof settingsTable.$inferSelect;

const { createdAt: _, updatedAt: _1, ...settingsPublicCols } = getColumns(settingsTable);

export { settingsPublicCols };

export type SettingResponse = Pick<SelectSetting, keyof typeof settingsPublicCols>;
