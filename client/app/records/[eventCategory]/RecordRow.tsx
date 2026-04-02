"use client";

import Link from "next/link";
import Competitors from "~/app/components/Competitors.tsx";
import RankingLinks from "~/app/components/RankingLinks.tsx";
import Region from "~/app/components/Region.tsx";
import Solves from "~/app/components/Solves.tsx";
import type { RecordRanking } from "~/helpers/types/Rankings.ts";
import { getFormattedDate, getFormattedTime } from "~/helpers/utilityFunctions.ts";
import type { EventResponse } from "~/server/db/schema/events.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";

type Props = {
  event: Pick<EventResponse, "name" | "category" | "format">;
  regions: RegionResponse[];
  type: "single" | "average" | "single-and-avg";
  record: RecordRanking;
  mixedRecords?: boolean;
  showOnlyPersonWithId?: number;
};

function RecordRow({ type, record, event, regions, mixedRecords, showOnlyPersonWithId }: Props) {
  const date = getFormattedDate(record.date);
  const personsToDisplay = showOnlyPersonWithId === undefined ? record.persons : [record.persons[showOnlyPersonWithId]];

  return (
    <tr>
      <td>
        {!showOnlyPersonWithId &&
          (mixedRecords ? (
            date
          ) : (
            <span>{type === "single" ? "Single" : record.attempts.length === 3 ? "Mean" : "Average"}</span>
          ))}
      </td>
      <td>
        <Competitors persons={personsToDisplay} regions={regions} noFlag={!mixedRecords} />
      </td>
      <td>
        {!showOnlyPersonWithId &&
          (["single", "single-and-avg"].includes(type) || !mixedRecords) &&
          getFormattedTime(type === "average" ? record.average : record.best, { event })}
      </td>
      {mixedRecords && (
        <td>{["average", "single-and-avg"].includes(type) && getFormattedTime(record.average, { event })}</td>
      )}
      {!mixedRecords && (
        <td>
          <Region regionCode={personsToDisplay[0].regionCode} regions={regions} shorten />
        </td>
      )}
      {!mixedRecords && <td>{!showOnlyPersonWithId && date}</td>}
      <td>
        {!showOnlyPersonWithId &&
          (record.contest ? (
            <span className="d-flex gap-2 align-items-center">
              <Region regionCode={record.contest.regionCode} regions={regions} noText />

              <Link href={`/competitions/${record.contest.competitionId}`} prefetch={false}>
                {record.contest.shortName}
              </Link>
            </span>
          ) : (
            <RankingLinks ranking={record} />
          ))}
      </td>
      <td>{!showOnlyPersonWithId && type !== "single" && <Solves event={event} attempts={record.attempts} />}</td>
    </tr>
  );
}

export default RecordRow;
