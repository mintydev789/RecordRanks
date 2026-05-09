import MemberRequestsScreen from "~/app/[slug]/mod/members/requests/MemberRequestsScreen.tsx";
import { getTabs } from "~/app/[slug]/mod/members/tabs.ts";
import Tabs from "~/app/components/UI/Tabs.tsx";
import { db } from "~/server/db/provider.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { authorizeUser } from "~/server/server-only-functions.ts";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function MemberRequestsPage({ params }: Props) {
  const { slug } = await params;
  await authorizeUser({ orgPermissions: { memberRequests: ["list"] } });

  const [memberRequests, regions] = await Promise.all([
    db.query.memberRequests.findMany({
      with: { user: { columns: { id: true, name: true, email: true } }, requestedPerson: true },
    }),
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  return (
    <>
      <Tabs tabs={getTabs(slug)} activeTab="member-requests" forServerSidePage />

      <MemberRequestsScreen memberRequests={memberRequests} regions={regions} />
    </>
  );
}

export default MemberRequestsPage;
