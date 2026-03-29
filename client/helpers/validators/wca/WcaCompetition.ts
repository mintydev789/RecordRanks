import z from "zod";
import { RegionCodeValidator } from "~/helpers/validators/Validators.ts";
import { WcaPersonValidator } from "~/helpers/validators/wca/WcaPerson.ts";

export const WcaCompetitionValidator = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  short_name: z.string().nonempty(),
  city: z.string().nonempty(),
  country_iso2: RegionCodeValidator,
  venue: z.string(),
  venue_address: z.string(),
  latitude_degrees: z.number().min(-90).max(90),
  longitude_degrees: z.number().min(-180).max(180),
  start_date: z.iso.date(),
  end_date: z.iso.date(),
  competitor_limit: z.int(),
  delegates: WcaPersonValidator.extend({
    id: z.int().min(1),
  }).array(),
  organizers: WcaPersonValidator.extend({
    id: z.int().min(1),
  }).array(),
});
