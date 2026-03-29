import type { RecordType, SuperRegionCode } from "./types.ts";

export const Continents: {
  name: string;
  code: SuperRegionCode;
  recordTypeId: RecordType;
}[] = [
  { name: "Africa", code: "AFRICA", recordTypeId: "AfR" },
  { name: "Asia", code: "ASIA", recordTypeId: "AsR" },
  { name: "Europe", code: "EUROPE", recordTypeId: "ER" },
  { name: "North America", code: "NORTH_AMERICA", recordTypeId: "NAR" },
  { name: "Oceania", code: "OCEANIA", recordTypeId: "OcR" },
  { name: "South America", code: "SOUTH_AMERICA", recordTypeId: "SAR" },
];

export const ContinentRecordType: Record<SuperRegionCode, RecordType> = {
  AFRICA: "AfR",
  ASIA: "AsR",
  EUROPE: "ER",
  NORTH_AMERICA: "NAR",
  OCEANIA: "OcR",
  SOUTH_AMERICA: "SAR",
};
