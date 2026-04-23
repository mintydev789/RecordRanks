import "server-only";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { camelCase } from "lodash";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import { C } from "~/helpers/constants.ts";
import { Continents } from "~/helpers/continents.ts";
import { getRankedAverageFormat, roundFormats } from "~/helpers/roundFormats.ts";
import type { Ranking, RecordRanking } from "~/helpers/types/Rankings.ts";
import {
  type GetOrCreatePersonObject,
  type RecordCategory,
  RecordCategoryValues,
  type RecordType,
  RecordTypeValues,
  type UserRequestDetails,
} from "~/helpers/types.ts";
import {
  compareAvgs,
  compareSingles,
  fetchWcaPerson,
  getActionError,
  getHasRole,
  getResultProceeds,
} from "~/helpers/utilityFunctions.ts";
import type { EnterAttemptPayloadDto } from "~/helpers/validators/EnterAttemptPayload.ts";
import { type DbTransactionType, db } from "~/server/db/provider.ts";
import { type ContestResponse, contestsTable } from "~/server/db/schema/contests.ts";
import { type EventResponse, eventsPublicCols, eventsTable } from "~/server/db/schema/events.ts";
import { type PersonResponse, personsPublicCols, personsTable, type SelectPerson } from "~/server/db/schema/persons.ts";
import { recordConfigsPublicCols, recordConfigsTable } from "~/server/db/schema/record-configs.ts";
import { type ResultResponse, resultsTable } from "~/server/db/schema/results.ts";
import type { RoundResponse } from "~/server/db/schema/rounds.ts";
import type { SettingKey } from "~/server/db/schema/settings.ts";
import type { FullUserRequest } from "~/server/db/schema/user-requests.ts";
import { sendErrorEmail } from "~/server/email/mailer.ts";
import { type LogCode, logger } from "~/server/logger.ts";
import { RrActionError } from "~/server/safeAction.ts";
import { updatePersonSF } from "~/server/serverFunctions/personServerFunctions.ts";
import { getNameAndLocalizedName } from "../helpers/utilityFunctions.ts";
import { auth } from "./auth.ts";
import type { RrPermissions } from "./permissions.ts";

export function logMessage(
  code: LogCode,
  message: string,
  { metadata, sendErrorLogEmail = false }: { metadata?: object; sendErrorLogEmail?: boolean } = {},
) {
  const messageWithCodeAndTimestamp = `${new Date().toISOString()} [${code}] ${message}`;

  // Log to terminal/Docker container (except page visit logs)
  if (code !== "RR0001") console.log(messageWithCodeAndTimestamp);

  if (!process.env.VITEST) {
    try {
      // The metadata is then handled in loggerUtils.js
      const childObject: any = { rrCode: code };
      if (metadata) childObject.rrMetadata = metadata;

      logger.child(childObject).info(messageWithCodeAndTimestamp);
    } catch (err) {
      console.error("Error while sending log to Supabase Analytics:", err);
    }

    if (code === "RR5000" && sendErrorLogEmail) {
      getSettingFromDb({ key: "error-logs-contact-email", optional: true })
        .then((contactEmail) => {
          if (contactEmail) sendErrorEmail(contactEmail, code, message);
        })
        .catch((err) => console.error("Error while sending email about error log:", err));
    }
  }
}

export async function authorizeUser({
  permissions,
}: {
  permissions?: RrPermissions;
} = {}): Promise<typeof auth.$Infer.Session> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  if (permissions) {
    const { success } = await auth.api.userHasPermission({ body: { userId: session.user.id, permissions } });
    if (!success) redirect("/login");

    // The user must have an assigned person to be able to do any operation except creating video-based results
    if (
      !session.user.personId &&
      (Object.keys(permissions).some((key) => key !== ("videoBasedResults" satisfies keyof typeof permissions)) ||
        permissions.videoBasedResults?.some((perm) => perm !== "create"))
    )
      redirect("/login");
  }

  return session;
}

