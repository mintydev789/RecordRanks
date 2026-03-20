"use client";

import FormInputLabel from "~/app/components/form/FormInputLabel.tsx";
import { Continents, Countries } from "~/helpers/Countries.ts";
import { C } from "~/helpers/constants.ts";

type Props = {
  countryIso2: string | typeof C.notSelectedOption;
  setCountryIso2: (value: string | typeof C.notSelectedOption) => void;
  nextFocusTargetId?: string;
  continentOptions?: boolean;
  disabled?: boolean;
};

function FormCountrySelect({
  countryIso2,
  setCountryIso2,
  nextFocusTargetId,
  continentOptions = false,
  disabled = false,
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextFocusTargetId) document.getElementById(nextFocusTargetId)?.focus();
    }
  };

  return (
    <div className="fs-5">
      <FormInputLabel text={continentOptions ? "Region" : "Country"} inputId="country_iso_2" />

      <select
        id="country_iso_2"
        value={countryIso2}
        onChange={(e) => setCountryIso2(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="form-select mt-2"
      >
        {continentOptions ? (
          <>
            <option value={C.notSelectedOption}>All regions</option>
            {Continents.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </>
        ) : (
          <option value={C.notSelectedOption}>Select country</option>
        )}

        {Countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FormCountrySelect;
