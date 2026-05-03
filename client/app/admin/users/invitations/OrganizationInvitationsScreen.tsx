"use client";

import { useContext, useState, useTransition } from "react";
import useSWR from "swr";
import Button from "~/app/components/UI/Button.tsx";
import { authClient } from "~/helpers/authClient.ts";
import { MainContext } from "~/helpers/contexts.ts";
import type { ListPageMode } from "~/helpers/types.ts";

function OrganizationInvitationsScreen() {
  const { resetMessages, changeErrorMessages, changeSuccessMessage } = useContext(MainContext);
  const { data: session } = authClient.useSession();

  const {
    data: { data: invitations },
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    session ? ["organization-invitations", session] : null,
    () =>
      authClient.organization.listInvitations({ query: { organizationId: session!.session.activeOrganizationId! } }),
    { suspense: true },
  );
  const [mode, setMode] = useState<ListPageMode>("view");
  const [isCreating, startTransition] = useTransition();

  if (!session) return;

  const isPending = !session || isLoading || isValidating || isCreating;

  const onCreateInvitation = () => {
    setMode("add");
    window.scrollTo(0, 0);
    resetMessages();
  };

  const submitInvitation = (formData: FormData) => {
    resetMessages();
    const email = formData.get("email") as string;

    startTransition(async () => {
      const { data: users, error } = await authClient.admin.listUsers({
        query: { filterField: "email", filterValue: email, filterOperator: "eq" },
      });

      if (error) {
        changeErrorMessages([error.message ?? error.statusText]);
      } else if (users.total === 0) {
        changeErrorMessages(["User with the provided email not found. They have to create an account first."]);
      } else {
        const { error } = await authClient.organization.inviteMember({
          email,
          role: "member",
          organizationId: session!.session.activeOrganizationId!,
          resend: true,
        });

        if (error) {
          changeErrorMessages([error.message ?? error.statusText]);
        } else {
          changeSuccessMessage("Successfully sent invitation email");
          mutate();
          setMode("view");
        }
      }
    });
  };

  return (
    <>
      {mode === "view" ? (
        <Button onClick={() => onCreateInvitation()} disabled={isPending} className="btn-success btn-sm mx-2">
          Create Invitation
        </Button>
      ) : (
        <form action={submitInvitation} className="container" style={{ maxWidth: "var(--rr-md-width)" }}>
          <h3 className="mb-3">Create Invitation</h3>

          <fieldset className="mb-3">
            <label htmlFor="email_input" className="form-label">
              Email
            </label>
            <input
              id="email_input"
              type="email"
              name="email"
              placeholder="new.member@example.com"
              required
              className="form-control"
            />
          </fieldset>

          <div className="d-flex gap-3">
            <button type="submit" disabled={isPending} className="btn btn-primary">
              Send Invitation
            </button>
            <button type="button" onClick={() => setMode("view")} disabled={isPending} className="btn btn-danger">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!invitations || invitations.length === 0 ? (
        <p className="fs-5 mt-5 px-2">There are no pending invitations</p>
      ) : (
        <div className="table-responsive mt-4">
          <table className="table-hover table text-nowrap">
            <thead>
              <tr>
                <th scope="col">Organization</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Expires</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td>{invitation.organizationId}</td>
                  <td>{invitation.email}</td>
                  <td>{invitation.role}</td>
                  <td>{invitation.status}</td>
                  <td>{invitation.expiresAt.toUTCString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default OrganizationInvitationsScreen;
