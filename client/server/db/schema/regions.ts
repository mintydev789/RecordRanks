import "server-only";
import { getColumns } from "drizzle-orm";
import { integer, text, varchar } from "drizzle-orm/pg-core";
import { ContinentalRecordTypes, SuperRegionCodeValues } from "~/helpers/types.ts";
import { tableTimestamps } from "~/server/db/dbUtils.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";

export const superRegionCodeEnum = rrSchema.enum("super_region_code", SuperRegionCodeValues);
export const superRegionRecordTypeEnum = rrSchema.enum("super_region_record_type", ContinentalRecordTypes);

export const regionsTable = rrSchema.table("regions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  shortName: text(),
  code: varchar({ length: 2 }).notNull().unique(),
  superRegionCode: superRegionCodeEnum().notNull(),
  superRegionRecordType: superRegionRecordTypeEnum().notNull(),
  ...tableTimestamps,
});

export type InsertRegion = typeof regionsTable.$inferInsert;
export type SelectRegion = typeof regionsTable.$inferSelect;

const { createdAt: _, updatedAt: _1, ...regionsPublicCols } = getColumns(regionsTable);

export { regionsPublicCols };

export type RegionResponse = Pick<SelectRegion, keyof typeof regionsPublicCols>;
