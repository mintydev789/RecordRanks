import type fsType from "node:fs";
// import type { writeFile as writeFileType } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { eventsStub } from "~/__mocks__/stubs/eventsStub.ts";
import { roundFormats } from "~/helpers/roundFormats.ts";
import { compareAvgs, compareSingles, getNameAndLocalizedName } from "~/helpers/utilityFunctions.ts";
import { WcaCompetitionValidator } from "~/helpers/validators/wca/WcaCompetition.ts";
import type { auth as authType } from "~/server/auth.ts";
import type { db as dbType } from "~/server/db/provider.ts";
import { accountsTable, usersTable } from "~/server/db/schema/auth-schema.ts";
import { type InsertSetting, settingsTable } from "~/server/db/schema/settings.ts";
import { Countries } from "./helpers/Countries.ts";
import { C } from "./helpers/constants.ts";
import { RecordTypeValues } from "./helpers/types.ts";
import type { InsertContest } from "./server/db/schema/contests.ts";
import { eventsTable } from "./server/db/schema/events.ts";
import { type PersonResponse, personsTable } from "./server/db/schema/persons.ts";
import { recordConfigsTable } from "./server/db/schema/record-configs.ts";
import type { SelectResult } from "./server/db/schema/results.ts";

// Used in tests too
export const testUsers = [
  {
    email: "admin@example.com",
    username: "admin",
    name: "admin",
    password: "Temporary_good_password123", // replaced with "rr" below
    personId: 1,
    role: "admin",
    emailVerified: true,
  },
  {
    email: "mod@example.com",
    username: "mod",
    name: "mod",
    password: "Temporary_good_password123", // replaced with "rr" below
    personId: 2,
    role: "mod",
    emailVerified: true,
  },
  {
    email: "user@example.com",
    username: "user",
    name: "user",
    password: "Temporary_good_password123", // replaced with "rr" below
    personId: 3,
    emailVerified: true,
  },
  {
    email: "new_user@example.com",
    username: "new_user",
    name: "new_user",
    password: "Temporary_good_password123", // replaced with "rr" below
    emailVerified: false,
  },
];

// This is the scrypt password hash for the password "rr" and BETTER_AUTH_SECRET = "secret_thats_long_enough_to_be_accepted_by_better_auth".
// This is only used for testing locally during development.
const hashForRr =
  "d859ad30013cacccc94ce76301b6195a:9bf96ea34c749ec1d088f81b3827ed4027458fed99ee98949583e6ec0ad22e1743970f752638732cbb33addc3f0e887712304507e6caf040c57b7444d7cecd25";

