"use client";

import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import Competitor from "~/app/components/Competitor.tsx";
import Competitors from "~/app/components/Competitors.tsx";
import RankingLinks from "~/app/components/RankingLinks.tsx";
import Region from "~/app/components/Region.tsx";
import Solves from "~/app/components/Solves.tsx";
import type { Ranking } from "~/helpers/types/Rankings.ts";
import { getFormattedDate, getFormattedTime, slugPath } from "~/helpers/utility-functions.ts";
import type { EventResponse } from "~/server/db/schema/events.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";

type Props = {
  event: Pick<EventResponse, "name" | "category" | "format">;
  regions: RegionResponse[];
  type: "single" | "average";
  ranking: Ranking;
  isTiedRanking: boolean;
  showAllTeammates: boolean;
  showTeamColumn: boolean;
  showDetailsColumn: boolean;
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
}: Props) {
  const { slug }: { slug: string } = useParams();

  const [teamExpanded, setTeamExpanded] = useState(false);

  const personsToDisplay = showAllTeammates
    ? ranking.persons
    : [ranking.personId ? ranking.persons.find((p) => p.id === ranking.personId)! : ranking.persons[0]];

  return (
    <tr>
      <td>
        <span className={isTiedRanking ? "text-secondary" : ""}>{ranking.ranking}</span>
      </td>
      <td>
        <Competitors persons={personsToDisplay} regions={regions} noFlag={!showAllTeammates} />
      </td>
      <td>{getFormattedTime(ranking.result, { event, showMultiPoints: true, isAverage: type === "average" })}</td>
      {!showAllTeammates && (
        <td>
          <Region regionCode={personsToDisplay[0].regionCode} regions={regions} shorten />
        </td>
      )}
      <td>{getFormattedDate(ranking.date)}</td>
      <td>
        {ranking.contest ? (
          <span className="d-flex gap-2 align-items-center">
            <Region regionCode={ranking.contest.regionCode} regions={regions} noText />

            <Link href={slugPath(slug, `/competitions/${ranking.contest.competitionId}`)} prefetch={false}>
              {ranking.contest.shortName}
            </Link>
          </span>
        ) : (
          <RankingLinks ranking={ranking} />
        )}
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
      {showDetailsColumn && (
        <td>
          {type === "average" ? (
            <Solves event={event} attempts={ranking.attempts} showMultiPoints />
          ) : (
            ranking.memo && getFormattedTime(ranking.memo, { showDecimals: false, alwaysShowMinutes: true })
          )}
        </td>
      )}
    </tr>
  );
}

export default RankingRow;
