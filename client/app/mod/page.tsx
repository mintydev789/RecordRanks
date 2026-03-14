import { Suspense } from "react";
import Loading from "~/app/components/UI/Loading.tsx";
import { getModContestsSF } from "~/server/serverFunctions/contestServerFunctions.ts";
import { authorizeUser } from "~/server/serverOnlyFunctions.ts";
import ModDashboardScreen from "./ModDashboardScreen.tsx";

type Props = {
  searchParams: Promise<{ organizerPersonId: string }>;
};

async function ModeratorDashboardPage({ searchParams }: Props) {
  const session = await authorizeUser({ permissions: { modDashboard: ["view"] } });
  const { organizerPersonId } = await searchParams;

  const modContestsPromise = getModContestsSF({
    organizerPersonId: organizerPersonId ? Number(organizerPersonId) : undefined,
  });

  return (
    <section>
      <h2 className="mx-2 mb-4 text-center">Moderator Dashboard</h2>

      <Suspense fallback={<Loading />}>
        <ModDashboardScreen modContestsPromise={modContestsPromise} session={session} />
      </Suspense>
    </section>
  );
}

export default ModeratorDashboardPage;
