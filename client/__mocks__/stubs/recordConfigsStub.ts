import type { InsertRecordConfig } from "~/server/db/schema/record-configs.ts";

export const recordConfigsStub: InsertRecordConfig[] = [
  // Competition result records
  {
    recordTypeId: "WR",
    category: "competitions" as const,
    label: "XWR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "ER",
    category: "competitions" as const,
    label: "XER",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "OcR",
    category: "competitions" as const,
    label: "XOcR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "AsR",
    category: "competitions" as const,
    label: "XAsR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "NAR",
    category: "competitions" as const,
    label: "XNAR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "SAR",
    category: "competitions" as const,
    label: "XSAR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "AfR",
    category: "competitions" as const,
    label: "XAfR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "NR",
    category: "competitions" as const,
    label: "XNR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },

  // Meetup result records
  {
    recordTypeId: "WR",
    category: "meetups" as const,
    label: "MWR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "ER",
    category: "meetups" as const,
    label: "MER",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "OcR",
    category: "meetups" as const,
    label: "MOcR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "AsR",
    category: "meetups" as const,
    label: "MAsR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "NAR",
    category: "meetups" as const,
    label: "MNAR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "SAR",
    category: "meetups" as const,
    label: "MSAR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "AfR",
    category: "meetups" as const,
    label: "MAfR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "NR",
    category: "meetups" as const,
    label: "MNR",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },

  // Video-based result records
  {
    recordTypeId: "WR",
    category: "online" as const,
    label: "WB",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "ER",
    category: "online" as const,
    label: "EB",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "OcR",
    category: "online" as const,
    label: "OcB",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "AsR",
    category: "online" as const,
    label: "AsB",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "NAR",
    category: "online" as const,
    label: "NAB",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "SAR",
    category: "online" as const,
    label: "SAB",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "AfR",
    category: "online" as const,
    label: "AfB",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
  {
    recordTypeId: "NR",
    category: "online" as const,
    label: "NB",
    active: true,
    rank: 1, // doesn't matter for tests
    color: "#000000", // doesn't matter for tests
  },
].map((rc) => ({ organizationId: "default", ...rc }));