const initSettings: InsertSetting[] = [
  {
    key: "error-logs-contact-email",
    group: "default",
    value: "",
    description: "Contact email address to send error logs to",
  },
  {
    key: "video-based-results-contact-email",
    group: "default",
    value: "",
    description: "Contact email address to send notifications about video-based results to",
  },
  {
    key: "about-page-content",
    group: "page-contents",
    value: "",
    description: "Page content for the about page (Markdown supported)",
  },
  {
    key: "video-based-results-instructions",
    group: "page-contents",
    value: `Video-based results can be submitted by any user, but there is a review process involved. Until a video-based result reviewer approves the result, it won't be included in the rankings. The review process works as follows:

1. Find the email thread for the result and check that there are no outstanding issues or questions from the author or other reviewers.
2. Click on the edit result button and open the video in a new tab.
3. Make sure the link doesn't contain any tracking parameters (e.g. \`?source=xyz\`).
4. Check that the video contains information about the competitor to verify that the correct person is selected.
5. Check that the correct event is being done in the video.
6. Check that the date is correct (the date of upload serves as evidence of when the result was achieved, which affects records).
7. Check the time and memorization time, if applicable. The time has to match exactly, but the memorization time can have a few seconds of leeway, since it doesn't affect rankings.
8. If everything is correct, submit and approve. If something is off or you would like to come back to the result later, simply submit to save your changes. You can also just close the tab without submitting.

If you see any errors, correct them before submitting. If you see anything that requires following up with the author, do not approve the result and send an email in the result submission thread. Some other things to note:

- Make sure the rules are being followed (you can find them on the result submission page).
- Don't approve your own results, let another reviewer do it.
- Bo3 and Bo5 formats are not available, since there's no point in them. Mo3 and Ao5 are used instead respectively, since in the video-based result rankings both single and average from the same result are considered.
- Reviewers can set "unknown" time using the \`U\` key when entering a result. This is used for events where simply getting a result is a significant achievement, but the video does not show the entire memorization and/or execution phase. Results like that get ranked last (for multi, points are still considered, but point ties lead to the result being ranked last). This also works on the submission page.
- Reviewers can set "video no longer available" for results that have already been verified, but the video has since been removed. This also works on the submission page.
- Once a result is approved, record results set on the same day or after are cancelled, if they are worse than the approved result. You will see this on the video-based results page after you approve the new record result. E.g. a \`1:00.41\` 4x4x4 Blindfolded ER set on 19.02.2026 cancels a \`1:01.58\` ER set on 23.02.2026.`,
    description:
      "These instructions are shown at the top of the video-based results page. Only video-based result reviewers can see this.",
  },
  {
    key: "collective-cubing-enabled",
    group: "features",
    value: "false",
    description:
      "Whether or not to enable Collective Cubing - the minigame where people solve a 2x2x2 Rubik's Cube one move at a time on the home page (true/false)",
  },
];

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { db }: { db: typeof dbType } = await import("~/server/db/provider.ts");

    // Seed init record configs
    if ((await db.select({ id: recordConfigsTable.id }).from(recordConfigsTable).limit(1)).length === 0) {
      console.log("Seeding init record configs...");

      for (let i = 0; i < RecordTypeValues.length; i++) {
        const recordTypeId = RecordTypeValues[i];

        await db.insert(recordConfigsTable).values([
          {
            recordTypeId,
            category: "competitions",
            label: `X${recordTypeId}`,
            rank: (i + 1) * 10,
            color: recordTypeId === "WR" ? C.color.danger : recordTypeId === "NR" ? C.color.success : C.color.warning,
          },
          {
            recordTypeId,
            category: "meetups",
            label: `M${recordTypeId}`,
            rank: 100 + (i + 1) * 10,
            color: recordTypeId === "WR" ? C.color.danger : recordTypeId === "NR" ? C.color.success : C.color.warning,
          },
          {
            recordTypeId,
            category: "video-based-results",
            label: `${recordTypeId.slice(0, -1)}B`,
            rank: 200 + (i + 1) * 10,
            color: recordTypeId === "WR" ? C.color.danger : recordTypeId === "NR" ? C.color.success : C.color.warning,
          },
        ]);
      }
    }

    // Seed init settings
    for (const initSetting of initSettings) {
      const [existingSetting] = await db
        .select({ id: settingsTable.id })
        .from(settingsTable)
        .where(eq(settingsTable.key, initSetting.key))
        .limit(1);

      if (!existingSetting) {
        const [createdSetting] = await db.insert(settingsTable).values(initSetting).returning();

        console.log(`Seeded setting: ${createdSetting.group}.${createdSetting.key}`);
      }
    }

    // Seed test data
    if (process.env.NODE_ENV !== "production") {
      const { auth }: { auth: typeof authType } = await import("~/server/auth.ts");

      if ((await db.select().from(personsTable)).length === 0) {
        console.log("Seeding test persons...");

        await db.insert(personsTable).values([
          { name: "Test Admin", regionCode: "CH", approved: true },
          { name: "Test Moderator", localizedName: "Localized Name", regionCode: "NR", approved: true },
          { name: "Test User", regionCode: "SG", approved: true },
          { name: "Test New User", regionCode: "UY", approved: true },
          { name: "Test Person 5", regionCode: "SE" },
          { name: "Test Person 6", regionCode: "GB" },
          { name: "Test Person 7", regionCode: "US" },
          { name: "Test Person 8", regionCode: "CA" },
          { name: "Test Person 9", regionCode: "CN" },
          { name: "Test Person 10", regionCode: "GB" },
        ]);
      }

      for (const testUser of testUsers) {
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, testUser.email)).limit(1);

        if (!existingUser) {
          if (process.env.EMAIL_HOST) {
            throw new Error(
              "The EMAIL_HOST environment variable must be empty while seeding the DB to avoid sending lots of verification emails for the users being seeded. Comment it out and then uncomment it again after the DB has been seeded.",
            );
          }

          const { role, emailVerified, ...body } = testUser;
          await auth.api.signUpEmail({ body });

          // Set emailVerified and personId
          const [user] = await db
            .update(usersTable)
            .set({ emailVerified, personId: testUser.personId })
            .where(eq(usersTable.email, testUser.email))
            .returning();

          await db.update(accountsTable).set({ password: hashForRr }).where(eq(accountsTable.userId, user.id));

          // Set role
          if (role) await db.update(usersTable).set({ role }).where(eq(usersTable.id, user.id));

          console.log(`Seeded test user: ${testUser.username}`);
        }
      }

      if ((await db.select().from(eventsTable)).length === 0) {
        console.log("Seeding test events...");

        await db.insert(eventsTable).values(eventsStub);
      }
    }

    if (process.env.DO_DB_CONSISTENCY_CHECKS === "true") {
      console.log("Checking for inconsistencies in the DB...");

      console.log("Checking for incorrectly ranked results...");

      const results = await db.query.results.findMany({
        columns: {
          id: true,
          eventId: true,
          best: true,
          average: true,
          competitionId: true,
          roundId: true,
          ranking: true,
        },
        where: { roundId: { isNotNull: true } },
        with: { round: { columns: { format: true } } },
        orderBy: { roundId: "asc", ranking: "asc" },
      });

      const incorrectlyRankedResults: Partial<SelectResult>[] = [];

      // Largely copied from setRankingAndProceedsValues()
      let expectedRanking = 1;
      let resultNumber = 1;
      let prevResult = results[0];
      let roundFormat = roundFormats.find((rf) => rf.value === results[0].round!.format)!;

      for (let i = 0; i < results.length; i++) {
        if (i > 0) {
          if (results[i].roundId !== prevResult.roundId) {
            expectedRanking = 1;
            resultNumber = 1;
            roundFormat = roundFormats.find((rf) => rf.value === results[i].round!.format)!;
          } else {
            resultNumber++;
            // If the result is worse than the previous one, update the ranking
            if (
              (roundFormat.isAverage && compareAvgs(prevResult, results[i], true) < 0) ||
              (!roundFormat.isAverage && compareSingles(prevResult, results[i]) < 0)
            ) {
              expectedRanking = resultNumber;
            }
            // If the result is better than the previous one, that means there is an inconsistency
            else if (
              (roundFormat.isAverage && compareAvgs(prevResult, results[i], true) > 0) ||
              (!roundFormat.isAverage && compareSingles(prevResult, results[i]) > 0)
            ) {
              incorrectlyRankedResults.push(results[i]);
            }
          }

          prevResult = results[i];
        }

        if (results[i].ranking !== expectedRanking) incorrectlyRankedResults.push(results[i]);
      }

      if (incorrectlyRankedResults.length > 0) {
        console.log(
          `Found the following results that were ranked incorrectly: ${JSON.stringify(incorrectlyRankedResults, null, 2)}`,
        );
      }
    }

    // Migrate DB data, if env var is set
    if (process.env.MIGRATE_DB !== "true") return;

    const fs: typeof fsType = await import("node:fs");
    // const { writeFile }: { writeFile: typeof writeFileType } = await import("node:fs/promises");

    const _unoffEventIdConverter = {
      "666": "666",
      "777": "777",
      rainb: "rainbow_cube",
      skewb: "skewb",
      "333si": "333_siamese",
      snake: "snake",
      mirbl: "333_mirror_blocks",
      "360": "360_puzzle",
      mstmo: "mmorphix",
      illus: "777_illusion",
      "333ni": "333_inspectionless",
      "333r3": "333_x3_relay",
      "333sbf": "333_speed_bld",
      "3sc": "333mts_old",
      "222oh": "222oh",
      magico: "magic_oh",
      "222bf": "222bf",
      sq1bf: "sq1_bld",
      mirbbf: "333_mirror_blocks_bld",
      "234": "234relay",
      magicc: "magic_chess",
      magicb: "magic_balls",
      magccc: "magic_create_cube",
    };

    const _eeEventIdConverter = {
      "113sia": "333_siamese",
      "1mguild": "miniguild",
      "222oh": "222oh",
      "222pyra": "pyramorphix",
      "223": "223_cuboid",
      "2mguild": "miniguild_2_person",
      "2to4relay": "234relay",
      "2to7relay": "234567relay",
      "332": "233_cuboid",
      "333bets": "333_bets",
      "333bfoh": "333bf_oh",
      "333ft": "333ft",
      "333omt": "333_oven_mitts",
      "333rescr": "333mts",
      "333scr": "333_scrambling",
      "333ten": "333_x10_relay",
      "3mguild": "miniguild_3_person",
      "444ft": "444ft",
      "444pyra": "mpyram",
      "888": "888",
      "999": "999",
      clockscr: "clock_scrambling",
      curvycopter: "curvycopter",
      dino: "dino",
      fifteen: "15puzzle",
      fto: "fto",
      ivy: "ivy_cube",
      kilo: "kilominx",
      mirror: "333_mirror_blocks",
      mirrorbld: "333_mirror_blocks_bld",
      redi: "redi",
      teambld: "333_team_bld_old",
    };

    const doArchiveMigration = false;
    if (doArchiveMigration) {
      console.log("Doing archive migration...");

      const eeCompetitionsDump = JSON.parse(fs.readFileSync("./dump/other/ee_competitions.json") as any) as any[];
      const eeCountriesDump = JSON.parse(fs.readFileSync("./dump/other/ee_countries.json") as any) as any[];
      const eeOrganizersDump = JSON.parse(fs.readFileSync("./dump/other/ee_organizers.json") as any) as any[];

      let reachedCheckpoint = false;
      for (const eeComp of eeCompetitionsDump) {
        if (!reachedCheckpoint) {
          if (eeComp.id === "x") reachedCheckpoint = true;
          else continue;
        }
        if (eeComp.status !== "completed") {
          console.log(`EE competition ${eeComp.id} has status ${eeComp.status}, skipping...`);
          continue;
        }

        const sameCompInCc = await db.query.contests.findFirst({ where: { competitionId: eeComp.id } });
        if (sameCompInCc) console.log(`EE competition with ID ${eeComp.id} is already in the CC DB, checking...`);
        else console.log(`New competition from EE DB: ${eeComp.id}`);
        const eeCountry = eeCountriesDump.find((c) => c.id === eeComp.country_id);
        if (!eeCountry || !Countries.some((c) => c.code === eeCountry.iso2))
          throw new Error(`Country not found: ${eeComp.country_id}`);
        const eeDumpOrganizers = eeOrganizersDump.filter((o) => o.competition_id === eeComp.id);

        await new Promise((res) => setTimeout(res, 1000));
        const wcaCompData = await fetch(`${C.wcaApiBaseUrl}/competitions/${eeComp.id}`).then(async (res) => {
          const notFoundMsg = `Competition with ID ${eeComp.id} not found`;
          if (res.status === 404) throw new Error(notFoundMsg);
          if (!res.ok) throw new Error(C.unknownErrorMsg);
          const data = await res.json();
          if (!data.competitor_limit) data.competitor_limit = 10;
          return WcaCompetitionValidator.parse(data);
        });

        const organizers: PersonResponse[] = [];
        const organizersWcaInternalIds = new Set<number>();
        const notFoundPersonNames = new Set<string>();

        // Set organizer objects
        for (const org of [
          ...wcaCompData.organizers,
          ...wcaCompData.delegates,
          ...eeDumpOrganizers.map((o) => ({
            id: o.person,
            wca_id: o.person,
            name: "EE person",
            country_iso2: "EE person",
          })),
        ]) {
          // It's possible that the same person is both a delegate and organizer
          if (organizersWcaInternalIds.has(org.id)) continue;
          organizersWcaInternalIds.add(org.id);
          const { name } = getNameAndLocalizedName(org.name);

          const person = org.wca_id
            ? await db.query.persons.findFirst({ where: { wcaId: org.wca_id } })
            : await db.query.persons.findFirst({ where: { name: { ilike: name }, regionCode: org.country_iso2 } });

          if (!org.wca_id && person && person.name !== name)
            console.log(`Assuming ${org.name} (no WCA ID) is ${person.name} from the CC DB`);

          if (!person)
            notFoundPersonNames.add(
              `${org.name}${org.wca_id ? ` (WCA ID: ${org.wca_id})` : ` (country: ${org.country_iso2})`}`,
            );
          else if (!organizers.some((o) => o.id === person.id)) organizers.push(person);
        }

        if (notFoundPersonNames.size > 0) {
          const notFoundNames = Array.from(notFoundPersonNames).join(", ");
          console.error(`Organizers with these names were not found: ${notFoundNames}`);
        }
        if (eeCountry.iso2 !== wcaCompData.country_iso2)
          console.error(`Country field from ${eeComp.id} is wrong in EE DB (${eeCountry.iso2})`);
        if (eeComp.name !== wcaCompData.name)
          console.error(`Name field from ${eeComp.id} is wrong in EE DB (${eeComp.name})`);
        if (eeComp.city !== wcaCompData.city)
          console.error(`City field from ${eeComp.id} is wrong in EE DB (${eeComp.city})`);
        if (new Date(eeComp.start_date).getTime() !== new Date(wcaCompData.start_date).getTime())
          console.error(`Start date field from ${eeComp.id} is wrong in EE DB (${eeComp.start_date})`);
        if (new Date(eeComp.end_date).getTime() !== new Date(wcaCompData.end_date).getTime())
          console.error(`End date field from ${eeComp.id} is wrong in EE DB (${eeComp.end_date})`);
        const missingEeOrganizer = eeDumpOrganizers.find((o) => !organizers.some((o2) => o2.wcaId === o.person));
        if (missingEeOrganizer)
          console.error(`EE organizer from organizers dump for ${eeComp.id} is missing: ${missingEeOrganizer.person}`);

        const insertContestObject: InsertContest = {
          competitionId: eeComp.id,
          state: "approved",
          name: wcaCompData.name,
          shortName: wcaCompData.short_name,
          type: "wca-comp",
          city: wcaCompData.city,
          regionCode: wcaCompData.country_iso2,
          venue: wcaCompData.venue.split("]")[0].replace("[", ""),
          address: wcaCompData.venue_address,
          latitudeMicrodegrees: parseInt(String(wcaCompData.latitude_degrees).replace(".", ""), 10),
          longitudeMicrodegrees: parseInt(String(wcaCompData.longitude_degrees).replace(".", ""), 10),
          startDate: new Date(wcaCompData.start_date),
          endDate: new Date(wcaCompData.end_date),
          organizerIds: organizers.map((o) => o.id),
          contact: eeComp.contact,
          description: "",
          competitorLimit: wcaCompData.competitor_limit,
          // schedule: ,
          createdAt: new Date(eeComp.create_timestamp),
          updatedAt: new Date(eeComp.update_timestamp),
        };

        if (sameCompInCc) {
          if (sameCompInCc.name !== insertContestObject.name)
            console.error(`Name field from ${eeComp.id} is wrong in CC DB`);
          if (sameCompInCc.shortName !== insertContestObject.shortName)
            console.error(`Short name field from ${eeComp.id} is wrong in CC DB`);
          if (sameCompInCc.city !== insertContestObject.city)
            console.error(`City field from ${eeComp.id} is wrong in CC DB`);
          if (sameCompInCc.regionCode !== insertContestObject.regionCode)
            console.error(`Country field from ${eeComp.id} is wrong in CC DB`);
          if (sameCompInCc.venue !== insertContestObject.venue)
            console.error(`Venue field from ${eeComp.id} is wrong in CC DB`);
          if (sameCompInCc.address !== insertContestObject.address)
            console.error(`Address field from ${eeComp.id} is wrong in CC DB`);
          if (sameCompInCc.latitudeMicrodegrees !== insertContestObject.latitudeMicrodegrees)
            console.error(`Latitude microdegrees field from ${eeComp.id} is wrong in CC DB`);
          if (sameCompInCc.longitudeMicrodegrees !== insertContestObject.longitudeMicrodegrees)
            console.error(`Longitude microdegrees field from ${eeComp.id} is wrong in CC DB`);
          if (sameCompInCc.startDate.getTime() !== insertContestObject.startDate.getTime())
            console.error(`Start date field from ${eeComp.id} is wrong in CC DB`);
          if (sameCompInCc.endDate.getTime() !== insertContestObject.endDate.getTime())
            console.error(`End date field from ${eeComp.id} is wrong in CC DB`);
          const orgNotInCc = insertContestObject.organizerIds.find((oid) => !sameCompInCc.organizerIds.includes(oid));
          if (orgNotInCc)
            console.error(`EE DB has organizer with ID ${orgNotInCc} for ${eeComp.id} that's missing in CC DB`);
          if (sameCompInCc.competitorLimit !== insertContestObject.competitorLimit)
            console.error(`Competitor limit field from ${eeComp.id} is wrong in CC DB`);
        }
      }

      console.log("Archive migration done");
    }

    // const doSetResultRecords = false
    // if (doSetResultRecords) {
    //   console.log("Setting result records...");

    //   const recordMapper = (result: SelectResult, event: Pick<SelectEvent, "format" | "category">) => {
    //     const country = Countries.find((c) => c.code === result.regionCode);
    //     const continent = Continents.find((c) => c.code === result.superRegionCode);
    //     const getRecordLabel = (key: "regionalSingleRecord" | "regionalAverageRecord") =>
    //       result.recordCategory === "competitions"
    //         ? `X${result[key]}`
    //         : result.recordCategory === "meetups"
    //           ? `M${result[key]}`
    //           : `${result[key]?.slice(0, -1)}B`;

    //     const temp = {
    //       persons: result.personIds!.map((pid) => personsDump.find((p) => p.personId === pid)!.name),
    //       date: result.date.toDateString(),
    //     };

    //     if (country) (temp as any).regionCode = country.name;
    //     if (continent) (temp as any).superRegionCode = continent.name;

    //     if (result.regionalSingleRecord) {
    //       (temp as any).regionalSingleRecord = getRecordLabel("regionalSingleRecord");
    //       (temp as any).best = getFormattedTime(result.best, { event: event as any });
    //     } else {
    //       (temp as any).regionalAverageRecord = getRecordLabel("regionalAverageRecord");
    //       (temp as any).average = getFormattedTime(result.average, { event: event as any });
    //     }

    //     return temp;
    //   };

    //   await db.transaction(async (tx) => {
    //     for (const category of ["meetups", "video-based-results", "competitions"]) {
    //       for (const event of eventsDump) {
    //         if (!(await tx.query.results.findFirst({ columns: { id: true }, where: { eventId: event.eventId } }))) {
    //           console.log(`No results found for event ${event.eventId}, skipping`);
    //           continue;
    //         }

    //         const newWrResults = [];

    //         // From this date onwards, average records are only set for results with the same number of attempts as the ranked average format
    //         const cutoffDateForFlexibleAverageRecords = "2023-01-01T00:00:00.000Z",
    //         for (const bestOrAverage of ["best", "average"] as ("best" | "average")[]) {
    //           const recordField = bestOrAverage === "best" ? "regionalSingleRecord" : "regionalAverageRecord";
    //           const defaultNumberOfAttempts = getDefaultAverageAttempts(event.defaultRoundFormat);
    //           const numberOfAttemptsCondition =
    //             bestOrAverage === "best"
    //               ? sql``
    //               : sql`AND (${resultsTable.date} < ${cutoffDateForFlexibleAverageRecords}
    //                       OR CARDINALITY(${resultsTable.attempts}) = ${defaultNumberOfAttempts})`;

    //           const newWrIds = await tx
    //             .execute(sql`
    //             WITH day_min_times AS (
    //               SELECT ${resultsTable.id}, ${resultsTable.date}, ${resultsTable[bestOrAverage]},
    //                 MIN(${resultsTable[bestOrAverage]}) OVER(PARTITION BY ${resultsTable.date}
    //                   ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS day_min_time
    //               FROM ${resultsTable}
    //               WHERE ${resultsTable[bestOrAverage]} > 0
    //                 AND ${resultsTable.eventId} = ${event.eventId}
    //                 AND ${resultsTable.recordCategory} = ${category}
    //                 ${numberOfAttemptsCondition}
    //               ORDER BY ${resultsTable.date}
    //             ), results_with_record_times AS (
    //               SELECT id, MIN(day_min_time) OVER(ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS curr_record
    //               FROM day_min_times
    //               ORDER BY date
    //             )
    //             SELECT ${resultsTable.id}
    //             FROM ${resultsTable} RIGHT JOIN results_with_record_times
    //             ON ${resultsTable.id} = results_with_record_times.id
    //             WHERE (${resultsTable[recordField]} IS NULL OR ${resultsTable[recordField]} <> 'WR')
    //               AND ${resultsTable[bestOrAverage]} = results_with_record_times.curr_record`)
    //             .then((val: any) => val.map(({ id }: any) => id));

    //           newWrResults.push(
    //             ...(await tx
    //               .update(resultsTable)
    //               .set({ [recordField]: "WR" })
    //               .where(inArray(resultsTable.id, newWrIds))
    //               .returning()),
    //           );

    //           for (const crType of ContinentalRecordTypes) {
    //             const superRegionCode = Continents.find((c) => c.recordTypeId === crType)!.code;

    //             const newCrIds = await tx
    //               .execute(sql`
    //               WITH day_min_times AS (
    //                 SELECT ${resultsTable.id}, ${resultsTable.date}, ${resultsTable[bestOrAverage]},
    //                   MIN(${resultsTable[bestOrAverage]}) OVER(PARTITION BY ${resultsTable.date}
    //                     ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS day_min_time
    //                 FROM ${resultsTable}
    //                 WHERE ${resultsTable[bestOrAverage]} > 0
    //                   AND ${resultsTable.eventId} = ${event.eventId}
    //                   AND ${resultsTable.superRegionCode} = ${superRegionCode}
    //                   AND ${resultsTable.recordCategory} = ${category}
    //                   ${numberOfAttemptsCondition}
    //                 ORDER BY ${resultsTable.date}
    //               ), results_with_record_times AS (
    //                 SELECT id, MIN(day_min_time) OVER(ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS curr_record
    //                 FROM day_min_times
    //                 ORDER BY date
    //               )
    //               SELECT ${resultsTable.id}
    //               FROM ${resultsTable} RIGHT JOIN results_with_record_times
    //               ON ${resultsTable.id} = results_with_record_times.id
    //               WHERE (${resultsTable[recordField]} IS NULL OR ${resultsTable[recordField]} = 'NR')
    //                 AND ${resultsTable[bestOrAverage]} = results_with_record_times.curr_record`)
    //               .then((val: any) => val.map(({ id }: any) => id));

    //             if (newCrIds.length > 0) {
    //               await tx
    //                 .update(resultsTable)
    //                 .set({ [recordField]: crType })
    //                 .where(inArray(resultsTable.id, newCrIds))
    //                 .returning();
    //             }
    //           }

    //           const newNrIds = [];

    //           for (const code of Countries.map((c) => c.code)) {
    //             const nrIdsForCountry = await tx.execute(sql`
    //               WITH day_min_times AS (
    //                 SELECT ${resultsTable.id}, ${resultsTable.date}, ${resultsTable[bestOrAverage]},
    //                   MIN(${resultsTable[bestOrAverage]}) OVER(PARTITION BY ${resultsTable.date}
    //                     ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS day_min_time
    //                 FROM ${resultsTable}
    //                 WHERE ${resultsTable[bestOrAverage]} > 0
    //                   AND ${resultsTable.eventId} = ${event.eventId}
    //                   AND ${resultsTable.regionCode} = ${code}
    //                   AND ${resultsTable.recordCategory} = ${category}
    //                   ${numberOfAttemptsCondition}
    //                 ORDER BY ${resultsTable.date}
    //               ), results_with_record_times AS (
    //                 SELECT id, MIN(day_min_time) OVER(ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS curr_record
    //                 FROM day_min_times
    //                 ORDER BY date
    //               )
    //               SELECT ${resultsTable.id}
    //               FROM ${resultsTable} RIGHT JOIN results_with_record_times
    //               ON ${resultsTable.id} = results_with_record_times.id
    //               WHERE ${resultsTable[recordField]} IS NULL
    //                 AND ${resultsTable[bestOrAverage]} = results_with_record_times.curr_record`);

    //             if (nrIdsForCountry.length > 0) newNrIds.push(...nrIdsForCountry.map(({ id }: any) => id));
    //           }

    //           if (newNrIds.length > 0) {
    //             await tx
    //               .update(resultsTable)
    //               .set({ [recordField]: "NR" })
    //               .where(inArray(resultsTable.id, newNrIds))
    //               .returning();
    //           }
    //         }

    //         // Save WRs, if there were any (could be that the event doesn't have any non-DNF results in the category)
    //         if (newWrResults.length > 0) {
    //           await writeFile(
    //             `./new_records/${event.eventId}_${newWrResults[0].regionalSingleRecord}s`,
    //             JSON.stringify(newWrResults.map(recordMapper as any), null, 2),
    //           );
    //         }
    //       }
    //     }
    //   });
    // }
  }
}
