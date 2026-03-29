import "./bracket-matchup.css";
import Competitors from "~/app/components/Competitors.tsx";
import { C } from "~/helpers/constants.ts";
import type { PersonResponse } from "~/server/db/schema/persons.ts";
import type { RegionResponse } from "~/server/db/schema/regions";

const winStyle = { color: "black", background: C.color.rankingHighlight };
const lineStyle = { width: "10px" };
const offsetLineStyle: any = { ...lineStyle, marginLeft: "1rem", marginRight: "-1px" };

type Props = {
  matchupCode: number;
  top: boolean;
  seed1: number;
  seed2: number;
  team1: PersonResponse[];
  team2: PersonResponse[];
  wins1: number;
  wins2: number;
  regions: RegionResponse[];
};

function BracketMatchup({ matchupCode, top, seed1, seed2, team1, team2, wins1, wins2, regions }: Props) {
  return (
    // border-light DOESN'T WORK WITH LIGHT THEME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    <div className={`rr-bracket-matchup ${matchupCode >= 5 ? "border-light border-start" : ""}`}>
      <div />
      <div
        className="d-flex align-items-center text-secondary"
        style={{ gridRowStart: "span 2", marginInline: "0.7rem", width: "1rem" }}
      >
        {matchupCode}
      </div>

      <div className="rr-bracket-matchup__seed">{seed1}</div>
      <div className="rr-bracket-matchup__team">
        <Competitors persons={team1} regions={regions} vertical />
      </div>
      <div className="rr-bracket-matchup__result" style={wins1 > wins2 ? winStyle : {}}>
        {wins1}
      </div>

      {matchupCode < 7 && !top ? (
        <div className="border-bottom border-end border-light" style={offsetLineStyle} />
      ) : (
        <div />
      )}
      {matchupCode >= 5 ? <div className="border-light border-top" style={lineStyle} /> : <div />}

      <div className="rr-bracket-matchup__seed">{seed2}</div>
      <div className="rr-bracket-matchup__team">
        <Competitors persons={team2} regions={regions} vertical />
      </div>
      <div className="rr-bracket-matchup__result" style={wins2 > wins1 ? winStyle : {}}>
        {wins2}
      </div>

      {matchupCode < 7 && top ? (
        <div className="border-end border-light border-top" style={offsetLineStyle} />
      ) : (
        <div />
      )}
    </div>
  );
}

export default BracketMatchup;
