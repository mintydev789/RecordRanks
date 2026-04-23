"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";
import { WcaIdValidator } from "~/helpers/validators/Validators.ts";
import { auth } from "~/server/auth.ts";
import { db } from "~/server/db/provider.ts";
import { usersTable as table } from "~/server/db/schema/auth-schema.ts";
import { type PersonResponse, personsPublicCols, personsTable, type SelectPerson } from "~/server/db/schema/persons.ts";
import { type FullUserRequest, userRequestsTable } from "~/server/db/schema/user-requests.ts";
import { sendEmail, sendRolesChangedEmail, sendUserRequestSubmittedEmail } from "~/server/email/mailer.ts";
import { type Role, Roles, requestableRoles } from "~/server/permissions.ts";
import { actionClient, RrActionError } from "~/server/safeAction.ts";
import { deletePersonSF } from "~/server/server-functions/person-server-functions.ts";
import {
  getOrCreatePersonByWcaId,
  getUserRequestDetails,
  logMessage,
  syncPersonByWcaId,
} from "~/server/server-only-functions.ts";

export const sendDebugEmailSF = actionClient
  .metadata({ permissions: { adminDashboard: ["view"] } })
  .inputSchema(z.strictObject({ emailAddress: z.email() }))
  .action(async ({ parsedInput: { emailAddress } }) => {
    sendEmail(emailAddress, "Debug email", "This is a debug email for testing. You can safely ignore this.");
  });

export const logUserDeletedSF = actionClient
  .metadata({ permissions: null })
  .inputSchema(
    z.strictObject({
      id: z.string().nonempty(),
    }),
  )
  .action(async ({ parsedInput: { id } }) => {
    logMessage("RR0034", `Deleting user with ID ${id}`);
  });

export const updateUserSF = actionClient
  .metadata({ permissions: { user: ["set-role"] } })
  .inputSchema(
    z.strictObject({
      id: z.string(),
      personId: z.int().min(1).nullable().default(null),
      roles: z.enum(Roles).array().nonempty(),
    }),
  )
  .action<{ user: typeof auth.$Infer.Session.user; person?: PersonResponse }>(
    async ({ parsedInput: { id, personId, roles } }) => {
      logMessage("RR0033", `Updating user with ID ${id} (new person ID: ${personId}; new roles: ${roles.join(", ")})`);

      const [hdrs, user, credentialAccount] = await Promise.all([
        headers(),
        db.query.users.findFirst({ where: { id } }),
        db.query.accounts.findFirst({ columns: { id: true }, where: { userId: id, providerId: "credential" } }),
      ]);
      if (!user) throw new RrActionError("User not found");
      if (credentialAccount && !user.emailVerified)
        throw new RrActionError("This user hasn't verified their email address yet");

      let person: PersonResponse | undefined;
      if (personId) {
        person = (
          await db.select(personsPublicCols).from(personsTable).where(eq(personsTable.id, personId)).limit(1)
        ).at(0);
        if (!person) throw new RrActionError(`Person with ID ${personId} not found`);
      } else if (roles.some((role) => role !== "user")) {
        throw new RrActionError("Privileged users must have a person tied to their account");
      }

      const rolesAreDifferent = user.role!.split(",").sort().join(",") !== roles.sort().join(",");
      if (rolesAreDifferent) await changeUserRoles(user, roles, person?.name);

      const [updatedUser] = await db.update(table).set({ personId }).where(eq(table.id, user.id)).returning();

      // Log out user to avoid stale session data
      await auth.api.revokeUserSessions({ body: { userId: user.id }, headers: hdrs });

      return { user: updatedUser, person };
    },
  );

export const linkWcaProfileSF = actionClient
  .metadata({ permissions: null })
  .action<PersonResponse>(async ({ ctx: { session } }) => {
    const wcaAccount = await db.query.accounts.findFirst({
      columns: { accountId: true },
      where: { userId: session.user.id, providerId: "wca" },
    });
    if (!wcaAccount) throw new RrActionError("Only users using WCA login can link their own WCA competitor profiles");

    const res = await auth.api.accountInfo({ query: { accountId: wcaAccount.accountId }, headers: await headers() });
    if (!res) throw new RrActionError("Unable to retrieve account information from the WCA");

    const parsed = z
      // This doesn't include the full schema of the user information the WCA returns
      .object({
        preferred_username: WcaIdValidator, // if the WCA user has no WCA ID, this will throw a validation error
      })
      .safeParse(res.data);
    if (!parsed.success) throw new RrActionError(z.prettifyError(parsed.error));

    const wcaId = parsed.data.preferred_username;
    const person = session.user.personId
      ? await syncPersonByWcaId(wcaId, session.user.personId)
      : (await getOrCreatePersonByWcaId(wcaId, { creatorUserId: session.user.id })).person;

    try {
      await db.update(table).set({ personId: person.id }).where(eq(table.id, session.user.id));
    } catch {
      throw new RrActionError(
        "Error while linking competitor profile. This competitor may already be tied to another user. Please contact the admin team.",
      );
    }

    return person;
  });