export function getUserHasAccessToContest(
  user: typeof auth.$Infer.Session.user,
  contest: Pick<ContestResponse, "state" | "organizerIds">,
) {
  if (!user.personId) return false;
  if (contest.state === "removed") return false;
  if (getHasRole("admin", user.role)) return true;

  const modHasAccess =
    ["created", "approved", "ongoing"].includes(contest.state) && contest.organizerIds.includes(user.personId);
  return modHasAccess;
}

export async function getContestParticipantIds(tx: DbTransactionType, competitionId: string): Promise<number[]> {
  const results = await tx.query.results.findMany({ columns: { personIds: true }, where: { competitionId } });

  const participantIds = new Set<number>();
  for (const result of results) {
    for (const personId of result.personIds) {
      participantIds.add(personId);
    }
  }

  return Array.from(participantIds);
}

export async function getRecordConfigs(recordFor: RecordCategory) {
  const recordConfigs = await db
    .select(recordConfigsPublicCols)
    .from(recordConfigsTable)
    .where(eq(recordConfigsTable.category, recordFor));

  if (recordConfigs.length !== RecordTypeValues.length) {
    throw new Error(
      `The records are configured incorrectly. Expected ${RecordTypeValues.length} record configs for the category, but found ${recordConfigs.length}.`,
    );
  }

  return recordConfigs;
}

export async function getVideoBasedEvents() {
  const events = await db
    .select(eventsPublicCols)
    .from(eventsTable)
    .where(eq(eventsTable.submissionsAllowed, true))
    .orderBy(eventsTable.rank);

  return events;
}

const personsArrayJsonSql = sql`
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', ${personsTable.id},
      'name', ${personsTable.name},
      'localizedName', ${personsTable.localizedName},
      'regionCode', ${personsTable.regionCode},
      'wcaId', ${personsTable.wcaId}
    )
  )`;

export async function getRecords(
  eventCategory: string,
  recordCategory: RecordCategory,
  eventId?: string,
  region?: string,
): Promise<RecordRanking[]> {
  const events = await db.query.events.findMany({
    columns: { eventId: true },
    where: { eventId, hidden: false, category: eventCategory },
  });

  const recordTypes: RecordType[] = ["WR"];
  const continent = Continents.find((c) => c.code === region);

  if (region) {
    if (continent) {
      recordTypes.push(continent.recordTypeId);
    } else {
      const { superRegionRecordType } = (await db.query.regions.findFirst({
        columns: { superRegionRecordType: true },
        where: { code: region },
      }))!;
      recordTypes.push(superRegionRecordType, "NR");
    }
  }

  const records = await db
    .select({
      eventId: eventsTable.eventId,
      result: resultsTable,
      persons: sql`(SELECT ${personsArrayJsonSql} FROM ${personsTable} WHERE ${personsTable.id} = ANY(${resultsTable.personIds}))`,
      contest: {
        competitionId: contestsTable.competitionId,
        shortName: contestsTable.shortName,
        regionCode: contestsTable.regionCode,
        type: contestsTable.type,
      },
    })
    .from(eventsTable)
    .innerJoin(resultsTable, eq(eventsTable.eventId, resultsTable.eventId))
    .leftJoin(contestsTable, eq(resultsTable.competitionId, contestsTable.competitionId))
    .where(
      and(
        eq(resultsTable.approved, true),
        inArray(
          eventsTable.eventId,
          events.map((e) => e.eventId),
        ),
        eq(resultsTable.recordCategory, recordCategory),
        or(
          inArray(resultsTable.regionalSingleRecord, recordTypes),
          inArray(resultsTable.regionalAverageRecord, recordTypes),
        ),
        continent && recordTypes.includes(continent.recordTypeId)
          ? eq(resultsTable.superRegionCode, continent.code)
          : undefined,
        region && recordTypes.includes("NR") ? eq(resultsTable.regionCode, region) : undefined,
      ),
    )
    .orderBy(desc(resultsTable.date));

  return records.map((r) => {
    const type = recordTypes.includes(r.result.regionalSingleRecord as any)
      ? recordTypes.includes(r.result.regionalAverageRecord as any)
        ? "single-and-avg"
        : "single"
      : "average";

    return {
      rankingId: `${r.result.id}_${type}`,
      type,
      eventId: r.eventId,
      date: r.result.date,
      persons: r.persons as Pick<PersonResponse, "id" | "name" | "localizedName" | "regionCode" | "wcaId">[],
      best: r.result.best,
      average: r.result.average,
      attempts: r.result.attempts,
      contest: r.contest,
      videoLink: r.result.videoLink,
      discussionLink: r.result.discussionLink,
    };
  });
}

