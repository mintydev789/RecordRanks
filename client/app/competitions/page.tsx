import { and, eq, ne } from "drizzle-orm";
import { Suspense } from "react";
import ContestsTable from "~/app/components/ContestsTable.tsx";
import EventButtons from "~/app/components/EventButtons.tsx";
import Loading from "~/app/components/UI/Loading.tsx";
import { Continents, Countries } from "~/helpers/Countries.ts";
import { db } from "~/server/db/provider.ts";
import { eventsPublicCols, eventsTable } from "~/server/db/schema/events.ts";
import AffiliateLink from "../components/AffiliateLink.tsx";
import LoadingError from "../components/UI/LoadingError.tsx";
import RegionSelect from "../rankings/[eventId]/[singleOrAvg]/RegionSelect.tsx";

export const metadata = {
  title: "All contests | Cubing Contests",
  description: "List of unofficial Rubik's Cube competitions and speedcuber meetups.",
  keywords:
    "rubik's rubiks cube contest contests competition competitions meetup meetups speedcubing speed cubing puzzle",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
  openGraph: {
    images: [`${process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BUCKET_BASE_URL}/assets/screenshots/cubing_contests_2.jpg`],
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

  const filterBySuperRegion = !!region && Continents.some((c) => region === c.code);
  const regionCodes = filterBySuperRegion && Countries.filter((c) => c.superRegionCode === region).map((c) => c.code);
  const events = await db
    .select(eventsPublicCols)
    .from(eventsTable)
    .where(and(ne(eventsTable.category, "removed"), eq(eventsTable.hidden, false)))
    .orderBy(eventsTable.rank);

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
    with: eventId ? { rounds: { columns: { eventId: true } } } : undefined,
    where: {
      state: { notIn: ["created", "removed"] },
      rounds: eventId ? { eventId } : undefined,
      regionCode: regionCodes ? { in: regionCodes } : region,
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
            <EventButtons key={eventId} eventId={eventId} events={events} forPage="competitions" />
            <div style={{ maxWidth: "24rem" }}>
              <RegionSelect />
            </div>
          </div>

          <Suspense fallback={<Loading />}>
            <ContestsTable contestsPromise={contestsPromise} />
          </Suspense>
        </>
      )}
    </section>
  );
}

export default ContestsPage;
