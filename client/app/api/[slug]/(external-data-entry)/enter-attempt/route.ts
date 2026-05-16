import type { NextRequest } from "next/server";
// import { roundFormats } from "~/helpers/roundFormats";
// import { getActionError, verifyAccessToken } from "~/helpers/utilityFunctions.ts";
// import { type EnterAttemptPayloadDto, EnterAttemptPayloadValidator } from "~/helpers/validators/EnterAttemptPayload.tsx";
// import { db } from "~/server/db/provider.ts";
// import type { Attempt } from "~/server/db/schema/results.ts";
// import { createContestResultSF, updateContestResultSF } from "~/server/server-functions/result-server-functions.ts";
// import { getPersonsForExternalDeviceDataEntry } from "~/server/serverUtilityFunctions.ts";

export async function POST(_req: NextRequest) {
  return new Response("NOT IMPLEMENTED", { status: 501 });
  // const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  // if (!token) return new Response("Unauthorized", { status: 401 });

  // let enterAttemptDto: EnterAttemptPayloadDto;
  // try {
  //   enterAttemptDto = EnterAttemptPayloadValidator.parse(await req.json());
  // } catch (err: any) {
  //   return new Response(`Validation error: ${err.message}`, { status: 400 });
  // }
  // const { competitionId, eventId, roundNumber } = enterAttemptDto;

  // const [contest, event, round, contestAccessTokens] = await Promise.all([
  //   db.query.contests.findFirst({ columns: { state: true, createdBy: true }, where: { competitionId } }),
  //   db.query.events.findFirst({ columns: { format: true }, where: { eventId } }),
  //   db.query.rounds.findFirst({ where: { competitionId, eventId, roundNumber } }),
  //   db.query.accessTokens.findMany({ where: { competitionId } }),
  // ]);

  // const accessToken = await verifyAccessToken(token, contestAccessTokens);
  // if (!accessToken) return new Response("Unauthorized", { status: 401 });
  // if (!accessToken.createdBy)
  //   return new Response("Access token creator is missing. Please contact the development team.", { status: 500 });
  // if (!contest) return new Response(`Contest with ID ${competitionId} not found`, { status: 400 });
  // if (contest.state === "created") return new Response("This contest hasn't been approved yet", { status: 400 });
  // if (!event) return new Response(`Event with ID ${eventId} not found`, { status: 400 });
  // if (event.format !== "time") {
  //   return new Response("External data entry is currently only supported for events with the time format", {
  //     status: 501,
  //   });
  // }
  // if (!round) return new Response("Round not found", { status: 400 });

  // const persons = await getPersonsForExternalDeviceDataEntry(enterAttemptDto, accessToken.createdBy);
  // const roundResults = await db.query.results.findMany({ where: { roundId: round.id } });
  // const result = roundResults.find((r) => r.personIds.join(",") === persons.join(","));
  // const roundFormat = roundFormats.find((rf) => rf.value === round.format)!;
  // const attempts: Attempt[] = [];

  // for (let i = 0; i < roundFormat.attempts; i++) {
  //   if (i === enterAttemptDto.attemptNumber - 1) attempts.push({ result: enterAttemptDto.attemptResult });
  //   else if (result?.attempts[i]) attempts.push(result.attempts[i]);
  //   else attempts.push({ result: 0 });
  // }

  // const res = result
  //   ? await updateContestResultSF({ id: result.id, newAttempts: attempts })
  //   : await createContestResultSF({
  //       newResultDto: {
  //         eventId,
  //         personIds: persons.map((p) => p.id),
  //         attempts,
  //         competitionId,
  //         roundId: round.id,
  //       },
  //     });

  // if (res.serverError || res.validationErrors) return new Response(getActionError(res), { status: 500 });

  // return new Response("Successfully entered attempt", { status: 200 });
}
