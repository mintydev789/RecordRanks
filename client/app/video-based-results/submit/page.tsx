import ResultsSubmissionForm from "~/app/video-based-results/ResultsSubmissionForm.tsx";
import { authorizeUser, getRecordConfigs, getVideoBasedEvents } from "~/server/serverOnlyFunctions.ts";

async function SubmitResultsPage() {
  await authorizeUser({ permissions: { videoBasedResults: ["create"] } });

  const events = await getVideoBasedEvents();
  const recordConfigs = await getRecordConfigs("video-based-results");

  return (
    <section>
      <h2 className="text-center">Submit Results</h2>

      <ResultsSubmissionForm events={events} recordConfigs={recordConfigs} />
    </section>
  );
}

export default SubmitResultsPage;
