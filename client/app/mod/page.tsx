import { Suspense } from "react";
import z from "zod";
import Loading from "~/app/components/UI/Loading.tsx";
import { ContestStateValues } from "~/helpers/types.ts";
import { auth } from "~/server/auth.ts";
import { getModContestsSF } from "~/server/serverFunctions/contestServerFunctions.ts";
import { authorizeUser } from "~/server/serverOnlyFunctions.ts";
import ModDashboardScreen from "./ModDashboardScreen.tsx";

// This should match the schema in the filters validator
const SearchParamsValidator = z.strictObject({
  organizerPersonId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : null)),
  state: z
    .enum([...ContestStateValues, "pending"])
    .optional()
    .transform((val) => val ?? null),
});

type Props = {
  searchParams: Promise<z.infer<typeof SearchParamsValidator>>;
};

async function ModeratorDashboardPage({ searchParams }: Props) {
  const filters = SearchParamsValidator.parse(await searchParams);
  const session = await authorizeUser({ permissions: { modDashboard: ["view"] } });

  const { success: isAdminView } = await auth.api.userHasPermission({
    body: { userId: session.user.id, permissions: { adminDashboard: ["view"] } },
  });

  return (
    <section>
      <h2 className="mx-2 mb-4 text-center">Moderator Dashboard</h2>

      <Suspense fallback={<Loading />}>
        <ModDashboardScreen modContestsPromise={getModContestsSF(filters)} isAdminView={isAdminView} />
      </Suspense>
    </section>
  );
}

export default ModeratorDashboardPage;
