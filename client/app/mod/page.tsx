import { Suspense } from "react";
import z from "zod";
import Loading from "~/app/components/UI/Loading.tsx";
import { auth } from "~/server/auth.ts";
import { getModContestsSF } from "~/server/serverFunctions/contestServerFunctions.ts";
import { authorizeUser } from "~/server/serverOnlyFunctions.ts";
import ModDashboardScreen from "./ModDashboardScreen.tsx";

type Props = {
  searchParams: Promise<{ organizerPersonId?: string }>;
};

async function ModeratorDashboardPage({ searchParams }: Props) {
  const session = await authorizeUser({ permissions: { modDashboard: ["view"] } });
  const { organizerPersonId } = z
    .strictObject({
      organizerPersonId: z
        .string()
        .transform((val) => Number(val))
        .optional(),
    })
    .parse(await searchParams);

  const { success: isAdminView } = await auth.api.userHasPermission({
    body: { userId: session.user.id, permissions: { adminDashboard: ["view"] } },
  });

  const modContestsPromise = getModContestsSF({ organizerPersonId });

  return (
    <section>
      <h2 className="mx-2 mb-4 text-center">Moderator Dashboard</h2>

      <Suspense fallback={<Loading />}>
        <ModDashboardScreen modContestsPromise={modContestsPromise} isAdminView={isAdminView} />
      </Suspense>
    </section>
  );
}

export default ModeratorDashboardPage;
