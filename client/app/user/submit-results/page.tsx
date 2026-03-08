import ResultsSubmissionForm from "~/app/components/video-based-results/ResultsSubmissionForm";
import { authorizeUser, getRecordConfigs, getVideoBasedEvents } from "~/server/serverUtilityFunctions.ts";

async function SubmitResultsPage() {
  await authorizeUser({ permissions: { videoBasedResults: ["create"] } });

  const events = await getVideoBasedEvents();
  const recordConfigs = await getRecordConfigs("video-based-results");

  return (
    <section>
      <ResultsSubmissionForm events={events} recordConfigs={recordConfigs} />
    </section>
  );
}

export default SubmitResultsPage;