export async function getRankings(
  event: EventResponse,
  type: "single" | "average" | "all-avg-formats",
  recordCategory: RecordCategory | "all",
  {
    show = "persons",
    region,
    topN = 100,
  }: {
    show?: "persons" | "results";
    region?: string;
    topN?: number;
  },
): Promise<Ranking[]> {
  z.strictObject({
    type: z.enum(["single", "average", "all-avg-formats"]),
    recordCategory: z.enum([...RecordCategoryValues, "all"]),
    show: z.enum(["persons", "results"]).optional(),
    region: z.string().optional(),
    topN: z.int().min(1).max(C.maxRankings),
  }).parse({ type, recordCategory, show, region, topN });

  const bestOrAverage = type === "single" ? "best" : "average";
  const rankedAverageFormat = getRankedAverageFormat(event.defaultRoundFormat);
  const recordCategoryCondition =
    recordCategory === "all" ? sql`` : sql`AND ${resultsTable.recordCategory} = ${recordCategory}`;
  const numberOfAttemptsCondition =
    type === "average" ? sql`AND CARDINALITY(${resultsTable.attempts}) = ${rankedAverageFormat.attempts}` : sql``;
  const regionCondition = region
    ? Continents.some((c) => c.code === region)
      ? sql`AND ${resultsTable.superRegionCode} = ${region}`
      : sql`AND ${resultsTable.regionCode} = ${region}`
    : sql``;
  let rankings: Ranking[];

  const mapRankingsData = (val: any[]) =>
    val.map((item: any) => {
      const objectWithCamelCase: any = {};
      for (const [key, value] of Object.entries(item)) {
        if (key === "date") objectWithCamelCase[camelCase(key)] = new Date(value as string);
        // RANK() returns a BIGINT and result is BIGINT in the DB, which Drizzle returns as a string, so both need to be converted
        else if (["ranking", "result"].includes(key)) objectWithCamelCase[camelCase(key)] = Number(value);
        else objectWithCamelCase[camelCase(key)] = value;
      }
      return objectWithCamelCase;
    });

  // Top persons
  if (show === "persons") {
    rankings = await db
      .execute(sql`
        WITH personal_records AS (
          SELECT DISTINCT ON (person_id)
            CONCAT(${resultsTable.id}, '_', person_id) AS ranking_id,
            ${resultsTable.date},
            person_id,
            ${resultsTable.personIds} AS persons,
            ${resultsTable[bestOrAverage]} AS result,
            ${resultsTable.attempts},
            CASE WHEN ${resultsTable.competitionId} IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'competitionId', ${contestsTable.competitionId},
                'shortName', ${contestsTable.shortName},
                'type', ${contestsTable.type},
                'regionCode', ${contestsTable.regionCode}
              )
            ELSE NULL END AS contest,
            ${resultsTable.videoLink},
            ${resultsTable.discussionLink}
          FROM ${resultsTable}
            LEFT JOIN ${contestsTable}
              ON ${resultsTable.competitionId} = ${contestsTable.competitionId},
            UNNEST(${resultsTable.personIds}) AS person_id
          WHERE ${resultsTable.approved} IS TRUE
            AND ${resultsTable.eventId} = ${event.eventId}
            ${recordCategoryCondition}
            AND ${resultsTable[bestOrAverage]} > 0
            ${numberOfAttemptsCondition}
            ${regionCondition}
          ORDER BY person_id, ${resultsTable[bestOrAverage]}, ${resultsTable.date}
        ), rankings AS (
          SELECT
            personal_records.*,
            RANK() OVER (ORDER BY personal_records.result ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS ranking,
            (SELECT ${personsArrayJsonSql} FROM ${personsTable} WHERE ${personsTable.id} = ANY(personal_records.persons)) AS persons
          FROM personal_records
          ORDER BY ranking, personal_records.date
        )
        SELECT * FROM rankings
        WHERE rankings.ranking <= ${topN}
      `)
      .then(mapRankingsData);

    // If getting single rankings for an event that has memo, set the memo time from the attempts array for each entry
    if (type === "single" && event.hasMemo) {
      rankings = rankings.map((ranking) => {
        let memo: number | null = null;
        const numberOfAttemptsEqualToBest = ranking.attempts.filter((a) => a.result === ranking.result).length;
        if (numberOfAttemptsEqualToBest === 1)
          memo = ranking.attempts.find((a) => a.result === ranking.result)!.memo ?? null;
        return { ...ranking, memo };
      });
    }
  }
  // Top singles
  else if (type === "single") {
    rankings = await db
      .execute(sql`
        WITH rankings AS (
          SELECT
            CONCAT(${resultsTable.id}, '_', attempts_data.attempt_number) AS ranking_id,
            RANK() OVER (ORDER BY CAST(attempts_data.attempt->>'result' AS BIGINT) ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS ranking,
            ${resultsTable.date},
            (SELECT ${personsArrayJsonSql} FROM ${personsTable} WHERE ${personsTable.id} = ANY(${resultsTable.personIds})) AS persons,
            attempts_data.attempt->>'result' AS result,
            CAST(attempts_data.attempt->>'memo' AS INTEGER) AS memo,
            ${resultsTable.attempts},
            CASE WHEN ${resultsTable.competitionId} IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'competitionId', ${contestsTable.competitionId},
                'shortName', ${contestsTable.shortName},
                'type', ${contestsTable.type},
                'regionCode', ${contestsTable.regionCode}
              )
            ELSE NULL END AS contest,
            ${resultsTable.videoLink},
            ${resultsTable.discussionLink}
          FROM ${resultsTable}
            LEFT JOIN ${contestsTable}
              ON ${resultsTable.competitionId} = ${contestsTable.competitionId},
            UNNEST(${resultsTable.attempts}) WITH ORDINALITY AS attempts_data(attempt, attempt_number)
          WHERE ${resultsTable.approved} IS TRUE
            AND ${resultsTable.eventId} = ${event.eventId}
            ${recordCategoryCondition}
            AND CAST(attempts_data.attempt->>'result' AS BIGINT) > 0
            ${regionCondition}
          ORDER BY ranking, ${resultsTable.date}
        )
        SELECT * FROM rankings
        WHERE rankings.ranking <= ${topN}
      `)
      .then(mapRankingsData);
  }
  // Top averages
  else {
    rankings = await db
      .execute(sql`
        WITH rankings AS (
          SELECT
            CAST(${resultsTable.id} AS TEXT) AS ranking_id,
            RANK() OVER (ORDER BY ${resultsTable.average} ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS ranking,
            ${resultsTable.date},
            (SELECT ${personsArrayJsonSql} FROM ${personsTable} WHERE ${personsTable.id} = ANY(${resultsTable.personIds})) AS persons,
            ${resultsTable.average} AS result,
            ${resultsTable.attempts},
            CASE WHEN ${resultsTable.competitionId} IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'competitionId', ${contestsTable.competitionId},
                'shortName', ${contestsTable.shortName},
                'type', ${contestsTable.type},
                'regionCode', ${contestsTable.regionCode}
              )
            ELSE NULL END AS contest,
            ${resultsTable.videoLink},
            ${resultsTable.discussionLink}
          FROM ${resultsTable}
            LEFT JOIN ${contestsTable}
              ON ${resultsTable.competitionId} = ${contestsTable.competitionId}
          WHERE ${resultsTable.approved} IS TRUE
            AND ${resultsTable.eventId} = ${event.eventId}
            ${recordCategoryCondition}
            AND ${resultsTable.average} > 0
            ${numberOfAttemptsCondition}
            ${regionCondition}
          ORDER BY ${resultsTable.average}, ${resultsTable.date}
        )
        SELECT * FROM rankings
        WHERE rankings.ranking <= ${topN}
      `)
      .then(mapRankingsData);
  }

  return rankings!;
}

