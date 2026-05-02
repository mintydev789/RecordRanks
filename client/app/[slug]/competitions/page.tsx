import { and, eq, ne } from "drizzle-orm";
import { Suspense } from "react";
import AffiliateLink from "~/app/components/AffiliateLink.tsx";
import ContestsTable from "~/app/components/ContestsTable.tsx";
import EventButtons from "~/app/components/EventButtons.tsx";
import RegionSelect from "~/app/components/RegionSelect.tsx";
import Loading from "~/app/components/UI/Loading.tsx";
import LoadingError from "~/app/components/UI/LoadingError.tsx";
import { type SuperRegionCode, SuperRegionCodeValues } from "~/helpers/types.ts";
import { db } from "~/server/db/provider.ts";
import { eventsPublicCols, eventsTable } from "~/server/db/schema/events.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";

export const metadata = {
  title: "Contests",
  description: process.env.METADATA_CONTESTS_DESCRIPTION,
  openGraph: {
    images: [`${process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BUCKET_BASE_URL}/assets/screenshots/contests.jpg`],
  },
};

type Props = {
  searchParams: Promise<{
    eventId?: string;
    region?: string;
  }>;
};

async function ContestsPage({ searchParams }: Props) {
  const { eventId, region } = await searchParams;

  const [events, regions] = await Promise.all([
    db
      .select(eventsPublicCols)
      .from(eventsTable)
      .where(and(ne(eventsTable.category, "removed"), eq(eventsTable.hidden, false)))
      .orderBy(eventsTable.rank),
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  const contestsPromise = db.query.contests.findMany({
    columns: {
      competitionId: true,
      shortName: true,
      type: true,
      city: true,
      regionCode: true,
      startDate: true,
      endDate: true,
      participants: true,
    },
    with: {
      region: region ? { columns: { code: true, superRegionCode: true } } : undefined,
      rounds: eventId ? { columns: { eventId: true } } : undefined,
    },
    where: {
      state: { notIn: ["created", "removed"] },
      // Filter by continent or by country
      region: SuperRegionCodeValues.includes(region as any)
        ? { superRegionCode: region as SuperRegionCode }
        : region
          ? { code: region }
          : undefined,
      rounds: eventId ? { eventId } : undefined,
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <section>
      <h2 className="mb-4 text-center">All Contests</h2>

      <AffiliateLink type="other" />

      {events.length === 0 ? (
        <LoadingError loadingEntity="contests" />
      ) : (
        <>
          <div className="mb-3 px-2">
            <EventButtons events={events} resetOnSameEventClick />
            <div style={{ maxWidth: "24rem" }}>
              <RegionSelect regions={regions} />
            </div>
          </div>

          <Suspense fallback={<Loading />}>
            <ContestsTable contestsPromise={contestsPromise} regions={regions} />
          </Suspense>
        </>
      )}
    </section>
  );
}

export default ContestsPage;
