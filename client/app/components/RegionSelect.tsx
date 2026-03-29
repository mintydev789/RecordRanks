"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import FormRegionSelect from "~/app/components/form/FormRegionSelect.tsx";
import { C } from "~/helpers/constants.ts";
import type { SelectRegion } from "~/server/db/schema/regions.ts";

type Props = {
  regions: Pick<SelectRegion, "code" | "name">[];
};

function RegionSelect({ regions }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [region, setRegion] = useQueryState("region", { defaultValue: C.notSelectedOption });

  const onChangeRegionCode = (newRegion: string | typeof C.notSelectedOption) => {
    if (newRegion !== region) {
      setRegion(newRegion);

      // THIS IS CODE SMELL!!! FILTERING SHOULD BE DONE CLIENT-SIDE, LIKE ON THE MOD DASHBOARD!!!!!!!!!!!!!!
      const urlSearchParams = new URLSearchParams(searchParams);
      urlSearchParams.delete("region");
      if (newRegion !== C.notSelectedOption) urlSearchParams.append("region", newRegion);
      window.location.replace(`${pathname}?${urlSearchParams}`);
    }
  };

  return <FormRegionSelect regionCode={region} setRegionCode={onChangeRegionCode} regions={regions} continentOptions />;
}

export default RegionSelect;
