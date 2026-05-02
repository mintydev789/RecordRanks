import omitBy from "lodash/omitBy";
import Link from "next/link";
import { Suspense } from "react";
import AffiliateLink from "~/app/components/AffiliateLink.tsx";
import EventButtons from "~/app/components/EventButtons.tsx";
import EventTitle from "~/app/components/EventTitle.tsx";
import RegionSelect from "~/app/components/RegionSelect.tsx";
import Loading from "~/app/components/UI/Loading";
import Tooltip from "~/app/components/UI/Tooltip";
import RankingsTable from "~/app/rankings/[eventId]/[type]/RankingsTable";
import { roundFormats } from "~/helpers/roundFormats";
import type { RecordCategory } from "~/helpers/types";
import { db } from "~/server/db/provider";
import { eventsPublicCols, eventsTable as table } from "~/server/db/schema/events";
import { regionsPublicCols, regionsTable } from "~/server/db/schema/regions.ts";
import { getRankings } from "~/server/server-only-functions.ts";

const eventsWith3x3 = [
  "333",
  "333oh",
  "333bf",
  "333bf_oh",
  "333fm",
  "333mbf",
  "333_team_bld",
  "333_team_bld_old",
  "333_linear_fm",
  "333_speed_bld",
  "333mts",
  "333ft",
  "333mbo",
  "333_team_factory",
  "333_one_move_team_factory",
  "333_inspectionless",
  "333_scrambling",
  "333oh_x2",
  "333_oven_mitts",
  "333_doubles",
  "333_one_side",
  "333_supersolve",
  "333_bets",
  "333_cube_mile",
  "333bf_2_person_relay",
  "333bf_3_person_relay",
  "333bf_4_person_relay",
  "333bf_8_person_relay",
  "333_oh_bld_team_relay",
];

// TO-DO: MAKE THIS DYNAMICALLY INCLUDE THE EVENT, IF POSSIBLE!!!!!
export const metadata = {
  title: "Rankings",
  description: process.env.METADATA_RANKINGS_DESCRIPTION,
  openGraph: {
    images: [`${process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BUCKET_BASE_URL}/assets/screenshots/rankings.jpg`],
  },
};

type Props = {
  params: Promise<{
    eventId: string;
    type: "single" | "average" | "all-avg-formats";
  }>;
  // Keep in mind that the rankings links on the records page also pass the search params along, so they have to match
  searchParams: Promise<{
    show?: "results";
    category?: RecordCategory | "all";
    region?: string;
    topN?: string;
  }>;
};

