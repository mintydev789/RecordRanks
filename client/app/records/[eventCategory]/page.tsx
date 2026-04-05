import omitBy from "lodash/omitBy";
import Link from "next/link";
import { Suspense } from "react";
import z from "zod";
import AffiliateLink from "~/app/components/AffiliateLink.tsx";
import EventButtons from "~/app/components/EventButtons.tsx";
import RegionSelect from "~/app/components/RegionSelect.tsx";
import Loading from "~/app/components/UI/Loading.tsx";
import Tabs from "~/app/components/UI/Tabs.tsx";
import RecordsTable from "~/app/records/[eventCategory]/RecordsTable.tsx";
import { eventCategories } from "~/helpers/eventCategories.ts";
import type { NavigationItem } from "~/helpers/types/NavigationItem.ts";
import { RecordCategoryValues } from "~/helpers/types.ts";
import { db } from "~/server/db/provider.ts";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { getRecords } from "~/server/serverOnlyFunctions.ts";

export const metadata = {
  title: "Records",
  description: process.env.METADATA_RECORDS_DESCRIPTION,
  openGraph: {
    images: [`${process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BUCKET_BASE_URL}/assets/screenshots/records.jpg`],
  },
};

const ParamsValidator = z.strictObject({
  eventCategory: z.string().nonempty(),
});
const SearchParamsValidator = z.strictObject({
  category: z.enum(RecordCategoryValues).nullable().optional(),
  eventId: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
});

type Props = {
  params: Promise<z.infer<typeof ParamsValidator>>;
  searchParams: Promise<z.infer<typeof SearchParamsValidator>>;
};

async function RecordsPage({ params, searchParams }: Props) {
  const { eventCategory } = ParamsValidator.parse(await params);
  const { category, eventId, region } = SearchParamsValidator.parse(await searchParams);

  const urlSearchParams = new URLSearchParams(omitBy({ category, eventId, region } as any, (val) => !val));
  const urlSearchParamsWithoutCategory = new URLSearchParams(omitBy({ eventId, region } as any, (val) => !val));

  const recordCategory = category ?? (eventCategory === "extreme-bld" ? "video-based-results" : "competitions");

  const recordsPromise = getRecords(eventCategory, recordCategory, eventId ?? undefined, region ?? undefined);

  const [events, regions] = await Promise.all([
    db.query.events.findMany({
      columns: { eventId: true, name: true, category: true, format: true, hidden: true, description: true },
      where: { hidden: false },
      orderBy: { rank: "asc" },
    }),
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  const selectedCat = eventCategories.find((ec) => ec.value === eventCategory)!;
  const tabs: NavigationItem[] = eventCategories
    // Only show categories that have at least one event
    .filter((ec) => events.some((e) => e.category === ec.value))
    .map((ec) => ({
      title: ec.title,
      shortTitle: ec.shortTitle,
      value: ec.value,
      route: `/records/${ec.value}?${urlSearchParams}`,
      hidden: ec.value === "removed",
    }));
  const selectedCatEvents = events.filter((e) => e.category === eventCategory);

  return (
    <section>
      <h2 className="mb-4 text-center">Records</h2>

      <AffiliateLink type={eventCategory === "unofficial" ? "fto" : eventCategory === "wca" ? "wca" : "other"} />

      <Tabs tabs={tabs} activeTab={eventCategory} forServerSidePage />

      <div className="px-2">
        {selectedCat.description && <p>{selectedCat.description}</p>}

        <h4>Event</h4>
        <EventButtons events={selectedCatEvents} resetOnSameEventClick showAllEvents />

        {/* Similar code to the rankings page */}
        <div className="d-flex flex-wrap gap-3">
          <RegionSelect regions={regions} />

          <div>
            <h5>Category</h5>
            {/* biome-ignore lint/a11y/useSemanticElements: this is the most suitable way to make a button group */}
            <div className="btn-group btn-group-sm mt-2" role="group" aria-label="Contest Type">
              <Link
                href={`/records/${eventCategory}?${
                  urlSearchParamsWithoutCategory.toString() ? `${urlSearchParamsWithoutCategory}&` : ""
                }category=competitions`}
                prefetch={false}
                className={`btn btn-primary ${recordCategory === "competitions" ? "active" : ""}`}
              >
                Competitions
              </Link>
              <Link
                href={`/records/${eventCategory}/?${
                  urlSearchParamsWithoutCategory.toString() ? `${urlSearchParamsWithoutCategory}&` : ""
                }category=meetups`}
                prefetch={false}
                className={`btn btn-primary ${recordCategory === "meetups" ? "active" : ""}`}
              >
                Meetups
              </Link>
              <Link
                href={`/records/${eventCategory}?${
                  urlSearchParamsWithoutCategory.toString() ? `${urlSearchParamsWithoutCategory}&` : ""
                }category=video-based-results`}
                prefetch={false}
                className={`btn btn-primary ${recordCategory === "video-based-results" ? "active" : ""}`}
              >
                Video-based
              </Link>
            </div>
          </div>
        </div>
      </div>

      {eventCategory === "extremebld" && (
        <Link href="/video-based-results/submit" prefetch={false} className="btn btn-success btn ms-2">
          Submit a result
        </Link>
      )}

      <Suspense fallback={<Loading />}>
        <RecordsTable
          recordsPromise={recordsPromise}
          events={events.filter((e) => e.category === eventCategory)}
          regions={regions}
        />
      </Suspense>
    </section>
  );
}

export default RecordsPage;
