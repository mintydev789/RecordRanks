import z from "zod";
import ResultsSubmissionForm from "~/app/[slug]/video-based-results/ResultsSubmissionForm.tsx";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import { db } from "~/server/db/provider.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { authorizeUser, getCreators, getRecordConfigs, getVideoBasedEvents } from "~/server/server-only-functions.ts";

const ParamsValidator = z.strictObject({
  slug: z.string().nonempty(),
  resultId: z.string().transform((val) => Number(val)),
});

type Props = {
  params: Promise<z.infer<typeof ParamsValidator>>;
};

async function UpdateVideoBasedResultPage({ params }: Props) {
  const { resultId } = ParamsValidator.parse(await params);
  await authorizeUser({
    useOrganization: true,
    orgPermissions: { videoBasedResults: ["update", "approve", "delete"] },
  });

  const [events, recordConfigs, regions, result] = await Promise.all([
    getVideoBasedEvents(),
    getRecordConfigs({ recordCategory: "online" }),
    db.select(regionsPublicCols).from(regionsTable),
    db.query.results.findFirst({ where: { id: resultId } }),
  ]);

  if (!result) return <LoadingError />;

  const participants = await db.query.persons.findMany({ where: { id: { in: result.personIds } } });
  const creator = result.createdBy ? ((await getCreators([result.createdBy])).at(0) ?? null) : null;

  return (
    <section>
      <h2 className="text-center">Edit Result</h2>

      <ResultsSubmissionForm
        events={events}
        recordConfigs={recordConfigs}
        regions={regions}
        result={result}
        participants={participants}
        creator={creator}
        isVideoBasedResultReviewer // already checked on page load above
      />
    </section>
  );
}

export default UpdateVideoBasedResultPage;