async function RankingsPage({ params, searchParams }: Props) {
  // All params are validated in getRankings()
  const { eventId, type } = await params;
  const { show, category, region, topN } = await searchParams;

  const urlSearchParams = new URLSearchParams(omitBy({ show, category, region, topN } as any, (val) => !val));
  const urlSearchParamsWithoutShow = new URLSearchParams(omitBy({ category, region, topN } as any, (val) => !val));
  const urlSearchParamsWithoutCategory = new URLSearchParams(omitBy({ show, region, topN } as any, (val) => !val));
  const urlSearchParamsWithoutTopN = new URLSearchParams(omitBy({ show, category, region } as any, (val) => !val));

  const [events, regions] = await Promise.all([
    db.select(eventsPublicCols).from(table).orderBy(table.rank),
    db.select(regionsPublicCols).from(regionsTable),
  ]);

  const visibleEvents = events.filter((e) => e.category !== "removed" && !e.hidden);
  const event = events.find((e) => e.eventId === eventId);
  if (!event) return <p className="fs-4 mx-3 mt-5 text-center">Event not found</p>;
  const recordCategory =
    category ??
    (event.category === "extreme-bld" || (event.category !== "unofficial" && event.submissionsAllowed)
      ? "online"
      : "competitions");
  const roundFormat = roundFormats.find((rf) => rf.value === event.defaultRoundFormat)!;

  const rankingsPromise = getRankings(event, type, recordCategory, {
    show,
    region,
    topN: topN ? parseInt(topN, 10) : undefined,
  });

  const affiliateLinkType = eventsWith3x3.includes(eventId)
    ? "3x3"
    : ["222", "222bf", "222fm", "222oh"].includes(eventId)
      ? "2x2"
      : event.category === "wca"
        ? "wca"
        : ["fto", "fto_bld", "fto_mbld", "mfto", "baby_fto"].includes(eventId)
          ? "fto"
          : ["333_mirror_blocks", "333_mirror_blocks_bld", "222_mirror_blocks"].includes(eventId)
            ? "mirror"
            : eventId === "kilominx"
              ? "kilominx"
              : "other";

  return (
    <section>
      <h2 className="mb-3 text-center">Rankings</h2>

      <AffiliateLink type={affiliateLinkType} />

      <div className="mb-3 px-2">
        <h4>Event</h4>
        <EventButtons
          events={visibleEvents}
          eventIdOverride={eventId}
          pathTemplate={`/rankings/__EVENT_ID__/${type}`}
        />

        {/* Similar code to the records page */}
        <div className="d-flex mb-4 flex-wrap gap-3">
          <RegionSelect regions={regions} />

          <div className="d-flex flex-wrap gap-3">
            <div>
              <h5 className="d-flex gap-1">
                Type
                {type === "all-avg-formats" && (
                  <Tooltip
                    id="type_tooltip"
                    text="Includes both Mo3 and Ao5 results, even if they don't match the ranked average format"
                  />
                )}
              </h5>
              {/* biome-ignore lint/a11y/useSemanticElements: this is the most suitable way to make a button group */}
              <div className="btn-group btn-group-sm mt-2" role="group" aria-label="Type">
                <Link
                  href={`/rankings/${eventId}/single?${urlSearchParams}`}
                  prefetch={false}
                  className={`btn btn-primary ${type === "single" ? "active" : ""}`}
                >
                  Single
                </Link>
                <Link
                  href={`/rankings/${eventId}/average?${urlSearchParams}`}
                  prefetch={false}
                  className={`btn btn-primary ${type === "average" ? "active" : ""}`}
                >
                  {roundFormat.bestAndWorstAttemptsToExclude > 0 ? "Average" : "Mean"}
                </Link>
                <Link
                  href={`/rankings/${eventId}/all-avg-formats?${urlSearchParams}`}
                  prefetch={false}
                  className={`btn btn-primary ${type === "all-avg-formats" ? "active" : ""}`}
                >
                  All Avgs
                </Link>
              </div>
            </div>

            <div>
              <h5>Show</h5>
              {/* biome-ignore lint/a11y/useSemanticElements: this is the most suitable way to make a button group */}
              <div className="btn-group btn-group-sm mt-2" role="group" aria-label="Show">
                <Link
                  href={`/rankings/${eventId}/${type}?${urlSearchParamsWithoutShow}`}
                  prefetch={false}
                  className={`btn btn-primary ${!show ? "active" : ""}`}
                >
                  Top Persons
                </Link>
                <Link
                  href={`/rankings/${eventId}/${type}?${
                    urlSearchParamsWithoutShow.toString() ? `${urlSearchParamsWithoutShow}&` : ""
                  }show=results`}
                  prefetch={false}
                  className={`btn btn-primary ${show ? "active" : ""}`}
                >
                  Top Results
                </Link>
              </div>
            </div>

            <div>
              <h5>Top</h5>
              {/* biome-ignore lint/a11y/useSemanticElements: this is the most suitable way to make a button group */}
              <div className="btn-group btn-group-sm mt-2" role="group" aria-label="Top">
                <Link
                  href={`/rankings/${eventId}/${type}?${urlSearchParamsWithoutTopN}`}
                  prefetch={false}
                  className={`btn btn-primary ${!topN || topN === "100" ? "active" : ""}`}
                >
                  100
                </Link>
                <Link
                  href={`/rankings/${eventId}/${type}?${
                    urlSearchParamsWithoutTopN.toString() ? `${urlSearchParamsWithoutTopN}&` : ""
                  }topN=1000`}
                  prefetch={false}
                  className={`btn btn-primary ${topN === "1000" ? "active" : ""}`}
                >
                  1000
                </Link>
                <Link
                  href={`/rankings/${eventId}/${type}?${
                    urlSearchParamsWithoutTopN.toString() ? `${urlSearchParamsWithoutTopN}&` : ""
                  }topN=10000`}
                  prefetch={false}
                  className={`btn btn-primary ${topN === "10000" ? "active" : ""}`}
                >
                  10000
                </Link>
              </div>
            </div>

            <div>
              <h5>Category</h5>
              {/* biome-ignore lint/a11y/useSemanticElements: this is the most suitable way to make a button group */}
              <div className="btn-group btn-group-sm mt-2" role="group" aria-label="Contest Type">
                <Link
                  href={`/rankings/${eventId}/${type}?${
                    urlSearchParamsWithoutCategory.toString() ? `${urlSearchParamsWithoutCategory}&` : ""
                  }category=competitions`}
                  prefetch={false}
                  className={`btn btn-primary ${recordCategory === "competitions" ? "active" : ""}`}
                >
                  Competitions
                </Link>
                <Link
                  href={`/rankings/${eventId}/${type}?${
                    urlSearchParamsWithoutCategory.toString() ? `${urlSearchParamsWithoutCategory}&` : ""
                  }category=meetups`}
                  prefetch={false}
                  className={`btn btn-primary ${recordCategory === "meetups" ? "active" : ""}`}
                >
                  Meetups
                </Link>
                <Link
                  href={`/rankings/${eventId}/${type}?${
                    urlSearchParamsWithoutCategory.toString() ? `${urlSearchParamsWithoutCategory}&` : ""
                  }category=online`}
                  prefetch={false}
                  className={`btn btn-primary ${recordCategory === "online" ? "active" : ""}`}
                >
                  Online
                </Link>
                <Link
                  href={`/rankings/${eventId}/${type}?${
                    urlSearchParamsWithoutCategory.toString() ? `${urlSearchParamsWithoutCategory}&` : ""
                  }category=all`}
                  prefetch={false}
                  className={`btn btn-primary ${recordCategory === "all" ? "active" : ""}`}
                >
                  All
                </Link>
              </div>
            </div>
          </div>
        </div>

        {(event.category === "extreme-bld" || event.submissionsAllowed) && (
          <Link
            href={`/video-based-results/submit?eventId=${eventId}`}
            prefetch={false}
            className="btn btn-success btn-sm"
          >
            Submit a result
          </Link>
        )}
      </div>

      <EventTitle event={event} showDescription />

      {event.category === "removed" ? (
        <p className="ms-2 text-danger">This is a removed event</p>
      ) : event.hidden ? (
        <p className="ms-2 text-danger">This is a hidden event</p>
      ) : undefined}

      <Suspense fallback={<Loading />}>
        <RankingsTable rankingsPromise={rankingsPromise} event={event} regions={regions} type={type} show={show} />
      </Suspense>
    </section>
  );
}

export default RankingsPage;
