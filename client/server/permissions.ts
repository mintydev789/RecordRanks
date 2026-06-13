import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

// This is all set up with defaults, but can be extended in the future

export const ac = createAccessControl(defaultStatements);

export type AdminPluginPermissions = Partial<{
  user: Array<(typeof defaultStatements.user)[number]>;
  session: Array<(typeof defaultStatements.session)[number]>;
}>;

export const Roles = ["admin", "user"] as const;
export type Role = (typeof Roles)[number];

export const admin = ac.newRole(adminAc.statements);

export const user = ac.newRole(userAc.statements);

export const rolesObject: Record<Role, string> = {
  admin: "Admin",
  user: "User",
};
