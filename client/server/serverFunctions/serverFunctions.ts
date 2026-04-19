"use server";

import { Alg } from "cubing/alg";
import { cube2x2x2 } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { nxnMoves } from "~/helpers/types/NxNMove.ts";
import { auth } from "~/server/auth.ts";
import { db } from "~/server/db/provider.ts";
import {
  type CurrentCollectiveSolution,
  collectiveSolutionsPublicCols,
  collectiveSolutionsTable as csTable,
} from "~/server/db/schema/collective-solutions.ts";
import { actionClient, RrActionError } from "../safeAction.ts";
import { getSettingFromDb, logMessage } from "../serverOnlyFunctions.ts";

export const logAffiliateLinkClickSF = actionClient
  .metadata({})
  .inputSchema(
    z.strictObject({
      message: z.string().nonempty(),
    }),
  )
  .action(async ({ parsedInput: { message } }) => {
    logMessage("RR0004", message);
  });

export const logErrorSF = actionClient
  .metadata({})
  .inputSchema(
    z.strictObject({
      errorMessage: z.string().nonempty(),
    }),
  )
  .action(async ({ parsedInput: { errorMessage } }) => {
    logMessage("RR5000", errorMessage, { sendErrorLogEmail: true });
  });

export const getModInstructionsSF = actionClient.metadata({}).action<string | null>(async () => {
  return await getSettingFromDb({ key: "moderator-instructions-page-content", optional: true });
});

export const getCurrentCollectiveCubingSolutionSF = actionClient
  .metadata({})
  .action<CurrentCollectiveSolution | null>(async () => {
    // Doing it like this, because authentication is optional for this server function
    const session = await auth.api.getSession({ headers: await headers() });

    const collectiveSolution = await db.query.collectiveSolutions.findFirst({
      columns: {
        attemptNumber: true,
        state: true,
        scramble: true,
        solution: true,
        lastUserWhoInteractedId: true,
      },
      where: { state: { ne: "archived" } },
    });

    if (!collectiveSolution) return null;

    const { lastUserWhoInteractedId, ...rest } = collectiveSolution;
    return { ...rest, currentUserInteractedLast: session?.user.id === lastUserWhoInteractedId };
  });

export const startNewCollectiveCubingSolutionSF = actionClient
  .metadata({ permissions: null })
  .action<CurrentCollectiveSolution>(async ({ ctx: { session } }) => {
    logMessage("RR0029", "Starting new Collective Cubing solution");

    const ongoingSolution = await db.query.collectiveSolutions.findFirst({ where: { state: "ongoing" } });
    if (ongoingSolution) throw new RrActionError("The cube has already been scrambled", { data: ongoingSolution });

    const eventId = "222"; // the collective-cubing-enabled setting also references 2x2x2
    const scramble = await randomScrambleForEvent(eventId);

    const [createdSolution] = await db.transaction(async (tx) => {
      await tx.update(csTable).set({ state: "archived" }).where(eq(csTable.state, "solved"));

      return await tx
        .insert(csTable)
        .values({
          eventId,
          scramble: scramble.toString(),
          lastUserWhoInteractedId: session.user.id,
          usersWhoMadeMoves: [],
        })
        .returning(collectiveSolutionsPublicCols);
    });

    return { ...createdSolution, currentUserInteractedLast: true };
  });

async function getIsSolved(currentState: Alg): Promise<boolean> {
  const kpuzzle = await cube2x2x2.kpuzzle();
  const isSolved = kpuzzle
    .defaultPattern()
    .applyAlg(currentState)
    .experimentalIsSolved({ ignorePuzzleOrientation: true, ignoreCenterOrientation: true });

  return isSolved;
}

export const makeCollectiveCubingMoveSF = actionClient
  .metadata({ permissions: null })
  .inputSchema(
    z.strictObject({
      move: z.enum(nxnMoves),
      lastSeenSolution: z.string(),
    }),
  )
  .action<CurrentCollectiveSolution>(
    async ({
      parsedInput: { move, lastSeenSolution },
      ctx: {
        session: { user },
      },
    }) => {
      const [ongoingSolution] = await db.select().from(csTable).where(eq(csTable.state, "ongoing")).limit(1);

      if (!ongoingSolution) {
        throw new RrActionError("The puzzle is already solved", { data: { isSolved: true } });
      }

      if (user.id === ongoingSolution.lastUserWhoInteractedId) {
        throw new RrActionError(
          ongoingSolution.solution
            ? "You may not make two moves in a row"
            : "You scrambled the cube, so you may not make the first move",
        );
      }

      if (ongoingSolution.solution !== lastSeenSolution)
        throw new RrActionError("The state of the cube has changed before your move", { data: ongoingSolution });

      const solution = new Alg(ongoingSolution.solution).concat(move);
      const state = (await getIsSolved(new Alg(ongoingSolution.scramble).concat(solution))) ? "solved" : "ongoing";

      const [updatedSolution] = await db
        .update(csTable)
        .set({
          state,
          solution: solution.toString(),
          lastUserWhoInteractedId: user.id,
          usersWhoMadeMoves: !ongoingSolution.usersWhoMadeMoves.includes(user.id)
            ? [...ongoingSolution.usersWhoMadeMoves, user.id]
            : ongoingSolution.usersWhoMadeMoves,
        })
        .where(eq(csTable.id, ongoingSolution.id))
        .returning(collectiveSolutionsPublicCols);

      return { ...updatedSolution, currentUserInteractedLast: true };
    },
  );
