import type { NavigationItem } from "~/helpers/types/NavigationItem.ts";

export function getTabs(slug: string) {
  return [
    { title: "Members", value: "members", route: `/${slug}//mod/members` },
    { title: "Member Requests", value: "member-requests", route: `/${slug}/mod/members/requests` },
    { title: "Invitations", value: "invitations", route: `/${slug}/mod/members/invitations` },
  ] as const satisfies NavigationItem[];
}
