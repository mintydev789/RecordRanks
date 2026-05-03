"use client";

import { useAction } from "next-safe-action/hooks";
import { useContext, useRef, useState } from "react";
import Markdown from "react-markdown";
import useSWR from "swr";
import PersonForm from "~/app/[slug]/mod/competitors/PersonForm.tsx";
import Form from "~/app/components/form/Form.tsx";
import FormPersonInputs from "~/app/components/form/FormPersonInputs.tsx";
import FormSelect from "~/app/components/form/FormSelect.tsx";
import FormTextArea from "~/app/components/form/FormTextArea.tsx";
import Button from "~/app/components/UI/Button.tsx";
import Modal from "~/app/components/UI/Modal.tsx";
import { authClient } from "~/helpers/authClient.ts";
import { MainContext } from "~/helpers/contexts.ts";
import { SwrKey } from "~/helpers/swr-keys.ts";
import type { MultiChoiceOption } from "~/helpers/types/MultiChoiceOption.ts";
import type { InputPerson, UserRequestDetails } from "~/helpers/types.ts";
import { getActionError, getHasRole } from "~/helpers/utilityFunctions.ts";
import type { PersonResponse } from "~/server/db/schema/persons.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";
import { requestableRoles, rolesObject } from "~/server/permissions.ts";
import { createOrUpdateUserRequestSF, deleteUserRequestSF } from "~/server/server-functions/user-server-functions.ts";

type Props = {
  regions: RegionResponse[];
};

function UserRequestTab({ regions }: Props) {
  const { data: session } = authClient.useSession();
  const { changeErrorMessages, changeSuccessMessage, resetMessages } = useContext(MainContext);

  const { executeAsync: createOrUpdateUserRequest, isPending: isCreating } = useAction(createOrUpdateUserRequestSF);
  const { executeAsync: deleteUserRequest, isPending: isDeleting } = useAction(deleteUserRequestSF);
  const { data: userRequestDetails, mutate } = useSWR<UserRequestDetails>(SwrKey.UserRequestDetails);
  const userRequest = userRequestDetails?.userRequest;
  const { data: userRequestInstructions } = useSWR<string>(SwrKey.UserRequestInstructions);
  const [persons, setPersons] = useState<InputPerson[]>([userRequest?.requestedPerson ?? null]);
  const [personNames, setPersonNames] = useState([userRequest?.requestedPerson?.name ?? ""]);
  const [requestedRole, setRequestedRole] = useState<(typeof roleOptions)[number]["value"]>(
    userRequest ? (userRequest.requestedRole as any) : null,
  );
  const [comment, setComment] = useState(userRequest?.comment ?? "");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const roleOptions = [
    { value: null, label: "Not selected" },
    ...requestableRoles.map((r) => ({ value: r, label: rolesObject[r] })),
  ] as const satisfies MultiChoiceOption[];
  const isAdmin = getHasRole("admin", session?.user.role);
  const isPending = isCreating || isDeleting;

  const handleSubmit = async () => {
    if (personNames[0] && !persons[0]) {
      changeErrorMessages(["Please enter or clear the competitor profile"]);
    } else {
      resetMessages();
      const res = await createOrUpdateUserRequest({
        requestedPersonId: persons[0]?.id ?? null,
        requestedRole,
        comment: comment || null,
      });

      if (res.serverError || res.validationErrors) {
        changeErrorMessages([getActionError(res)]);
      } else {
        changeSuccessMessage("Your user request has been successfully submitted. The admin team will review it soon.");
        mutate(res.data!, { revalidate: false });
      }
    }
  };

  const onDelete = async () => {
    resetMessages();
    const res = await deleteUserRequest(userRequest!.id);

    if (res.serverError || res.validationErrors) {
      changeErrorMessages([getActionError(res)]);
    } else {
      changeSuccessMessage("Your user request has been successfully deleted");
      mutate(
        { userRequest: null, ownRequestedPersonId: userRequestDetails?.ownRequestedPersonId },
        { revalidate: false },
      );
      setPersons([null]);
      setPersonNames([""]);
      setRequestedRole(null);
      setComment("");
    }
  };

  const openPersonModal = () => {
    resetMessages();
    dialogRef.current!.showModal();
  };

  const onSubmitPerson = (person: PersonResponse) => {
    dialogRef.current!.close();
    setPersons([person]);
    setPersonNames([person.name]);
  };

  return (
    <>
      <Markdown>{userRequestInstructions}</Markdown>

      <Form
        onSubmit={handleSubmit}
        isLoading={isCreating}
        disableControls={isPending || isAdmin}
        hideToasts
        className="mt-4 mb-5"
      >
        {isAdmin && (
          <p className="fs-6 fw-bold text-center text-danger">
            You cannot submit user requests, because you are an admin
          </p>
        )}

        <div className="row mb-2">
          <div className="col-12 col-md-6">
            <FormPersonInputs
              title="Requested competitor profile"
              persons={persons}
              setPersons={setPersons}
              personNames={personNames}
              setPersonNames={setPersonNames}
              regions={regions}
              disabled={isPending || !!userRequest?.requestedPersonId || !!session?.user.personId}
              addNewPersonMode="disabled"
              display="grid"
              showWcaId
            />
            {!session?.user.personId &&
              (!persons[0] ? (
                <Button onClick={() => openPersonModal()} className="btn-success my-2">
                  Create New Person
                </Button>
              ) : persons[0].id === userRequestDetails?.ownRequestedPersonId ? (
                <Button onClick={() => openPersonModal()} className="btn-primary my-2">
                  Edit Person
                </Button>
              ) : undefined)}
          </div>
          <div className="col-12 col-md-6">
            <FormSelect
              title="Requested role"
              options={roleOptions}
              selected={requestedRole}
              setSelected={setRequestedRole as any}
              disabled={isPending || session?.user.role !== "user"}
            />
          </div>
        </div>
        <FormTextArea title="Comment" value={comment} setValue={setComment} disabled={isPending || isAdmin} rows={5} />
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

      <Modal ref={dialogRef} title={persons[0] ? "Edit Person" : "Create New Person"}>
        <p className="fw-bold mb-1 text-danger">
          If you have a WCA ID, please close this window and simply enter it into the main input.
        </p>
        <p>Only use this for submitting a new competitor profile without a WCA ID.</p>
        <PersonForm
          key={persons[0]?.id}
          personUnderEdit={persons[0] ?? undefined}
          regions={regions}
          onSubmit={onSubmitPerson}
          onSubmitError={() => dialogRef.current!.close()}
          wcaIdInputHidden
        />
      </Modal>
    </>
  );
}

export default UserRequestTab;