export async function setRankingAndProceedsValues(
  tx: DbTransactionType,
  results: ResultResponse[],
  round: RoundResponse,
) {
  const roundFormat = roundFormats.find((rf) => rf.value === round.format)!;
  const sortedResults = results.sort(roundFormat.isAverage ? (a, b) => compareAvgs(a, b, true) : compareSingles);
  let prevResult = sortedResults[0];
  let ranking = 1;

  for (let i = 0; i < sortedResults.length; i++) {
    if (i > 0) {
      // If the previous result was not tied with this one, increase ranking
      if (
        (roundFormat.isAverage && compareAvgs(prevResult, sortedResults[i], true) < 0) ||
        (!roundFormat.isAverage && compareSingles(prevResult, sortedResults[i]) < 0)
      ) {
        ranking = i + 1;
      }

      prevResult = sortedResults[i];
    }

    // Set proceeds if it's a non-final round and the result proceeds to the next round
    const proceeds = round.proceedValue
      ? getResultProceeds({ ...sortedResults[i], ranking }, round, roundFormat, sortedResults)
      : null;

    // Update the result in the DB, if something changed
    if (ranking !== sortedResults[i].ranking || proceeds !== sortedResults[i].proceeds)
      await tx.update(resultsTable).set({ ranking, proceeds }).where(eq(resultsTable.id, sortedResults[i].id));
  }
}

