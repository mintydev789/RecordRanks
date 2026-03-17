import { inArray } from "drizzle-orm";
import Markdown from "react-markdown";
import { db } from "~/server/db/provider.ts";
import { personsTable } from "~/server/db/schema/persons.ts";
import type { FullResult } from "~/server/db/schema/results.ts";
import { authorizeUser, getRecordConfigs, getSettingFromDb } from "~/server/serverOnlyFunctions.ts";
import ManageResultsScreen from "./ManageResultsScreen.tsx";

async function ManageResultsPage() {
  await authorizeUser({ permissions: { videoBasedResults: ["update", "approve", "delete"] } });

  const [results, recordConfigs, instructions] = await Promise.all([
    db.query.results.findMany({
      with: { event: true },
      where: { competitionId: { isNull: true } },
      orderBy: { createdAt: "desc" },
    }),
    getRecordConfigs("video-based-results"),
    getSettingFromDb({ key: "video-based-results-instructions" }),
  ]);

  const allPersonIds = new Set<number>();
  for (const r of results) for (const pid of r.personIds) allPersonIds.add(pid);
  const persons = await db
    .select()
    .from(personsTable)
    .where(inArray(personsTable.id, Array.from(allPersonIds)));
  results.forEach((r) => {
    (r as any).persons = r.personIds.map((pid) => persons.find((p) => p.id === pid) ?? null);
  });

  return (
    <section>
      <div className="mb-4 px-3">
        <h2 className="mb-4 text-center">Results</h2>

        <div className="lh-lg overflow-y-auto border p-2" style={{ maxHeight: "300px" }}>
          <Markdown>{instructions}</Markdown>
        </div>
      </div>

      <ManageResultsScreen results={results as FullResult[]} recordConfigs={recordConfigs} />
    </section>
  );
}

export default ManageResultsPage;
