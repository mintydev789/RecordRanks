import type { NavigationItem } from "~/helpers/types/NavigationItem.ts";
import { slugPath } from "~/helpers/utility-functions.ts";

export function getTabs(slug: string) {
  return [
    { title: "Members", value: "members", route: slugPath(slug, "/mod/members") },
    { title: "Member Requests", value: "member-requests", route: slugPath(slug, "/mod/members/requests") },
    { title: "Invitations", value: "invitations", route: slugPath(slug, "/mod/members/invitations") },
  ] as const satisfies NavigationItem[];
}
