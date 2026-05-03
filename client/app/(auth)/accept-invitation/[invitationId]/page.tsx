"use client";

import { useParams, useRouter } from "next/navigation";
import { useContext, useTransition } from "react";
import Button from "~/app/components/UI/Button.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { authClient } from "~/helpers/authClient.ts";
import { MainContext } from "~/helpers/contexts.ts";

function AcceptInvitationPage() {
  const { invitationId }: { invitationId: string } = useParams();
  const router = useRouter();
  const { resetMessages, changeErrorMessages, changeSuccessMessage } = useContext(MainContext);

  const [isPending, startTransition] = useTransition();

  const acceptInvitation = async () => {
    resetMessages();

    startTransition(async () => {
      const { error } = await authClient.organization.acceptInvitation({ invitationId });

      if (error) {
        changeErrorMessages([error.message ?? error.statusText]);
      } else {
        changeSuccessMessage("Successfully accepted invitation");
        setTimeout(() => router.push("/"), 2000);
      }
    });
  };

  return (
    <section className="px-3">
      <h2 className="mb-4 text-center">Accept Invitation</h2>

      <ToastMessages />

      <p className="fs-5 mb-4 text-center">Click the button below to accept the invitation.</p>

      <Button onClick={() => acceptInvitation()} isLoading={isPending} className="btn-success d-block mx-auto">
        Accept Invitation
      </Button>
    </section>
  );
}

export default AcceptInvitationPage;
