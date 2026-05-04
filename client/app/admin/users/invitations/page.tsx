import { Suspense } from "react";
import OrganizationInvitationsScreen from "~/app/admin/users/invitations/OrganizationInvitationsScreen.tsx";
import { tabs } from "~/app/admin/users/tabs.ts";
import Loading from "~/app/components/UI/Loading.tsx";
import Tabs from "~/app/components/UI/Tabs.tsx";
import { authorizeUser } from "~/server/server-only-functions.ts";

async function InvitationsPage() {
  await authorizeUser({ permissions: { adminDashboard: ["view"] } });

  return (
    <>
      <Tabs tabs={tabs} activeTab="invitations" forServerSidePage />

      <Suspense fallback={<Loading />}>
        <OrganizationInvitationsScreen />
      </Suspense>
    </>
  );
}

export default InvitationsPage;
