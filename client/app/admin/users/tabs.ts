import type { NavigationItem } from "~/helpers/types/NavigationItem.ts";

export const tabs = [
  { title: "Users", value: "users", route: "/admin/users" },
  { title: "User Requests", value: "user-requests", route: "/admin/users/requests" },
] as const satisfies NavigationItem[];
