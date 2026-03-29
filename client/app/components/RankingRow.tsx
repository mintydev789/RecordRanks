"use client";

import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";
import Competitor from "~/app/components/Competitor.tsx";
import Competitors from "~/app/components/Competitors.tsx";
import RankingLinks from "~/app/components/RankingLinks.tsx";
import Region from "~/app/components/Region.tsx";
import Solves from "~/app/components/Solves.tsx";
import type { Ranking, RecordRanking } from "~/helpers/types/Rankings.ts";
import { getFormattedDate, getFormattedTime } from "~/helpers/utilityFunctions.ts";
import type { EventResponse } from "~/server/db/schema/events.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";

type BaseProps = {
  event: Pick<EventResponse, "name" | "category" | "format">;
  regions: RegionResponse[];
};

type RankingProps = BaseProps & {
  type: "single-ranking" | "average-ranking";
  ranking: Ranking;
  isTiedRanking: boolean;
  showAllTeammates: boolean;
  showTeamColumn: boolean;
  showDetailsColumn: boolean;
  showOnlyPersonWithId?: never;
};

type RecordProps = BaseProps & {
  type: "single-record" | "average-record";
  ranking: RecordRanking;
  isTiedRanking?: boolean;
  showAllTeammates?: never;
  showTeamColumn?: never;
  showDetailsColumn?: never;
  showOnlyPersonWithId: undefined | number;
};

function RankingRow({
  type,
  ranking,
  isTiedRanking,
  event,
  regions,
  showAllTeammates = false,
  showTeamColumn = false,
  showDetailsColumn = false,
  showOnlyPersonWithId,
}: RankingProps | RecordProps) {
  const [teamExpanded, setTeamExpanded] = useState(false);

  const isRecordRow = type === "single-record" || type === "average-record";
  const firstColumnValue = !isRecordRow
    ? (ranking as Ranking).ranking
    : type === "single-record"
      ? "Single"
      : ranking.attempts.length === 3
        ? "Mean"
        : "Average";
  const personsToDisplay = showAllTeammates
    ? ranking.persons
    : [
        ranking.personId
          ? ranking.persons.find((p) => p.id === ranking.personId)!
          : ranking.persons[showOnlyPersonWithId ?? 0],
      ];

  /////////////////////////////////////////////////////////////////////////////////////////
  // REMEMBER TO UPDATE THE MOBILE VIEW OF THE RECORDS PAGE IN ACCORDANCE WITH THIS
  /////////////////////////////////////////////////////////////////////////////////////////

  return (
    <tr>
      <td>
        {!showOnlyPersonWithId && <span className={isTiedRanking ? "text-secondary" : ""}>{firstColumnValue}</span>}
      </td>
      <td>
        <Competitors persons={personsToDisplay} regions={regions} noFlag={!showAllTeammates} />
      </td>
      <td>{!showOnlyPersonWithId && getFormattedTime(ranking.result, { event, showMultiPoints: !isRecordRow })}</td>
      {!showAllTeammates && (
        <td>
          <Region regionCode={personsToDisplay[0].regionCode} regions={regions} shorten />
        </td>
      )}
      <td>{!showOnlyPersonWithId && getFormattedDate(ranking.date)}</td>
      <td>
        {!showOnlyPersonWithId &&
          (ranking.contest ? (
            <span className="d-flex gap-2 align-items-center">
              <Region regionCode={ranking.contest.regionCode} regions={regions} noText />

              <Link href={`/competitions/${ranking.contest.competitionId}`} prefetch={false}>
                {ranking.contest.shortName}
              </Link>
            </span>
          ) : (
            <RankingLinks ranking={ranking} />
          ))}
      </td>
      {showTeamColumn && (
        <td>
          <div className="d-flex fs-6 flex-column gap-2 align-items-start">
            <span className="text-white">
              <button
                type="button"
                onClick={() => setTeamExpanded(!teamExpanded)}
                className="border-0 bg-transparent p-0 text-decoration-underline"
                style={{ cursor: "pointer" }}
              >
                {teamExpanded ? "Close" : "Open"}
              </button>
              <span>
                {teamExpanded ? <FontAwesomeIcon icon={faCaretDown} /> : <FontAwesomeIcon icon={faCaretRight} />}
              </span>
            </span>

            {teamExpanded && ranking.persons.map((p) => <Competitor key={p.id} person={p} regions={regions} />)}
          </div>
        </td>
      )}
      {(showDetailsColumn || isRecordRow) && (
        <td>
          {!showOnlyPersonWithId &&
            (["average-ranking", "average-record"].includes(type) ? (
              <Solves event={event} attempts={ranking.attempts} showMultiPoints={!isRecordRow} />
            ) : "memo" in ranking && ranking.memo ? (
              getFormattedTime(ranking.memo, { showDecimals: false, alwaysShowMinutes: true })
            ) : (
              ""
            ))}
        </td>
      )}
    </tr>
  );
}

export default RankingRow;
