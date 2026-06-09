import { type NextRequest, NextResponse } from "next/server";
// import { logMessage } from "~/server/server-only-functions.ts";

export function proxy(request: NextRequest) {
  const url = new URL(request.url);

  // TO-DO: REENABLE THIS!!!
  // const isLoggablePage = ???
  // [
  //   "/",
  //   "/competitions",
  //   "/competitions/(.*)",
  //   "/rankings/(.*)",
  //   "/records/(.*)",
  //   "/export",
  //   "/rules",
  //   "/rules/(.*)",
  //   "/about",
  //   "/moderator-instructions/(.*)",
  //   "/posts",
  //   "/posts/(.*)",
  //   "/video-based-results/submit",
  // ]

  // if (isLoggablePage) {
  //   logMessage("RR0001", `Page visit: ${url.pathname}${url.search}`, {
  //     metadata: { pathname: url.pathname, queryString: url.search },
  //   });
  // }

  if (process.env.NEXT_PUBLIC_MULTITENANCY_ENABLED !== "true") {
    const isPathWithSlug =
      url.pathname === "/" ||
      /^\/(about|competitions|export|mod|moderator-instructions|posts|rankings|records|rules|video-based-results)(\/.*)?$/.test(
        url.pathname,
      );
    // api\/events|api\/results\/rankings

    if (isPathWithSlug) {
      return NextResponse.rewrite(
        request.url.replace(process.env.NEXT_PUBLIC_BASE_URL!, `${process.env.NEXT_PUBLIC_BASE_URL!}/default`),
      );
    }
  }
}

export const config = {};
