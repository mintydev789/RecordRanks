import z from "zod";
import { NonMetaRegionCodeValidator, WcaIdValidator } from "./Validators.ts";

const personNameRegex = /^[^()[\]{}]*$/;

export const PersonValidator = z.strictObject({
  name: z.string().min(3).regex(personNameRegex),
  localizedName: z.string().min(2).regex(personNameRegex).nullable(),
  regionCode: NonMetaRegionCodeValidator,
  wcaId: WcaIdValidator.nullable(),
});

export type PersonDto = z.infer<typeof PersonValidator>;
