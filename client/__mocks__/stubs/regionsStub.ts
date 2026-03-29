import type { InsertRegion } from "~/server/db/schema/regions.ts";

export const regionsStub: InsertRegion[] = [
  {
    name: "United Kingdom",
    shortName: "UK",
    code: "GB",
    superRegionCode: "EUROPE",
    superRegionRecordType: "ER",
  },
  {
    name: "Germany",
    shortName: null,
    code: "DE",
    superRegionCode: "EUROPE",
    superRegionRecordType: "ER",
  },
  {
    name: "Japan",
    shortName: null,
    code: "JP",
    superRegionCode: "ASIA",
    superRegionRecordType: "AsR",
  },
  {
    name: "South Korea",
    shortName: null,
    code: "KR",
    superRegionCode: "ASIA",
    superRegionRecordType: "AsR",
  },
  {
    name: "United States",
    shortName: "USA",
    code: "US",
    superRegionCode: "NORTH_AMERICA",
    superRegionRecordType: "NAR",
  },
  {
    name: "Canada",
    shortName: null,
    code: "CA",
    superRegionCode: "NORTH_AMERICA",
    superRegionRecordType: "NAR",
  },
  {
    name: "South Africa",
    shortName: null,
    code: "ZA",
    superRegionCode: "AFRICA",
    superRegionRecordType: "AfR",
  },
  {
    name: "Uruguay",
    shortName: null,
    code: "UY",
    superRegionCode: "SOUTH_AMERICA",
    superRegionRecordType: "SAR",
  },
];
