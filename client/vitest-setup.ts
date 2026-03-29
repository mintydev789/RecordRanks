import { eq, sql } from "drizzle-orm";
import pino from "pino";
import { afterEach, beforeAll, vi } from "vitest";
import { apply as applyDbSchema, mockDb as db } from "~/__mocks__/dbProvider.ts";
import { contestsStub } from "~/__mocks__/stubs/contestsStub.ts";
import { eventsStub } from "~/__mocks__/stubs/eventsStub.ts";
import { personsStub } from "~/__mocks__/stubs/personsStub.ts";
import { recordConfigsStub } from "~/__mocks__/stubs/recordConfigsStub.ts";
import { regionsStub } from "~/__mocks__/stubs/regionsStub.ts";
import { resultsStub } from "~/__mocks__/stubs/resultsStub.ts";
import { roundsStub } from "~/__mocks__/stubs/roundsStub.ts";
import { testUsers } from "~/instrumentation.ts";
import { auth } from "~/server/auth.ts";
import { usersTable } from "~/server/db/schema/auth-schema.ts";
import { contestsTable } from "~/server/db/schema/contests.ts";
import { eventsTable } from "~/server/db/schema/events.ts";
import { personsTable } from "~/server/db/schema/persons.ts";
import { recordConfigsTable } from "~/server/db/schema/record-configs.ts";
import { regionsTable } from "~/server/db/schema/regions.ts";
import { resultsTable } from "~/server/db/schema/results.ts";
import { roundsTable } from "~/server/db/schema/rounds.ts";
import { rrSchema } from "~/server/db/schema/schema.ts";

vi.mock("server-only", () => ({}));

vi.mock("~/server/logger.ts", () => ({ logger: pino() }));

vi.mock("~/server/db/provider.ts", () => ({ db }));

beforeAll(async () => {
  await applyDbSchema();

  await Promise.all([
    db.insert(recordConfigsTable).values(recordConfigsStub),
    db.insert(eventsTable).values(eventsStub),
    db.insert(regionsTable).values(regionsStub),
  ]);

  // Mostly copied from instrumentation.ts
  for (const testUser of testUsers) {
    const { role, emailVerified, ...body } = testUser;
    await auth.api.signUpEmail({ body });

    // Set emailVerified and personId
    const [user] = await db
      .update(usersTable)
      .set({ emailVerified, personId: testUser.personId })
      .where(eq(usersTable.email, testUser.email))
      .returning();

    // Set role
    if (role) await db.update(usersTable).set({ role }).where(eq(usersTable.id, user.id));
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
});

export async function reseedTestData() {
  // This has to be done separately, because the results table has a foreign key reference to the rounds table
  await Promise.all([
    db.delete(resultsTable),
    db.execute(sql.raw(`ALTER SEQUENCE ${rrSchema.schemaName}.results_id_seq RESTART WITH 1`)),
  ]);

  await Promise.all([
    db.delete(roundsTable),
    db.execute(sql.raw(`ALTER SEQUENCE ${rrSchema.schemaName}.rounds_id_seq RESTART WITH 1`)),
    db.delete(contestsTable),
    db.execute(sql.raw(`ALTER SEQUENCE ${rrSchema.schemaName}.contests_id_seq RESTART WITH 1`)),
    db.delete(personsTable),
    db.execute(sql.raw(`ALTER SEQUENCE ${rrSchema.schemaName}.persons_id_seq RESTART WITH 1`)),
  ]);

  await Promise.all([
    db.insert(personsTable).values(personsStub.map(({ id, ...p }) => p)),
    db.insert(contestsTable).values(contestsStub),
    db.insert(roundsTable).values(roundsStub.map(({ id, ...r }) => r)),
    db.insert(resultsTable).values(resultsStub),
  ]);
}
