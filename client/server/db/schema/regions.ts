import "server-only";
import { getColumns } from "drizzle-orm";
import * as d from "drizzle-orm/pg-core";
import { ContinentalRecordTypes, SuperRegionCodeValues } from "~/helpers/types.ts";
import { tableTimestamps } from "~/server/db/dbUtils.ts";
import { organizationsTable } from "~/server/db/schema/auth-schema.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";

export const superRegionCodeEnum = rrSchema.enum("super_region_code", SuperRegionCodeValues);
export const superRegionRecordTypeEnum = rrSchema.enum("super_region_record_type", ContinentalRecordTypes);

export const regionsTable = rrSchema.table("regions", {
  id: d.integer().primaryKey().generatedAlwaysAsIdentity(),
  organizationId: d
    .text()
    .references(() => organizationsTable.id)
    .notNull(),
  name: d.text().notNull(),
  shortName: d.text(),
  code: d.varchar({ length: 2 }).notNull().unique(),
  superRegionCode: superRegionCodeEnum(),
  superRegionRecordType: superRegionRecordTypeEnum(),
  ...tableTimestamps,
});

export type InsertRegion = typeof regionsTable.$inferInsert;
export type SelectRegion = typeof regionsTable.$inferSelect;

const { organizationId: _, createdAt: _1, updatedAt: _2, ...regionsPublicCols } = getColumns(regionsTable);

export { regionsPublicCols };

export type RegionResponse = Pick<SelectRegion, keyof typeof regionsPublicCols>;
