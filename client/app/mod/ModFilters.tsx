"use client";

import { useAction } from "next-safe-action/hooks";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useContext, useState } from "react";
import FiltersContainer from "~/app/components/FiltersContainer.tsx";
import FormPersonInputs from "~/app/components/form/FormPersonInputs.tsx";
import FormSelect from "~/app/components/form/FormSelect";
import Button from "~/app/components/UI/Button.tsx";
import { C } from "~/helpers/constants.ts";
import { MainContext } from "~/helpers/contexts.ts";
import type { MultiChoiceOption } from "~/helpers/types/MultiChoiceOption.ts";
import { ContestStateValues, type InputPerson } from "~/helpers/types.ts";
import { getActionError } from "~/helpers/utilityFunctions.ts";
import type { ModDashboardFiltersDto } from "~/helpers/validators/ModDashboardFilters.ts";
import type { PersonResponse } from "~/server/db/schema/persons.ts";
import { getPersonByIdSF } from "~/server/serverFunctions/personServerFunctions.ts";

const stateValues = [...ContestStateValues, "pending", C.notSelectedOption] as const;

type Props = {
  onChangeFilters: (newFilters: ModDashboardFiltersDto) => void;
  initOrganizerPerson: PersonResponse | undefined;
  isAdminView: boolean;
  disabled: boolean;
};

function ModFilters({ onChangeFilters, initOrganizerPerson, isAdminView, disabled }: Props) {
  const { changeErrorMessages } = useContext(MainContext);

  const { executeAsync: getPersonById, isPending: isGettingPerson } = useAction(getPersonByIdSF);
  const [{ organizerPersonId, state }, setFilters] = useQueryStates(
    {
      organizerPersonId: parseAsInteger,
      state: parseAsStringLiteral(stateValues).withDefault(C.notSelectedOption),
    },
    { history: "replace" },
  );
  const [persons, setPersons] = useState<InputPerson[]>([initOrganizerPerson ?? null]);
  const [personNames, setPersonNames] = useState([initOrganizerPerson?.name ?? ""]);

  const stateOptions: MultiChoiceOption<(typeof stateValues)[number]>[] = [
    { value: C.notSelectedOption, label: "Any" },
    { value: "pending", label: "Pending", disabled: !isAdminView },
    { value: "created", label: isAdminView ? "Created" : "Pending approval" },
    { value: "approved", label: "Approved" },
    { value: "ongoing", label: "Ongoing" },
    { value: "finished", label: isAdminView ? "Finished" : "Pending review" },
    { value: "published", label: "Published" },
    { value: "removed", label: "Removed", disabled: !isAdminView },
  ];

  const selectPerson = async (newPersonId: number) => {
    const res = await getPersonById({ id: newPersonId });

    if (res.serverError || res.validationErrors) {
      changeErrorMessages([getActionError(res)]);
    } else {
      setPersons([res.data!]);
      setPersonNames([res.data!.name]);
      setFilters({ organizerPersonId: newPersonId });
      onChangeFilters({ organizerPersonId: newPersonId, state: state === C.notSelectedOption ? null : state });
    }
  };

  const selectState = (newState: (typeof stateValues)[number]) => {
    setFilters({ state: newState });
    onChangeFilters({ organizerPersonId, state: newState === C.notSelectedOption ? null : newState });
  };

  const resetFilters = () => {
    setPersons([null]);
    setPersonNames([""]);
    setFilters({ organizerPersonId: null, state: C.notSelectedOption });
    onChangeFilters({ organizerPersonId: null, state: null });
  };

  return (
    <FiltersContainer className="mb-2">
      <FormPersonInputs
        title="Organizer"
        persons={persons}
        setPersons={setPersons}
        personNames={personNames}
        setPersonNames={setPersonNames}
        onSelectPerson={(val) => selectPerson(val.id)}
        disabled={disabled || isGettingPerson}
        addNewPersonMode="disabled"
        display="one-line"
      />
      <FormSelect
        title="State"
        options={stateOptions}
        selected={state}
        setSelected={selectState}
        disabled={disabled}
        oneLine
      />
      {(organizerPersonId || state !== C.notSelectedOption) && (
        <Button onClick={resetFilters} className="btn-secondary btn-md">
          Reset
        </Button>
      )}
    </FiltersContainer>
  );
}

export default ModFilters;
