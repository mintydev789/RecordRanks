import LoadingError from "~/app/components/UI/LoadingError.tsx";
import DataEntryScreen from "~/app/mod/competition/[id]/DataEntryScreen.tsx";
import { getContestSF } from "~/server/server-functions/contest-server-functions.ts";
import { authorizeUser, getUserHasAccessToContest } from "~/server/server-only-functions.ts";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eventId?: string }>;
};

async function DataEntryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { eventId } = await searchParams;
  const { user } = await authorizeUser({
    permissions: { competitions: ["create", "update"], meetups: ["create", "update"] },
  });

  const res = await getContestSF({ competitionId: id, eventId });

  if (!res.data) return <LoadingError loadingEntity="contest results" />;

  const { contest, events, rounds, results, persons, recordConfigs, regions } = res.data;
  const eventIdOrFirst = eventId ?? events[0].eventId;

  if (!getUserHasAccessToContest(user, contest))
    return <LoadingError reason="You do not have access rights for this contest" />;

  return (
    <DataEntryScreen
      key={eventIdOrFirst}
      contest={contest}
      eventId={eventIdOrFirst}
      events={events}
      rounds={rounds}
      results={results}
      persons={persons}
      recordConfigs={recordConfigs}
      regions={regions}
    />
  );
}

export default DataEntryPage;
