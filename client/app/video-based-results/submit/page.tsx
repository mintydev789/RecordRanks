import ResultsSubmissionForm from "~/app/video-based-results/ResultsSubmissionForm.tsx";
import { auth } from "~/server/auth";
import { authorizeUser, getRecordConfigs, getVideoBasedEvents } from "~/server/serverOnlyFunctions.ts";

async function SubmitResultsPage() {
  const { user } = await authorizeUser({ permissions: { videoBasedResults: ["create"] } });

  const [events, recordConfigs, { success: isVideoBasedResultReviewer }] = await Promise.all([
    getVideoBasedEvents(),
    getRecordConfigs("video-based-results"),
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
        isVideoBasedResultReviewer={isVideoBasedResultReviewer}
      />
    </section>
  );
}

export default SubmitResultsPage;
