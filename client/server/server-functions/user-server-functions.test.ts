import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "~/server/db/provider.ts";
import { usersTable } from "~/server/db/schema/auth-schema.ts";
import {
  admin as adminRole,
  mod as modRole,
  type Role,
  type RrPermissions,
  user as userRole,
  videoBasedResultReviewer as videoBasedResultReviewerRole,
} from "~/server/permissions.ts";
import { updateUserSF } from "~/server/server-functions/user-server-functions.ts";
import { reseedTestData } from "~/vitest-setup.ts";

const { revokeUserSessionsSpy, sendEmailSpy, sendRolesChangedEmailSpy } = vi.hoisted(() => ({
  revokeUserSessionsSpy: vi.fn(),
  sendEmailSpy: vi.fn(),
  sendRolesChangedEmailSpy: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn() }));

vi.mock("~/server/auth.ts", () => ({
  auth: {
    api: {
      setRole: async ({ body: { userId, role } }: { body: { userId: string; role: string | string[] } }) => {
        await db
          .update(usersTable)
          .set({ role: typeof role === "string" ? role : role.join(",") })
          .where(eq(usersTable.id, userId));
      },
      userHasPermission: async ({
        body: { userId, permissions },
      }: {
        body: { userId: string; permissions: RrPermissions };
      }): Promise<{ success: boolean }> => {
        const user = await db.query.users.findFirst({ columns: { role: true }, where: { id: userId } });
        if (!user) throw new Error(`User with ID ${userId} not found`);

        for (const [category, perms] of Object.entries(permissions)) {
          for (const permission of perms) {
            let hasPermission = false;
            for (const role of user.role!.split(",")) {
              const rolePermissions =
                role === "admin"
                  ? adminRole.statements
                  : role === "mod"
                    ? modRole.statements
                    : role === "videoBasedResultReviewer"
                      ? videoBasedResultReviewerRole.statements
                      : userRole.statements;
              if ((rolePermissions as any)[category].includes(permission)) {
                hasPermission = true;
                break;
              }
            }
            if (!hasPermission) return { success: false };
          }
        }

        return { success: true };
      },
      revokeUserSessions: revokeUserSessionsSpy,
    },
  },
}));

vi.mock("~/server/email/mailer.ts", () => ({
  sendEmail: sendEmailSpy,
  sendRolesChangedEmail: sendRolesChangedEmailSpy,
}));

beforeEach(async () => {
  await reseedTestData();
});

describe("updateUserSF", async () => {
  it("updates user's person ID", async () => {
    const notYetTakenPersonId = 5;
    const user = (await db.query.users.findFirst({ where: { username: "user" } }))!;
    expect(user.personId).toBe(3);

    const res = await updateUserSF({
      id: user.id,
      personId: notYetTakenPersonId,
      roles: user.role!.split(",") as Role[],
    });

    expect(res.serverError).toBeUndefined();
    expect(res.validationErrors).toBeUndefined();
    expect(revokeUserSessionsSpy).toHaveBeenCalledOnce();
    expect(res.data!.person!.id).toBe(notYetTakenPersonId);
  });

  it("updates user's role to mod", async () => {
    const roles: Role[] = ["mod"];
    const user = (await db.query.users.findFirst({ where: { username: "user" } }))!;

    const res = await updateUserSF({ id: user.id, personId: user.personId, roles });

    expect(res.serverError).toBeUndefined();
    expect(res.validationErrors).toBeUndefined();
    expect(sendRolesChangedEmailSpy).toHaveBeenCalledWith(user.email, roles, { canAccessModDashboard: true });
    expect(res.data!.user.role).toBe(roles.join(","));
  });

  it("updates user's role to admin", async () => {
    const roles: Role[] = ["admin"];
    const user = (await db.query.users.findFirst({ where: { username: "user" } }))!;
    const person = (await db.query.persons.findFirst({ where: { id: user.personId! } }))!;

    const res = await updateUserSF({ id: user.id, personId: user.personId, roles });

    expect(res.serverError).toBeUndefined();
    expect(res.validationErrors).toBeUndefined();
    expect(sendRolesChangedEmailSpy).toHaveBeenCalledWith(user.email, roles, { canAccessModDashboard: true });
    expect(sendEmailSpy).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_CONTACT_EMAIL,
      "Important: New admin user",
      `User ${user.username} (competitor ${person.name}) has been given the admin role.`,
    );
    expect(res.data!.user.role).toBe(roles.join(","));
  });

  describe("server errors", () => {
    it("throws error for user not found", async () => {
      const res = await updateUserSF({ id: "INVALID", personId: 1, roles: ["user"] });

      expect(res.validationErrors).toBeUndefined();
      expect(res.serverError?.message).toBe("User not found");
    });

    it("throws error for email not verified", async () => {
      const emailNotVerifiedUser = (await db.query.users.findFirst({ where: { emailVerified: false } }))!;
      const res = await updateUserSF({
        id: emailNotVerifiedUser.id,
        roles: emailNotVerifiedUser.role!.split(",") as Role[],
      });

      expect(res.validationErrors).toBeUndefined();
      expect(res.serverError?.message).toBe("This user hasn't verified their email address yet");
    });

    it("throws error for person ID not found", async () => {
      const user = (await db.query.users.findFirst({ where: { username: "user" } }))!;
      const res = await updateUserSF({ id: user.id, personId: 999999999, roles: user.role!.split(",") as Role[] });

      expect(res.validationErrors).toBeUndefined();
      expect(res.serverError?.message).toBe("Person with ID 999999999 not found");
    });

    it("throws error for missing person ID for privileged user", async () => {
      const user = (await db.query.users.findFirst({ where: { username: "user" } }))!;
      const res = await updateUserSF({ id: user.id, roles: ["mod"] });

      expect(res.validationErrors).toBeUndefined();
      expect(res.serverError?.message).toBe("Privileged users must have a person tied to their account");
    });
  });
});
