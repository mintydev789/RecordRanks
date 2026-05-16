import { headers } from "next/headers";
import ResultsSubmissionForm from "~/app/[slug]/video-based-results/ResultsSubmissionForm.tsx";
import { auth } from "~/server/auth.ts";
import { authorizeUser, getRecordConfigs, getRegions, getVideoBasedEvents } from "~/server/server-only-functions.ts";

async function SubmitResultsPage() {
  const { organization } = await authorizeUser({
    useOrganization: true,
    orgPermissions: { videoBasedResults: ["create"] },
  });

  const [events, recordConfigs, regions, { success: isVideoBasedResultReviewer }] = await Promise.all([
    getVideoBasedEvents(),
    getRecordConfigs(organization!.id, { recordCategory: "online" }),
    getRegions(organization!.id),
    auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { videoBasedResults: ["update", "approve", "delete"] } },
    }),
  ]);

  return (
    <section>
      <h2 className="text-center">Submit Results</h2>

      <ResultsSubmissionForm
        events={events}
        recordConfigs={recordConfigs}
        regions={regions}
        isVideoBasedResultReviewer={isVideoBasedResultReviewer}
      />
    </section>
  );
}

export default SubmitResultsPage;
