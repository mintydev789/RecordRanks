import { eq } from "drizzle-orm";
import { SWRConfig } from "swr";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { db } from "~/server/db/provider.ts";
import { personsPublicCols, personsTable } from "~/server/db/schema/persons.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { authorizeUser, getSettingFromDb, getUserRequestDetails } from "~/server/server-only-functions.ts";
import UserSettingsScreen from "./UserSettingsScreen.tsx";

async function UserSettingsPage() {
  const { user } = await authorizeUser();

  const [[person], regions] = await Promise.all([
    user.personId
      ? await db.select(personsPublicCols).from(personsTable).where(eq(personsTable.id, user.personId)).limit(1)
      : [],
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  return (
    <section className="px-3">
      <h2 className="mb-4 text-center">Settings</h2>

      <ToastMessages className="mb-4" />

      <SWRConfig
        value={{
          fallback: {
            "user-request-details": getUserRequestDetails(user.id),
            "user-request-instructions": getSettingFromDb({ key: "user-request-instructions" }),
          },
        }}
      >
        <UserSettingsScreen initPerson={person} regions={regions} />
      </SWRConfig>
    </section>
  );
}

export default UserSettingsPage;
