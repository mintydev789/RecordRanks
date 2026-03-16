import Markdown from "react-markdown";
import EventTitle from "~/app/components/EventTitle.tsx";
import { roundFormats } from "~/helpers/roundFormats.ts";
import type { SelectEvent } from "~/server/db/schema/events.ts";

type Props = {
  event: SelectEvent;
};

function EventInformation({ event }: Props) {
  const roundFormat = roundFormats.find((rf) => rf.value === event.defaultRoundFormat)!;
  const mo3Format = roundFormats.find((rf) => rf.value === "m")!;
  const ao5Format = roundFormats.find((rf) => rf.value === "a")!;
  const rankedAverageFormat = roundFormat.bestAndWorstAttemptsToExclude > 0 ? ao5Format : mo3Format;
  const formatsAreSame = roundFormat.value === rankedAverageFormat.value;

  return (
    <div key={event.eventId} className="mt-4">
      <EventTitle event={event} fontSize="4" showIcon linkToRankings />
      {event.rule && (
        <div style={{ overflowX: "auto" }}>
          <Markdown>{event.rule}</Markdown>
        </div>
      )}
      {event.description && (
        <p className="mb-3">
          <span className="fw-bold">Description:</span> {event.description}
        </p>
      )}
      <p>
        The ranked average format{formatsAreSame ? " and the default round format" : ""} is{" "}
        <b>{rankedAverageFormat.label}</b>
      </p>
      {!formatsAreSame && (
        <p className="mb-1">
          The default round format is <b>{roundFormat.label}</b>
        </p>
      )}
    </div>
  );
}

export default EventInformation;
