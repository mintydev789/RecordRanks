import DataEntryScreen from "~/app/[slug]/mod/competition/[id]/DataEntryScreen.tsx";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { getMemberControlsContest } from "~/helpers/utilityFunctions.ts";
import { authorizeUser, getContest, getOrgDetails } from "~/server/server-only-functions.ts";

type Props = {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ eventId?: string }>;
};

async function DataEntryPage({ params, searchParams }: Props) {
  const { slug, id } = await params;
  const { eventId } = await searchParams;

  const organization = await getOrgDetails({ slug });
  const contestData = await getContest({ organizationId: organization.id, competitionId: id, eventId });
  if (!contestData) return <LoadingError loadingEntity="contest results" />;

  const { contest, events, rounds, results, persons, recordConfigs, regions } = contestData;
  const eventIdOrFirst = eventId ?? events[0].eventId;

  if (contest.type === "online") {
    const { member } = await authorizeUser({
      useOrganization: true,
      orgPermissions: { onlineComps: ["submit-own-result"] },
    });
    if (!member!.personId)
      return (
        <LoadingError reason="You must have a competitor profile linked to your member profile to submit results" />
      );
    if (!["approved", "ongoing"].includes(contest.state))
      return <LoadingError reason="You are unauthorized to submit results for this contest" />;
  } else {
    const { member } = await authorizeUser({
      useOrganization: true,
      orgPermissions: { competitions: ["create", "update"], meetups: ["create", "update"] },
    });
    if (!getMemberControlsContest(member!, contest))
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
