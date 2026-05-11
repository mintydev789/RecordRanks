"use client";

import { useAction } from "next-safe-action/hooks";
import { useContext, useState, useTransition } from "react";
import z from "zod";
import FormTextInput from "~/app/components/form/FormTextInput.tsx";
import Button from "~/app/components/UI/Button.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { authClient } from "~/helpers/authClient.ts";
import { MainContext } from "~/helpers/contexts.ts";
import type { OrganizationMetadata } from "~/helpers/types.ts";
import { getActionError } from "~/helpers/utilityFunctions.ts";
import { sendDebugEmailSF } from "~/server/server-functions/user-server-functions.ts";

function DebugScreen() {
  const { changeSuccessMessage, changeErrorMessages, resetMessages } = useContext(MainContext);

  const { executeAsync: sendDebugEmail, isPending: isSendingEmail } = useAction(sendDebugEmailSF);
  const [debugOutput, setDebugOutput] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [isCreatingOrganization, startTransition] = useTransition();

  const sendEmail = async () => {
    resetMessages();
    setDebugOutput("");

    const res = await sendDebugEmail({ emailAddress });

    if (res.serverError || res.validationErrors) {
      changeErrorMessages([getActionError(res)]);
    } else {
      resetMessages();
      setDebugOutput("Successfully sent email!");
    }
  };

  const createOrganization = (formData: FormData) => {
    resetMessages();

    const parsed = z
      .strictObject({
        name: z.string().nonempty(),
        slug: z
          .string()
          .min(3)
          .max(12)
          .regex(/^[a-z0-9]$/),
        contactEmail: z.email(),
        logo: z.string().nullable(),
      })
      .safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      changeErrorMessages([z.prettifyError(parsed.error)]);
    } else {
      startTransition(async () => {
        const { error } = await authClient.organization.create({
          name: parsed.data.name,
          slug: parsed.data.slug,
          logo: parsed.data.logo || undefined,
          metadata: {
            private: false,
            contactEmail: parsed.data.contactEmail,
          } satisfies OrganizationMetadata,
          keepCurrentActiveOrganization: true,
        });

        if (error) {
          changeErrorMessages([error.message ?? error.statusText]);
        } else {
          changeSuccessMessage("Successfully created organization");
        }
      });
    }
  };

  return (
    <div className="mx-auto mb-4 w-100 px-3" style={{ maxWidth: "var(--rr-md-width)" }}>
      <h2 className="mb-5 text-center">Page for debugging</h2>

      <ToastMessages />

      <p className="fs-5 mt-3 mb-4" style={{ whiteSpace: "pre-wrap" }}>
        {debugOutput || "<debug output>"}
      </p>

      <h4 className="my-4">Test sending emails</h4>

      <FormTextInput
        title="Email address"
        value={emailAddress}
        setValue={setEmailAddress}
        disabled={isSendingEmail}
        className="mb-3"
      />

      <Button onClick={sendEmail} isLoading={isSendingEmail}>
        Send
      </Button>

      <form action={createOrganization} className="mt-5">
        <h3 className="mb-3">Create Organization</h3>

        <fieldset className="mb-3">
          <label htmlFor="name_input" className="form-label">
            Name *
          </label>
          <input
            id="name_input"
            type="text"
            name="name"
            placeholder="International Association of ..."
            required
            className="form-control"
          />
        </fieldset>

        <fieldset className="mb-3">
          <label htmlFor="slug_input" className="form-label">
            Organization ID *
          </label>
          <input id="slug_input" type="text" name="slug" placeholder="iax" required className="form-control" />
        </fieldset>

        <fieldset className="mb-4">
          <label htmlFor="contact_email_input" className="form-label">
            Contact Email *
          </label>
          <input id="contact_email_input" type="email" name="contactEmail" className="form-control" />
        </fieldset>

        <fieldset className="mb-4">
          <label htmlFor="logo_input" className="form-label">
            Logo URL
          </label>
          <input id="logo_input" type="url" name="logo" className="form-control" />
        </fieldset>

        <button type="submit" disabled={isCreatingOrganization} className="btn btn-primary">
          Create Organization
        </button>
      </form>

      {process.env.NODE_ENV === "production" && (
        <>
          <h4 className="my-4">Version</h4>
          <p>This instance is running on RecordRanks version {process.env.NEXT_PUBLIC_VERSION || "UNKNOWN"}</p>
        </>
      )}
    </div>
  );
}

export default DebugScreen;
