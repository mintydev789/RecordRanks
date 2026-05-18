import type { NextRequest } from "next/server";
import z from "zod";
import { RecordCategoryValues } from "~/helpers/types.ts";
import { db } from "~/server/db/provider.ts";
import { getOrgDetails, getRankings } from "~/server/server-only-functions.ts";

export async function GET(
  req: NextRequest,
  { params }: RouteContext<"/api/[slug]/results/rankings/[eventId]/[type]/[category]">,
) {
  const searchParams = req.nextUrl.searchParams;
  const parsedParams = z
    .strictObject({
      slug: z.string().nonempty(),
      eventId: z.string().nonempty(),
      type: z.enum(["single", "average", "all-avg-formats"]),
      category: z.enum([...RecordCategoryValues, "all"]),
    })
    .safeParse(await params);
  if (!parsedParams.success) return new Response(`Validation error: ${parsedParams.error}`, { status: 400 });
  const { slug, eventId, type, category: recordCategory } = parsedParams.data;

  const show = searchParams.get("show") as "persons" | "results" | null;
  if (show && !["persons", "results"].includes(show))
    return new Response(`Validation error: ${show} is not a valid value for the show parameter`, { status: 400 });
  const region = searchParams.get("region");
  const topN = searchParams.get("topN");

  const organization = await getOrgDetails({ slug });

  const event = await db.query.events.findFirst({ where: { organizationId: organization.id, eventId } });
  if (!event) return new Response(`Event with ID ${eventId} not found`, { status: 400 });

  const rankings = await getRankings(organization.id, event, type, recordCategory, {
    show: show ?? undefined,
    region: region ?? undefined,
    topN: topN ? parseInt(topN, 10) : undefined,
  });

  return Response.json(rankings);
}
