import ResultsSubmissionForm from "~/app/video-based-results/ResultsSubmissionForm.tsx";
import { auth } from "~/server/auth.ts";
import { db } from "~/server/db/provider.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { authorizeUser, getRecordConfigs, getVideoBasedEvents } from "~/server/serverOnlyFunctions.ts";

async function SubmitResultsPage() {
  const { user } = await authorizeUser({ permissions: { videoBasedResults: ["create"] } });

  const [events, recordConfigs, regions, { success: isVideoBasedResultReviewer }] = await Promise.all([
    getVideoBasedEvents(),
    getRecordConfigs("video-based-results"),
    db.select(regionsPublicCols).from(regionsTable),
    auth.api.userHasPermission({
      body: { userId: user.id, permissions: { videoBasedResults: ["update", "approve", "delete"] } },
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
