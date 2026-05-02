import LoadingError from "~/app/components/UI/LoadingError.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import DataEntryScreen from "~/app/mod/competition/[id]/DataEntryScreen.tsx";
import { getUserControlsContest } from "~/helpers/utilityFunctions.ts";
import { getContestSF } from "~/server/server-functions/contest-server-functions.ts";
import { authorizeUser } from "~/server/server-only-functions.ts";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eventId?: string }>;
};

async function DataEntryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { eventId } = await searchParams;

  const res = await getContestSF({ competitionId: id, eventId });

  if (!res.data) return <LoadingError loadingEntity="contest results" />;

  const { contest, events, rounds, results, persons, recordConfigs, regions } = res.data;
  const eventIdOrFirst = eventId ?? events[0].eventId;

  if (contest.type === "online") {
    const { user } = await authorizeUser({ permissions: { onlineComps: ["submit-own-result"] } });
    if (!user.personId || !["approved", "ongoing"].includes(contest.state))
      return <LoadingError reason="You are unauthorized to submit results for this contest" />;
  } else {
    const { user } = await authorizeUser({
      permissions: { competitions: ["create", "update"], meetups: ["create", "update"] },
    });
    if (!getUserControlsContest(user, contest))
      return <LoadingError reason="You do not have access rights for this contest" />;
  }

  return (
    <section>
      <ToastMessages className="mx-2" />

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
    </section>
  );
}

export default DataEntryPage;
