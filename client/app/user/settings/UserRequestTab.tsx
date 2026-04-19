"use client";

import { useState } from "react";
import Markdown from "react-markdown";
import Form from "~/app/components/form/Form.tsx";
import FormPersonInputs from "~/app/components/form/FormPersonInputs.tsx";
import FormSelect from "~/app/components/form/FormSelect.tsx";
import FormTextArea from "~/app/components/form/FormTextArea.tsx";
import type { MultiChoiceOption } from "~/helpers/types/MultiChoiceOption.ts";
import type { InputPerson } from "~/helpers/types.ts";
import type { RegionResponse } from "~/server/db/schema/regions.ts";

type Props = {
  userRequestInstructions: string | null;
  regions: RegionResponse[];
};

function UserRequestTab({ userRequestInstructions, regions }: Props) {
  const [persons, setPersons] = useState<InputPerson[]>([null]);
  const [personNames, setPersonNames] = useState([""]);
  const [role, setRole] = useState<(typeof roleOptions)[number]["value"]>("m");
  const [comment, setComment] = useState("");

  const roleOptions: MultiChoiceOption[] = [
    { value: null, label: "Not selected" },
    { value: "mod", label: "Moderator" },
  ] as const;

  const handleSubmit = () => {};

  return (
    <>
      <p>
        Here you can send a request to the admin team to ask for a competitor profile to be tied to your account, ask
        for a role, or anything else.
      </p>
      <p>If you would like to update your request, simply submit the form again.</p>
      {userRequestInstructions && <Markdown>{userRequestInstructions}</Markdown>}

      <Form onSubmit={handleSubmit} isLoading={false} className="mt-5">
        <div className="row mb-2">
          <div className="col">
            <FormSelect
              title="Requested role"
              options={roleOptions}
              selected={role}
              setSelected={setRole}
              disabled={false}
            />
          </div>
          <div className="col">
            <FormPersonInputs
              title="Requested competitor profile"
              persons={persons}
              setPersons={setPersons}
              personNames={personNames}
              setPersonNames={setPersonNames}
              regions={regions}
              disabled={false}
              addNewPersonMode="default"
              redirectToOnAddPerson={`/user/settings?added-person=`}
              display="grid"
              showWcaId
            />
          </div>
        </div>
        <FormTextArea title="Comment" value={comment} setValue={setComment} rows={5} />
      </Form>
    </>
  );
}

export default UserRequestTab;
