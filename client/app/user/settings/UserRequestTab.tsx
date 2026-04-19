"use client";

import { useAction } from "next-safe-action/hooks";
import { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import useSWR from "swr";
import Form from "~/app/components/form/Form.tsx";
import FormPersonInputs from "~/app/components/form/FormPersonInputs.tsx";
import FormSelect from "~/app/components/form/FormSelect.tsx";
import FormTextArea from "~/app/components/form/FormTextArea.tsx";
import Button from "~/app/components/UI/Button.tsx";
import { authClient } from "~/helpers/authClient.ts";
import { MainContext } from "~/helpers/contexts.ts";
import type { MultiChoiceOption } from "~/helpers/types/MultiChoiceOption.ts";
import type { InputPerson } from "~/helpers/types.ts";
import { getActionError } from "~/helpers/utilityFunctions.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";
import type { SelectUserRequest } from "~/server/db/schema/user-requests.ts";
import { getPersonByIdSF } from "~/server/serverFunctions/personServerFunctions.ts";
import { createUserRequestSF, deleteUserRequestSF } from "~/server/serverFunctions/user-server-functions.ts";

type Props = {
  regions: RegionResponse[];
};

function UserRequestTab({ regions }: Props) {
  const { data: session } = authClient.useSession();
  const { changeErrorMessages, changeSuccessMessage, resetMessages } = useContext(MainContext);

  const { executeAsync: createUserRequest, isPending: isCreating } = useAction(createUserRequestSF);
  const { executeAsync: deleteUserRequest, isPending: isDeleting } = useAction(deleteUserRequestSF);
  const { data: userRequest, mutate } = useSWR<SelectUserRequest | null | undefined>("user-request");
  const { data: userRequestInstructions } = useSWR<string>("user-request-instructions");
  const [persons, setPersons] = useState<InputPerson[]>([null]);
  const [personNames, setPersonNames] = useState([""]);
  const [requestedRole, setRequestedRole] = useState<(typeof roleOptions)[number]["value"]>(
    userRequest ? (userRequest.requestedRole as any) : null,
  );
  const [comment, setComment] = useState(userRequest?.comment ?? "");

  const roleOptions = [
    { value: null, label: "Not selected" },
    { value: "mod", label: "Moderator" },
  ] as const satisfies MultiChoiceOption[];
  const isPending = isCreating || isDeleting;

  // Get requested person on initial page load
  useEffect(() => {
    if (userRequest?.requestedPersonId && persons[0]?.id !== userRequest.requestedPersonId) {
      (async () => {
        const res = await getPersonByIdSF({ id: userRequest.requestedPersonId! });

        if (res.serverError || res.validationErrors) {
          changeErrorMessages([getActionError(res)]);
        } else {
          setPersons([res.data!]);
          setPersonNames([res.data!.name]);
        }
      })();
    }
  }, [userRequest]);

  const handleSubmit = async () => {
    resetMessages();
    const res = await createUserRequest({
      requestedPersonId: persons[0]?.id ?? null,
      requestedRole,
      comment: comment || null,
    });

    if (res.serverError || res.validationErrors) {
      changeErrorMessages([getActionError(res)]);
    } else {
      changeSuccessMessage("Your user request has been successfully submitted. The admin team will review it soon.");
      mutate(res.data);
    }
  };

  const onDelete = async () => {
    resetMessages();
    const res = await deleteUserRequest({ id: userRequest!.id });

    if (res.serverError || res.validationErrors) {
      changeErrorMessages([getActionError(res)]);
    } else {
      changeSuccessMessage("Your user request has been successfully deleted");
      mutate(null);
      setPersons([null]);
      setPersonNames([""]);
      setRequestedRole(null);
      setComment("");
    }
  };

  return (
    <>
      <Markdown>{userRequestInstructions}</Markdown>

      <Form onSubmit={handleSubmit} isLoading={isCreating} disableControls={isPending} hideToasts className="my-5">
        <div className="row mb-2">
          <div className="col">
            <FormPersonInputs
              title="Requested competitor profile"
              persons={persons}
              setPersons={setPersons}
              personNames={personNames}
              setPersonNames={setPersonNames}
              regions={regions}
              disabled={isPending || !!userRequest?.requestedPersonId || !!session?.user.personId}
              addNewPersonMode="default"
              redirectToOnAddPerson={`/user/settings?added-person=`}
              display="grid"
              showWcaId
            />
          </div>
          <div className="col">
            <FormSelect
              title="Requested role"
              options={roleOptions}
              selected={requestedRole}
              setSelected={setRequestedRole as any}
              disabled={isPending || session?.user.role !== "user"}
            />
          </div>
        </div>
        <FormTextArea title="Comment" value={comment} setValue={setComment} disabled={isPending} rows={5} />
      </Form>

      {userRequest && (
        <>
          <p>
            You have already submitted a user request. To change the details, simply submit again. If you would like to
            request a different competitor profile, delete your request and submit a new one.
          </p>
          <Button onClick={() => onDelete()} isLoading={isDeleting} disabled={isPending} className="btn-danger mb-4">
            Delete Request
          </Button>
        </>
      )}
    </>
  );
}

export default UserRequestTab;
