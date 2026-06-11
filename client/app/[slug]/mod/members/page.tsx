import { inArray } from "drizzle-orm";
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
  try {
    const { slug } = await params;
    const { organization, httpHeaders } = await authorizeUser({
      useOrganization: true,
      orgPermissions: { member: ["create", "update", "delete"] },
    });

    console.log("TEST", organization);
    const [membersData, regions] = await Promise.all([
      auth.api.listMembers({
        headers: httpHeaders,
        query: { organizationId: organization!.id, sortBy: "createdAt", sortDirection: "desc", limit: C.maxMembers },
      }),
      getRegions(organization!.id),
    ]);
    console.log(membersData);

    if (!membersData.members) return <LoadingError loadingEntity="members" />;

    const personIds = Array.from(new Set(membersData.members.filter((m) => m.personId).map((m) => m.personId!)));
    const persons = await db.select(personsPublicCols).from(personsTable).where(inArray(personsTable.id, personIds));

    return (
      <>
        <Tabs tabs={getTabs(slug)} activeTab="members" forServerSidePage />

        <ManageMembersScreen members={membersData.members} memberPersons={persons} regions={regions} />
      </>
    );
  } catch (err) {
    console.error(err);
  }
}

export default ManageMembersPage;
