import type { NextRequest } from "next/server";
import { logMessage } from "~/server/serverOnlyFunctions";

export function proxy(request: NextRequest) {
  const url = new URL(request.url);

  logMessage("RR0001", `Page visit: ${url.pathname}${url.search}`, {
    metadata: { pathname: url.pathname, queryString: url.search },
  });
}

export const config = {
  matcher: [
    "/",
    "/competitions",
    "/competitions/(.*)",
    "/rankings/(.*)",
    "/records/(.*)",
    "/export",
    "/rules",
    "/rules/(.*)",
    "/about",
    "/moderator-instructions/(.*)",
    "/posts",
    "/posts/(.*)",
    "/video-based-results/submit",
  ],
};
