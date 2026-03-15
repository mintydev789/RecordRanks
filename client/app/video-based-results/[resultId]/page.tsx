import { eq } from "drizzle-orm";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import ResultsSubmissionForm from "~/app/video-based-results/ResultsSubmissionForm.tsx";
import { creatorCols } from "~/server/db/dbUtils.ts";
import { db } from "~/server/db/provider.ts";
import { usersTable } from "~/server/db/schema/auth-schema.ts";
import { authorizeUser, getRecordConfigs, getVideoBasedEvents } from "~/server/serverOnlyFunctions.ts";

type Props = {
  params: Promise<{ resultId: string }>;
};

async function EditResultPage({ params }: Props) {
  await authorizeUser({ permissions: { videoBasedResults: ["update", "approve"] } });
  const { resultId } = await params;

  const [events, recordConfigs, result] = await Promise.all([
    getVideoBasedEvents(),
    getRecordConfigs("video-based-results"),
    db.query.results.findFirst({ where: { id: Number(resultId) } }),
  ]);

  if (!result) return <LoadingError />;

  const participants = await db.query.persons.findMany({ where: { id: { in: result.personIds } } });
  const [creator] = result.createdBy
    ? await db.select(creatorCols).from(usersTable).where(eq(usersTable.id, result.createdBy))
    : [];
  const creatorPerson = creator?.personId
    ? await db.query.persons.findFirst({ where: { id: creator.personId } })
    : undefined;

  return (
    <section>
      <h2 className="text-center">Edit Result</h2>

      <ResultsSubmissionForm
        events={events}
        recordConfigs={recordConfigs}
        result={result}
        participants={participants}
        creator={creator}
        creatorPerson={creatorPerson}
      />
    </section>
  );
}

export default EditResultPage;
