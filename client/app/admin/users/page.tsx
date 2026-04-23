import { inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { tabs } from "~/app/admin/users/tabs.ts";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import Tabs from "~/app/components/UI/Tabs.tsx";
import { C } from "~/helpers/constants.ts";
import { auth } from "~/server/auth.ts";
import { db } from "~/server/db/provider.ts";
import { personsPublicCols, personsTable } from "~/server/db/schema/persons.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { authorizeUser } from "~/server/server-only-functions.ts";
import ManageUsersScreen from "./ManageUsersScreen.tsx";

async function ManageUsersPage() {
  await authorizeUser({ permissions: { user: ["list"] } });

  const [res, accounts, regions] = await Promise.all([
    auth.api.listUsers({
      query: { sortBy: "createdAt", sortDirection: "desc", limit: C.maxUsers },
      headers: await headers(),
    }),
    db.query.accounts.findMany({ columns: { userId: true, providerId: true } }),
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  if (!res.users) return <LoadingError loadingEntity="users" />;

  // TO-DO: THIS SHOULDN'T BE NECESSARY!!!!! https://github.com/better-auth/better-auth/issues/7452
  const users = res.users as (typeof auth.$Infer.Session.user)[];
  const personIds = Array.from(new Set(users.filter((u) => u.personId).map((u) => u.personId!)));
  const persons = await db.select(personsPublicCols).from(personsTable).where(inArray(personsTable.id, personIds));

  const usersWithProviderIds = users.map((u) => ({
    ...u,
    providerId: accounts.find((a) => a.userId === u.id)!.providerId,
  }));

  return (
    <>
      <Tabs tabs={tabs} activeTab="users" forServerSidePage />

      <ManageUsersScreen users={usersWithProviderIds} userPersons={persons} regions={regions} />
    </>
  );
}

export default ManageUsersPage;
