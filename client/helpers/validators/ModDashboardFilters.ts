import z from "zod";
import { ContestStateValues } from "~/helpers/types.ts";

// Matches the search params in the page component
export const ModDashboardFiltersValidator = z.strictObject({
  organizerPersonId: z.number().nullable(),
  state: z.enum([...ContestStateValues, "pending"]).nullable(),
});

export type ModDashboardFiltersDto = z.infer<typeof ModDashboardFiltersValidator>;
