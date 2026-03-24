import { eq } from "drizzle-orm";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { db } from "~/server/db/provider.ts";
import { personsPublicCols, personsTable } from "~/server/db/schema/persons.ts";
import { authorizeUser } from "~/server/serverOnlyFunctions.ts";
import UserSettingsScreen from "./UserSettingsScreen.tsx";

async function UserSettingsPage() {
  const { user } = await authorizeUser();

  const person = user.personId
    ? (await db.select(personsPublicCols).from(personsTable).where(eq(personsTable.id, user.personId)).limit(1)).at(0)
    : undefined;

  return (
    <section className="px-2">
      <h2 className="mb-4 text-center">Settings</h2>

      <ToastMessages className="mb-4" />

      <UserSettingsScreen initPerson={person} />
    </section>
  );
}

export default UserSettingsPage;
