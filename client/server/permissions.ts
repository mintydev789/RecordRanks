import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const permissions = {
  adminDashboard: ["view"],
  modDashboard: ["view"],
  recordConfigs: ["create-and-update"],
  competitions: ["create", "update", "approve", "publish", "delete"],
  meetups: ["create", "update", "approve", "publish", "delete"],
  onlineComps: ["submit-own-result"],
  persons: ["create", "update", "approve", "delete"],
  events: ["create", "update", "delete"],
  videoBasedResults: ["create", "update", "approve", "delete"],
} as const;

export const ac = createAccessControl({ ...defaultStatements, ...permissions });

export type RrPermissions = Partial<{
  user: Array<(typeof adminAc.statements.user)[number]>;
  session: Array<(typeof adminAc.statements.session)[number]>;
  adminDashboard: Array<(typeof permissions.adminDashboard)[number]>;
  modDashboard: Array<(typeof permissions.modDashboard)[number]>;
  recordConfigs: Array<(typeof permissions.recordConfigs)[number]>;
  competitions: Array<(typeof permissions.competitions)[number]>;
  meetups: Array<(typeof permissions.meetups)[number]>;
  onlineComps: Array<(typeof permissions.onlineComps)[number]>;
  persons: Array<(typeof permissions.persons)[number]>;
  events: Array<(typeof permissions.events)[number]>;
  videoBasedResults: Array<(typeof permissions.videoBasedResults)[number]>;
}>;

export const Roles = ["admin", "mod", "videoBasedResultReviewer", "user"] as const;
export type Role = (typeof Roles)[number];

export const admin = ac.newRole({ ...adminAc.statements, ...permissions });

export const mod = ac.newRole({
  modDashboard: ["view"],
  competitions: ["create", "update"],
  meetups: ["create", "update"],
  onlineComps: ["submit-own-result"],
  persons: ["create", "update", "delete"],
  videoBasedResults: ["create"],
});

export const videoBasedResultReviewer = ac.newRole({
  onlineComps: ["submit-own-result"],
  persons: ["create", "update", "delete"],
  videoBasedResults: ["create", "update", "approve", "delete"],
});

export const user = ac.newRole({
  onlineComps: ["submit-own-result"],
  videoBasedResults: ["create"],
});

export const rolesObject = {
  user: "User",
  mod: "Moderator",
  videoBasedResultReviewer: "Video-based result reviewer",
  admin: "Admin",
};

// These roles can be requested by a user by submitting a user request
export const requestableRoles = ["mod"] as const satisfies Role[];
