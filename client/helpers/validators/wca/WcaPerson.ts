import z from "zod";
import { NonMetaRegionCodeValidator, WcaIdValidator } from "~/helpers/validators/Validators.ts";

export const WcaPersonValidator = z.object({
  wca_id: WcaIdValidator.nullable(),
  name: z.string().nonempty(),
  country_iso2: NonMetaRegionCodeValidator,
});
