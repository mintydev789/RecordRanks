"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import FormCountrySelect from "~/app/components/form/FormCountrySelect.tsx";
import { C } from "~/helpers/constants.ts";

function RegionSelect() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [region, setRegion] = useQueryState("region", { defaultValue: C.notSelectedOption });

  const onChangeCountryIso2 = (newRegion: string | typeof C.notSelectedOption) => {
    if (newRegion !== region) {
      setRegion(newRegion);

      // THIS IS CODE SMELL!!! FILTERING SHOULD BE DONE CLIENT-SIDE, LIKE ON THE MOD DASHBOARD!!!!!!!!!!!!!!
      const urlSearchParams = new URLSearchParams(searchParams);
      urlSearchParams.delete("region");
      if (newRegion !== C.notSelectedOption) urlSearchParams.append("region", newRegion);
      window.location.replace(`${pathname}?${urlSearchParams}`);
    }
  };

  return <FormCountrySelect countryIso2={region} setCountryIso2={onChangeCountryIso2} continentOptions />;
}

export default RegionSelect;
