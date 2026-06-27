import { C } from "~/helpers/constants.ts";
import type { Ranking, RecordRanking } from "~/helpers/types/Rankings.ts";

type Props = {
  ranking: Ranking | RecordRanking;
};

function RankingLinks({ ranking }: Props) {
  return (
    <div className="d-flex gap-2">
      {ranking.videoLink ? (
        <a href={ranking.videoLink} target="_blank" rel="noreferrer">
          Video
        </a>
      ) : (
        C.message.videoNoLongerAvailable
      )}
      {ranking.discussionLink && (
        <a href={ranking.discussionLink} target="_blank" rel="noreferrer">
          Discussion
        </a>
      )}
    </div>
  );
}

export default RankingLinks;
