import type { NextRequest } from "next/server";
import z from "zod";
import { getEvents, getOrgDetails } from "~/server/server-only-functions.ts";

export async function GET(_: NextRequest, { params }: RouteContext<"/api/[slug]/events">) {
  const parsedParams = z.strictObject({ slug: z.string().nonempty() }).safeParse(await params);
  if (!parsedParams.success) return new Response(`Validation error: ${parsedParams.error}`, { status: 400 });

  const organization = await getOrgDetails({ slug: parsedParams.data.slug });

  const events = await getEvents(organization.id, { withRules: true, includeHiddenAndRemoved: true });

  return Response.json(events);
}
