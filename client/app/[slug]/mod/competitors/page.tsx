import { desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import ManageCompetitorsScreen from "~/app/[slug]/mod/competitors/ManageCompetitorsScreen.tsx";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import type { Creator } from "~/helpers/types.ts";
import { auth } from "~/server/auth.ts";
import { db } from "~/server/db/provider.ts";
import { usersTable } from "~/server/db/schema/auth-schema.ts";
import {
  type PersonResponse,
  personsPublicCols,
  type SelectPerson,
  personsTable as table,
} from "~/server/db/schema/persons.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { authorizeUser } from "~/server/server-only-functions.ts";

async function CompetitorsPage() {
  const { user } = await authorizeUser({ orgPermissions: { persons: ["create", "update", "delete"] } });

  const [{ success: canApprovePersons }, regions] = await Promise.all([
    auth.api.hasPermission({ headers: await headers(), body: { permissions: { persons: ["approve"] } } }),
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  let persons: SelectPerson[] | PersonResponse[] | undefined;
  let users: Creator[] | undefined;

  if (canApprovePersons) {
    persons = await db.select().from(table).orderBy(desc(table.id));
    const userIds = Array.from(new Set((persons as SelectPerson[]).filter((p) => p.createdBy).map((p) => p.createdBy)));

    users = await db
      .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, personId: usersTable.personId })
      .from(usersTable)
      .where(inArray(usersTable.id, userIds as string[]));
  } else {
    persons = await db
      .select(personsPublicCols)
      .from(table)
      .where(eq(table.createdBy, user.id))
      .orderBy(desc(table.id));
  }

  if (!persons || (canApprovePersons && !users)) return <LoadingError loadingEntity="persons" />;

  return (
    <section>
      <h2 className="mb-4 text-center">Manage Competitors</h2>

      <ManageCompetitorsScreen persons={persons} regions={regions} users={users as any} />
    </section>
  );
}

export default CompetitorsPage;
