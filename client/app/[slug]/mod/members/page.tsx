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
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function ManageMembersPage({ params }: Props) {
  const { slug } = await params;

  const [membersData, regions] = await Promise.all([
    // This checks whether the user has the required permissions too
    auth.api.listMembers({
      headers: await headers(),
      query: { organizationSlug: slug, sortBy: "createdAt", sortDirection: "desc", limit: C.maxMembers },
    }),
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  if (!membersData.members) return <LoadingError loadingEntity="members" />;

  const personIds = Array.from(new Set(membersData.members.filter((u) => u.personId).map((u) => u.personId!)));
  const persons = await db.select(personsPublicCols).from(personsTable).where(inArray(personsTable.id, personIds));

  return (
    <>
      <Tabs tabs={getTabs(slug)} activeTab="members" forServerSidePage />

      <ManageMembersScreen members={membersData.members} memberPersons={persons} regions={regions} />
    </>
  );
}

export default ManageMembersPage;
