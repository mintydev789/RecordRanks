"use client";

import FormInputLabel from "~/app/components/form/FormInputLabel.tsx";
import { C } from "~/helpers/constants.ts";
import { Continents } from "~/helpers/continents.ts";
import { NonMetaRegionCodeRegex } from "~/helpers/validators/Validators.ts";
import type { SelectRegion } from "~/server/db/schema/regions.ts";

type Props = {
  regionCode: string | typeof C.notSelectedOption;
  setRegionCode: (value: string | typeof C.notSelectedOption) => void;
  regions: Pick<SelectRegion, "code" | "name">[];
  nextFocusTargetId?: string;
  continentOptions?: boolean;
  disabled?: boolean;
};

function FormRegionSelect({
  regionCode,
  setRegionCode,
  regions,
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
      <FormInputLabel text="Region" inputId="region_code" />

      <select
        id="region_code"
        value={regionCode}
        onChange={(e) => setRegionCode(e.target.value)}
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
          <option value={C.notSelectedOption}>Select region</option>
        )}

        {regions
          .filter((r) => NonMetaRegionCodeRegex.test(r.code))
          .map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
      </select>
    </div>
  );
}

export default FormRegionSelect;