export async function approvePersons(
  tx: DbTransactionType,
  personsToBeApproved: Pick<SelectPerson, "id" | "name" | "localizedName" | "regionCode" | "wcaId">[],
) {
  const matchedPersonWcaIds: { name: string; wcaId: string }[] = [];

  for (const person of personsToBeApproved) {
    if (!person.wcaId) {
      const matchedPersonWcaId = await getPersonExactMatchWcaId(person);
      if (matchedPersonWcaId) matchedPersonWcaIds.push({ name: person.name, wcaId: matchedPersonWcaId });
    }
  }

  if (matchedPersonWcaIds.length > 0) {
    const matchesSummary = matchedPersonWcaIds
      .map((p) => `${p.name} has an exact name and country match with the WCA competitor with WCA ID ${p.wcaId}.`)
      .join("\n");
    throw new RrActionError(`${matchesSummary}\nResolve this manually on the manage competitors page and try again.`);
  }

  await tx
    .update(personsTable)
    .set({ approved: true })
    .where(
      inArray(
        personsTable.id,
        personsToBeApproved.map((p) => p.id),
      ),
    );
}

export async function getPersonExactMatchWcaId(
  person: Pick<SelectPerson, "name" | "localizedName" | "regionCode">,
  ignoredWcaMatches: string[] = [],
): Promise<string | null> {
  const res = await fetch(`${C.wcaV0ApiBaseUrl}/search/users?persons_table=true&q=${person.name}`);

  if (res.ok) {
    const { result: wcaPersons } = await res.json();

    for (const wcaPerson of wcaPersons) {
      const { name, localizedName } = getNameAndLocalizedName(wcaPerson.name);

      if (
        !ignoredWcaMatches.includes(wcaPerson.wca_id) &&
        name === person.name &&
        localizedName === person.localizedName &&
        wcaPerson.country_iso2 === person.regionCode
      ) {
        return wcaPerson.wca_id;
      }
    }

    return null;
  } else {
    throw new RrActionError("Error while fetching person matches from the WCA");
  }
}

export async function getOrCreatePersonByWcaId(
  wcaId: string,
  { creatorUserId, createdExternally = false }: { creatorUserId: string; createdExternally?: boolean },
): Promise<GetOrCreatePersonObject> {
  const [person] = await db.select(personsPublicCols).from(personsTable).where(eq(personsTable.wcaId, wcaId)).limit(1);
  if (person) return { person, isNew: false };

  const wcaPerson = await fetchWcaPerson(wcaId);
  if (!wcaPerson) throw new RrActionError(`Person with WCA ID ${wcaId} not found in the WCA API`);

  logMessage("RR0019", `Creating person with name ${wcaPerson.name} and WCA ID ${wcaId} (directly via WCA ID)`);

  const [createdPerson] = await db
    .insert(personsTable)
    .values({ ...wcaPerson, approved: true, createdBy: creatorUserId, createdExternally })
    .returning(personsPublicCols);

  return { person: createdPerson, isNew: true };
}

