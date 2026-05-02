import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import z from "zod";
import { ContestStateValues } from "~/helpers/types.ts";

// Matches the search params in the page component
export const ModDashboardFiltersValidator = z.strictObject({
  organizerPersonId: z
    .union([z.number(), z.string()])
    .nullable()
    .optional()
    .transform((val) => (typeof val === "string" ? Number(val) : (val ?? null))),
  state: z
    .enum([...ContestStateValues, "pending"])
    .nullable()
    .optional()
    .transform((val) => val ?? null),
});

export type ModDashboardFiltersDto = z.infer<typeof ModDashboardFiltersValidator>;

const stateValues = ["pending", ...ContestStateValues] as const;
export type ModDashboardStateFilterValue = (typeof stateValues)[number];

export const useModDashboardQueryState = () =>
  useQueryStates(
    // This should match the filters validator
    {
      organizerPersonId: parseAsInteger,
      state: parseAsStringLiteral(stateValues),
    },
  );
