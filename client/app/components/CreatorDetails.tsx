import type { ReactElement } from "react";
import Competitor from "~/app/components/Competitor.tsx";
import type { Creator } from "~/helpers/types.ts";
import type { PersonResponse } from "~/server/db/schema/persons.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";

type Props = {
  creator: Creator | undefined;
  person: PersonResponse | undefined;
  regions: RegionResponse[];
  createdExternally?: boolean;
  isCurrentUser?: boolean;
  small?: boolean;
};

function CreatorDetails({
  creator,
  person,
  regions,
  createdExternally = false,
  isCurrentUser = false,
  small = false,
}: Props) {
  if (creator && person && creator.personId !== person.id) {
    throw new Error(
      `Person ID doesn't match between creator object (${JSON.stringify(creator)}) and person object (${JSON.stringify(
        person,
      )})`,
    );
  }

  let specialCase: ReactElement | undefined;
  if (createdExternally) specialCase = <span className="text-warning">External device</span>;
  else if (!creator) specialCase = <span>Deleted user</span>;
  else if (isCurrentUser) specialCase = <span>Me</span>;

  if (specialCase) return small ? specialCase : <div className="mb-3">Created by:&#8194;{specialCase}</div>;

  const creatorName = <a href={`mailto:${creator!.email}`}>{creator!.name}</a>;
  const competitor = <Competitor person={person} regions={regions} noFlag />;

  if (small) {
    return (
      <span className="d-flex column-gap-2 flex-wrap align-items-center">
        {competitor}
        <span>({creatorName})</span>
      </span>
    );
  }

  return (
    <div className="d-flex column-gap-2 mb-3 flex-wrap align-items-center">
      <span>Created by:</span>

      {person ? (
        <>
          {competitor}
          <span>(user: {creatorName})</span>
        </>
      ) : (
        <span>{creatorName}</span>
      )}
    </div>
  );
}

export default CreatorDetails;
