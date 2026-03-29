import ContestLayout from "~/app/competitions/[id]/ContestLayout.tsx";
import EventButtons from "~/app/components/EventButtons.tsx";
import EventResultsTable from "~/app/components/EventResultsTable.tsx";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import { getContestSF } from "~/server/serverFunctions/contestServerFunctions.ts";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eventId?: string }>;
};

async function ContestResultsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { eventId } = await searchParams;

  const res = await getContestSF({ competitionId: id, eventId });

  if (!res.data) return <LoadingError loadingEntity="contest results" />;

  const { contest, events, rounds, results, persons, recordConfigs, regions } = res.data;
  const event = eventId ? events.find((e) => e.eventId === eventId)! : events[0];

  return (
    <ContestLayout contest={contest} activeTab="results">
      <div className="px-1">
        <EventButtons eventId={event.eventId} events={events} forPage="results" />
      </div>
      <EventResultsTable
        event={event}
        rounds={rounds}
        results={results}
        persons={persons}
        recordConfigs={recordConfigs}
        regions={regions}
      />
    </ContestLayout>
  );
}

export default ContestResultsPage;
