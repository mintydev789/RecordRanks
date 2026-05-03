import type { NavigationItem } from "~/helpers/types/NavigationItem.ts";

export const tabs = [
  { title: "Users", value: "users", route: "/admin/users" },
  { title: "User Requests", value: "user-requests", route: "/admin/users/requests" },
  { title: "Invitations", value: "invitations", route: "/admin/users/invitations" },
] as const satisfies NavigationItem[];
