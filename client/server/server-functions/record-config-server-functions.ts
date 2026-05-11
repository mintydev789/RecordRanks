"use server";

import { eq } from "drizzle-orm";
import z from "zod";
import { RecordConfigValidator } from "~/helpers/validators/RecordConfig.ts";
import { logMessage } from "~/server/server-only-functions.ts";
import { db } from "../db/provider.ts";
import {
  type RecordConfigResponse,
  recordConfigsPublicCols,
  recordConfigsTable as table,
} from "../db/schema/record-configs.ts";
import { actionClient } from "../safeAction.ts";

export const createRecordConfigSF = actionClient
  .metadata({ auth: { useOrganization: true, orgPermissions: { recordConfigs: ["create-and-update"] } } })
  .inputSchema(
    z.strictObject({
      newRecordConfigDto: RecordConfigValidator,
    }),
  )
  .action<RecordConfigResponse>(async ({ parsedInput: { newRecordConfigDto }, ctx: { session } }) => {
    const { category, recordTypeId, label } = newRecordConfigDto;
    logMessage(
      "RR0027",
      `Creating record config with category ${category}, record type ID ${recordTypeId} and label ${label}`,
    );

    const [createdRecordConfig] = await db
      .insert(table)
      .values({ organizationId: session.organization!.id, ...newRecordConfigDto })
      .returning(recordConfigsPublicCols);
    return createdRecordConfig;
  });

export const updateRecordConfigSF = actionClient
  .metadata({ auth: { useOrganization: true, orgPermissions: { recordConfigs: ["create-and-update"] } } })
  .inputSchema(
    z.strictObject({
      id: z.int(),
      newRecordConfigDto: RecordConfigValidator,
    }),
  )
  .action<RecordConfigResponse>(async ({ parsedInput: { id, newRecordConfigDto } }) => {
    const { category, recordTypeId, label } = newRecordConfigDto;
    logMessage(
      "RR0028",
      `Updating record config with category ${category}, record type ID ${recordTypeId} and label ${label}`,
    );

    const [updatedRecordConfig] = await db
      .update(table)
      .set(newRecordConfigDto)
      .where(eq(table.id, id))
      .returning(recordConfigsPublicCols);
    return updatedRecordConfig;
  });
