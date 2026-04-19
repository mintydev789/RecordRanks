import { eq } from "drizzle-orm";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { db } from "~/server/db/provider.ts";
import { personsPublicCols, personsTable } from "~/server/db/schema/persons.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { authorizeUser, getSettingFromDb } from "~/server/serverOnlyFunctions.ts";
import UserSettingsScreen from "./UserSettingsScreen.tsx";

async function UserSettingsPage() {
  const { user } = await authorizeUser();

  const [[person], regions, userRequestInstructions] = await Promise.all([
    user.personId
      ? await db.select(personsPublicCols).from(personsTable).where(eq(personsTable.id, user.personId)).limit(1)
      : [],
    db.select(regionsPublicCols).from(regionsTable),
    getSettingFromDb({ key: "user-request-instructions", optional: true }),
  ]);

  return (
    <section className="px-3">
      <h2 className="mb-4 text-center">Settings</h2>

      <ToastMessages className="mb-4" />

      <UserSettingsScreen initPerson={person} regions={regions} userRequestInstructions={userRequestInstructions} />
    </section>
  );
}

export default UserSettingsPage;