export const createOrUpdateUserRequestSF = actionClient
  .metadata({ permissions: null })
  .inputSchema(
    z.strictObject({
      requestedPersonId: z.int().nullable(),
      requestedRole: z.enum(requestableRoles).nullable(),
      comment: z.string().nonempty().nullable(),
    }),
  )
  .action(
    async ({
      parsedInput: { requestedPersonId, requestedRole, comment },
      ctx: {
        session: { user },
      },
    }) => {
      if (!requestedPersonId && !requestedRole && !comment)
        throw new RrActionError("You cannot submit an empty user request");
      if (requestedRole && !requestedPersonId && !user.personId)
        throw new RrActionError("To request a role you must also request a competitor profile");
      if (requestedRole && user.role !== "user")
        throw new RrActionError(
          "You already have a role. Please contact the admin team if you would like to change it.",
        );

      const userRequest = await db.query.userRequests.findFirst({ where: { userId: user.id } });
      if (userRequest?.requestedPersonId && requestedPersonId !== userRequest.requestedPersonId) {
        throw new RrActionError(
          "You cannot change your requested person. If you made a mistake before, please delete your request and submit again.",
        );
      }

      logMessage(
        "RR0037",
        `${userRequest ? "Updating" : "Creating"} user request for user with ID ${user.id}: person ID ${requestedPersonId}, role ${requestedRole}, comment ${comment}`,
      );

      let person: SelectPerson | undefined;
      if (requestedPersonId !== null) {
        if (user.personId) throw new RrActionError("There is already a competitor profile linked to your account");

        person = await db.query.persons.findFirst({ where: { id: requestedPersonId } });
        if (!person) throw new RrActionError(`Person with ID ${requestedPersonId} not found`);

        const userWithSamePerson = await db.query.users.findFirst({
          columns: { personId: true },
          where: { personId: requestedPersonId },
        });
        if (userWithSamePerson) {
          throw new RrActionError(
            "The requested person is already tied to a user. If this is a mistake, please contact the admin team.",
          );
        }
      }

      await db
        .insert(userRequestsTable)
        .values({ userId: user.id, requestedPersonId, requestedRole, comment })
        .onConflictDoUpdate({
          target: userRequestsTable.userId,
          set: { requestedPersonId, requestedRole, comment },
        });

      // If it's a new request, send an email notification
      if (!userRequest) sendUserRequestSubmittedEmail(user.email, user.name, person, requestedRole, comment);

      return (await getUserRequestDetails(user.id)) as { userRequest: FullUserRequest; ownRequestedPersonId?: number };
    },
  );

export const approveUserRequestSF = actionClient
  .metadata({ permissions: { user: ["list"] } })
  .inputSchema(z.int())
  .action(async ({ parsedInput: id }) => {
    const userRequest = await db.query.userRequests.findFirst({
      with: {
        user: { columns: { id: true, name: true, email: true, personId: true } },
        requestedPerson: { columns: { name: true, approved: true } },
      },
      where: { id },
    });
    if (!userRequest) throw new RrActionError("User request not found");
    if (userRequest.requestedPerson?.approved === false)
      throw new RrActionError("Please review and approve the competitor profile on the manage competitors page first");

    if (userRequest.requestedRole)
      await changeUserRoles(userRequest.user, [userRequest.requestedRole], userRequest.requestedPerson?.name);

    await db.transaction(async (tx) => {
      await tx.update(table).set({ personId: userRequest.requestedPersonId }).where(eq(table.id, userRequest.userId));

      await tx.delete(userRequestsTable).where(eq(userRequestsTable.id, id));
    });

    sendEmail(userRequest.user.email, "User request approved", "Your user request has been approved.");
  });

export const deleteUserRequestSF = actionClient
  .metadata({ permissions: null })
  .inputSchema(z.int())
  .action(async ({ parsedInput: id, ctx: { session } }) => {
    logMessage("RR0038", `Deleting user request for user with ID ${session.user.id}`);

    const { success: canManageUserRequests } = await auth.api.userHasPermission({
      body: { userId: session.user.id, permissions: { user: ["list"] } },
    });

    const userRequest = await db.query.userRequests.findFirst({
      with: { user: { columns: { email: true } } },
      where: { id },
    });
    if (!userRequest) throw new RrActionError("User request not found");
    if (userRequest.userId !== session.user.id && !canManageUserRequests)
      throw new RrActionError("You are unauthorized to delete this user request");

    // Delete competitor profile, if it was simply created by the user and isn't used anywhere else
    if (userRequest.requestedPersonId) {
      try {
        await deletePersonSF({ id: userRequest.requestedPersonId });
      } catch (err) {
        if (!(err instanceof RrActionError)) throw err;
      }
    }

    await db.delete(userRequestsTable).where(eq(userRequestsTable.id, id));

    if (userRequest.userId !== session.user.id)
      sendEmail(
        userRequest.user.email,
        "User request rejected",
        "Your user request has been rejected by the admin team.",
      );
  });

async function changeUserRoles(
  user: Pick<typeof auth.$Infer.Session.user, "id" | "name" | "email">,
  roles: Role[],
  personName: string | undefined,
) {
  await auth.api.setRole({ body: { userId: user.id, role: roles }, headers: await headers() });

  const { success: canAccessModDashboard } = await auth.api.userHasPermission({
    body: { userId: user.id, permissions: { modDashboard: ["view"] } },
  });

  sendRolesChangedEmail(user.email, roles, { canAccessModDashboard });

  if (roles.includes("admin")) {
    sendEmail(
      process.env.NEXT_PUBLIC_CONTACT_EMAIL!,
      "Important: New admin user",
      `User ${user.name}${personName ? ` (competitor ${personName})` : ""} has been given the admin role.`,
    );
  }
}
