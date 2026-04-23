import UserRequestsScreen from "~/app/admin/users/requests/UserRequestsScreen.tsx";
import { tabs } from "~/app/admin/users/tabs.ts";
import Tabs from "~/app/components/UI/Tabs.tsx";
import { db } from "~/server/db/provider.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { authorizeUser } from "~/server/serverOnlyFunctions.ts";

async function UserRequestsPage() {
  await authorizeUser({ permissions: { user: ["list"] } });

  const [userRequests, regions] = await Promise.all([
    db.query.userRequests.findMany({
      with: { user: { columns: { id: true, name: true, email: true } }, requestedPerson: true },
    }),
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  return (
    <>
      <Tabs tabs={tabs} activeTab="user-requests" forServerSidePage />

      <UserRequestsScreen userRequests={userRequests} regions={regions} />
    </>
  );
}

export default UserRequestsPage;
