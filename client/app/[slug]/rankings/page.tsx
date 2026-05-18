import { redirect } from "next/navigation";
import { db } from "~/server/db/provider.ts";
import { getOrgDetails } from "~/server/server-only-functions.ts";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function RankingsRedirectPage({ params }: Props) {
  const { slug } = await params;

  const organization = await getOrgDetails({ slug });
  const firstEvent = await db.query.events.findFirst({
    columns: { eventId: true },
    // TO-DO: MAKE THIS DYNAMICALLY USE THE FIRST EVENT CATEGORY!!!
    where: { organizationId: organization.id, hidden: false, category: "unofficial" },
    orderBy: { rank: "asc" },
  });

  if (!firstEvent) return <p>There are currently no events</p>;

  redirect(`/${slug}/rankings/${firstEvent.eventId}/single`, "replace");
}

export default RankingsRedirectPage;
