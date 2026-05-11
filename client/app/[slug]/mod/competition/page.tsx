import { eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { SWRConfig } from "swr";
import z from "zod";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import { SwrKey } from "~/helpers/swr-keys.ts";
import type { Creator } from "~/helpers/types.ts";
import { getMemberControlsContest } from "~/helpers/utilityFunctions.ts";
import { auth } from "~/server/auth.ts";
import { db } from "~/server/db/provider.ts";
import { eventsPublicCols, eventsTable } from "~/server/db/schema/events.ts";
import { type PersonResponse, personsPublicCols, personsTable } from "~/server/db/schema/persons.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { resultsTable } from "~/server/db/schema/results.ts";
import { roundsPublicCols, roundsTable } from "~/server/db/schema/rounds.ts";
import { authorizeUser, getCreators, getSettingFromDb } from "~/server/server-only-functions.ts";
import ContestForm from "./ContestForm.tsx";

type Props = {
  searchParams: Promise<{
    editId?: string;
    copyId?: string;
  }>;
};

async function CreateEditContestPage({ searchParams }: Props) {
  const { editId, copyId } = z
    .strictObject({
      editId: z.string().nonempty().optional(),
      copyId: z.string().nonempty().optional(),
    })
    .parse(await searchParams);
  const session = await authorizeUser({
    useOrganization: true,
    orgPermissions: { competitions: ["create", "update"], meetups: ["create", "update"] },
  });

  const [{ success: canApprove }, regions] = await Promise.all([
    auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { competitions: ["approve"], meetups: ["approve"] } },
    }),
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  const mode = editId ? "edit" : copyId ? "copy" : "new";
  const competitionId = editId ?? copyId;

  try {
    const [events, contest, rounds] = await Promise.all([
      db.select(eventsPublicCols).from(eventsTable).orderBy(eventsTable.rank),
      competitionId
        ? db.query.contests.findFirst({
            columns: canApprove ? undefined : { createdBy: false, createdAt: false, updatedAt: false },
            where: { competitionId },
          })
        : undefined,
      competitionId
        ? db.select(roundsPublicCols).from(roundsTable).where(eq(roundsTable.competitionId, competitionId))
        : undefined,
    ]);

    if (competitionId && !contest) return <LoadingError reason="Contest not found" />;

    let totalResultsByRound: { roundId: number; totalResults: number }[] | undefined;
    let organizers: PersonResponse[] | undefined;
    let creator: Creator | null | undefined;

    if (contest) {
      if (!getMemberControlsContest(session.member!, contest))
        return <LoadingError reason="You do not have access rights for this contest" />;

      const [totalResultsByRoundRes, organizersRes, [creatorRes]] = await Promise.all([
        contest.participants > 0
          ? db
              .execute(
                sql`SELECT ${resultsTable.roundId}, COUNT(*) AS total_results
                  FROM ${resultsTable}
                  WHERE ${resultsTable.competitionId} = ${contest.competitionId}
                  GROUP BY ${resultsTable.roundId}`,
              )
              .then((res) =>
                res.map((row) => ({ roundId: row.round_id as number, totalResults: Number(row.total_results ?? 0) })),
              )
          : undefined,
        db.select(personsPublicCols).from(personsTable).where(inArray(personsTable.id, contest.organizerIds)),
        canApprove && contest.createdBy ? getCreators([contest.createdBy]) : [],
      ]);
      totalResultsByRound = totalResultsByRoundRes;
      organizers = organizersRes;
      creator = creatorRes;
    }

    return (
      <section>
        <h2 className="mb-4 text-center">{mode === "edit" ? "Edit Contest" : "Create Contest"}</h2>

        <SWRConfig
          value={{
            fallback: {
              [SwrKey.ContestTypes]: getSettingFromDb({ key: "contest-types" }),
            },
          }}
        >
          <ContestForm
            events={events}
            rounds={rounds}
            totalResultsByRound={totalResultsByRound}
            regions={regions}
            mode={mode}
            contest={contest}
            organizers={organizers}
            creator={creator}
          />
        </SWRConfig>
      </section>
    );
  } catch (err) {
    console.error(err);
    return <LoadingError />;
  }
}

export default CreateEditContestPage;