export async function syncPersonByWcaId(wcaId: string, personId: number): Promise<PersonResponse> {
  const person = await db.query.persons.findFirst({ columns: { wcaId: true }, where: { id: personId } });
  if (!person) throw new RrActionError("Person not found");
  // This error should theoretically never happen
  if (person.wcaId !== wcaId) {
    throw new RrActionError(
      "The WCA ID is different from the one assigned to the competitor already tied to this user. Please contact the admin team.",
    );
  }

  const wcaPerson = await fetchWcaPerson(wcaId);
  if (!wcaPerson) throw new RrActionError(`Person with WCA ID ${wcaId} not found in the WCA API`);

  const res = await updatePersonSF({ id: personId, newPersonDto: wcaPerson });

  if (res.serverError || res.validationErrors) throw new RrActionError(getActionError(res));

  return res.data!;
}

export async function getPersonsForExternalDeviceDataEntry(
  { registrantId, wcaId }: Pick<EnterAttemptPayloadDto, "registrantId" | "wcaId">,
  creatorUserId: string,
): Promise<PersonResponse[]> {
  if (wcaId) {
    const wcaIds = wcaId.split(",");
    const persons: PersonResponse[] = [];

    for (const wid of wcaIds) {
      const { person } = await getOrCreatePersonByWcaId(wid.toUpperCase(), { creatorUserId, createdExternally: true });
      persons.push(person);
    }

    return persons;
  } else if (typeof registrantId === "number") {
    const person = await db.query.persons.findFirst({ where: { id: registrantId } });
    if (!person) throw new Error(`Person with ID ${registrantId} not found`);
    return [person];
  } else {
    const personIds = registrantId!.split(",").map((part) => parseInt(part, 10));
    const persons = await db.query.persons.findMany({ where: { id: { in: personIds } } });

    const personsInPreservedOrder: PersonResponse[] = [];
    for (const pid of personIds) {
      const person = persons.find((p) => p.id === pid);
      if (!person) throw new Error(`Person with ID ${pid} not found`);
      personsInPreservedOrder.push(person);
    }

    return personsInPreservedOrder;
  }
}

export async function getSettingFromDb({ key, optional }: { key: SettingKey; optional?: never }): Promise<string>;
export async function getSettingFromDb({ key, optional }: { key: SettingKey; optional: true }): Promise<string | null>;
export async function getSettingFromDb({
  key,
  optional,
}: {
  key: SettingKey;
  optional?: true;
}): Promise<string | null> {
  const setting = await db.query.settings.findFirst({ columns: { value: true }, where: { key } });

  if (!setting?.value) {
    if (optional) return null;
    throw new Error(`Setting "${key}" ${setting ? "has no value" : "not found"}`);
  }

  return setting.value;
}

export async function getUserRequestDetails(userId: string): Promise<UserRequestDetails> {
  const [fullUserRequest, ownCreatedPersons] = await Promise.all([
    db.query.userRequests.findFirst({
      with: {
        requestedPerson: {
          columns: { id: true, name: true, localizedName: true, regionCode: true, wcaId: true, approved: true },
        },
      },
      where: { userId: userId },
    }) satisfies Promise<FullUserRequest | undefined>,
    db.query.persons.findMany({
      columns: { id: true },
      // This logic is consistent with updatePersonSF()
      where: { createdBy: userId, approved: false, wcaId: { isNull: true } },
    }),
  ]);

  if (ownCreatedPersons.length > 1) {
    throw new RrActionError(
      "You have somehow created more than one competitor profile. Please contact the admin team to assign your profile.",
    );
  }

  return { userRequest: fullUserRequest ?? null, ownRequestedPersonId: ownCreatedPersons.at(0)?.id };
}
