import { db } from "~/server/db/provider";
import { eventsPublicCols, eventsTable } from "~/server/db/schema/events";

export async function GET() {
  const events = await db
    .select({ ...eventsPublicCols, rule: eventsTable.rule })
    .from(eventsTable)
    .orderBy(eventsTable.rank);

  return Response.json(events);
}
