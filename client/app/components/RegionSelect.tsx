"use client";

import { useQueryState } from "nuqs";
import FormRegionSelect from "~/app/components/form/FormRegionSelect.tsx";
import { C } from "~/helpers/constants.ts";
import type { SelectRegion } from "~/server/db/schema/regions.ts";

type Props = {
  regions: Pick<SelectRegion, "code" | "name">[];
};

function RegionSelect({ regions }: Props) {
  const [region, setRegion] = useQueryState("region", { defaultValue: C.notSelectedOption, shallow: false });

  return <FormRegionSelect regionCode={region} setRegionCode={setRegion} regions={regions} continentOptions />;
}

export default RegionSelect;
