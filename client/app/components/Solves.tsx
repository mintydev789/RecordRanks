import { getFormattedTime } from "~/helpers/utility-functions.ts";
import type { EventResponse } from "~/server/db/schema/events.ts";
import type { Attempt } from "~/server/db/schema/results.ts";

type Props = {
  event: Pick<EventResponse, "category" | "format">;
  attempts: Attempt[];
  showMultiPoints?: boolean;
};

function Solves({ event, attempts, showMultiPoints = false }: Props) {
  const best = Math.min(...attempts.map((a) => a.result));
  const worst = Math.max(...attempts.map((a) => a.result));
  let bestSolve: number | undefined;
  let worstSolve: number | undefined;

  return (
    <div className="d-flex gap-2">
      {attempts.map((attempt, index) => {
        if (bestSolve === undefined && attempt.result === best) bestSolve = index;
        if (bestSolve !== index && worstSolve === undefined && attempt.result === worst) worstSolve = index;
        const addParentheses = attempts.length === 5 && (index === bestSolve || index === worstSolve);

        return (
          <span key={index}>
            {addParentheses ? "(" : ""}
            {getFormattedTime(attempt.result, { event, showMultiPoints })}
            {addParentheses ? ")" : ""}
          </span>
        );
      })}
    </div>
  );
}

export default Solves;
