"use client";

import { useAction } from "next-safe-action/hooks";
import { useContext, useState } from "react";
import FormTextInput from "~/app/components/form/FormTextInput.tsx";
import Button from "~/app/components/UI/Button.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { MainContext } from "~/helpers/contexts.ts";
import { getActionError } from "~/helpers/utilityFunctions.ts";
import { sendDebugEmailSF } from "~/server/server-functions/user-server-functions.ts";

function DebugScreen() {
  const { changeErrorMessages, resetMessages } = useContext(MainContext);

  const { executeAsync: sendDebugEmail, isPending: isSendingEmail } = useAction(sendDebugEmailSF);
  const [debugOutput, setDebugOutput] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

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

  return (
    <div className="mx-auto px-3" style={{ width: "var(--rr-md-width)" }}>
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
