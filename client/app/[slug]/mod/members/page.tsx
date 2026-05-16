import { inArray } from "drizzle-orm";
import { headers } from "next/headers";
import ManageMembersScreen from "~/app/[slug]/mod/members/ManageMembersScreen.tsx";
import { getTabs } from "~/app/[slug]/mod/members/tabs.ts";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import Tabs from "~/app/components/UI/Tabs.tsx";
import { C } from "~/helpers/constants.ts";
import { auth } from "~/server/auth.ts";
import { db } from "~/server/db/provider.ts";
import { personsPublicCols, personsTable } from "~/server/db/schema/persons.ts";
import { authorizeUser, getRegions } from "~/server/server-only-functions.ts";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function ManageMembersPage({ params }: Props) {
  const { slug } = await params;
  const { organization } = await authorizeUser({ useOrganization: true, orgRole: "admin" });

  const [membersData, regions] = await Promise.all([
    auth.api.listMembers({
      headers: await headers(),
      query: { organizationSlug: slug, sortBy: "createdAt", sortDirection: "desc", limit: C.maxMembers },
    }),
    getRegions(organization!.id),
  ]);

  if (!membersData.members) return <LoadingError loadingEntity="members" />;

  const personIds = Array.from(new Set(membersData.members.filter((m) => m.personId).map((m) => m.personId!)));
  const persons = await db.select(personsPublicCols).from(personsTable).where(inArray(personsTable.id, personIds));

  return (
    <>
      <Tabs tabs={getTabs(slug)} activeTab="members" forServerSidePage />

      <ManageMembersScreen members={membersData.members} memberPersons={persons} regions={regions} />
    </>
  );
}

export default ManageMembersPage;
