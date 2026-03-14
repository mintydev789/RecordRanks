import { roundsStub } from "~/__mocks__/stubs/roundsStub";
import type { Schedule } from "~/helpers/types/Schedule.ts";
import type { ContestType } from "~/helpers/types.ts";
import type { InsertContest } from "~/server/db/schema/contests.ts";

function getSchedule(contest: Pick<InsertContest, "competitionId" | "startDate" | "endDate">): Schedule {
  const rounds = roundsStub.filter((r) => r.competitionId === contest.competitionId);

  return {
    venues: [
      {
        id: 1,
        name: "Venueplace",
        countryIso2: "GB",
        latitudeMicrodegrees: 10,
        longitudeMicrodegrees: 10,
        timezone: "Europe/London",
        rooms: [
          {
            id: 1,
            name: "Roomhall",
            color: "#000000",
            activities: rounds.map((r, index) => ({
              id: index + 1,
              activityCode: `${r.eventId}-r${r.roundNumber}`,
              startTime: contest.startDate,
              endTime: contest.startDate,
              childActivities: [],
            })),
          },
        ],
      },
    ],
  };
}

// Mapped to the final shape at the bottom
export const contestsStub: InsertContest[] = [
  // 2023
  {
    competitionId: "TestMeetupJan2023",
    name: "Test Meetup January 2023",
    type: "meetup" as ContestType,
    startDate: new Date(2023, 0, 1),
    endDate: new Date(2023, 0, 1),
  },
  {
    competitionId: "TestCompJan2023",
    name: "Test Competition January 2023",
    type: "comp" as ContestType,
    startDate: new Date(2023, 0, 1),
    endDate: new Date(2023, 0, 1),
  },
  {
    competitionId: "TestMeetupFeb2023",
    name: "Test Meetup February 2023",
    type: "meetup" as ContestType,
    startDate: new Date(2023, 1, 1),
    endDate: new Date(2023, 1, 1),
  },
  {
    competitionId: "TestCompFeb2023",
    name: "Test Competition February 2023",
    type: "comp" as ContestType,
    startDate: new Date(2023, 1, 1),
    endDate: new Date(2023, 1, 1),
  },
  {
    competitionId: "TestMeetupMar2023",
    name: "Test Meetup March 2023",
    type: "meetup" as ContestType,
    startDate: new Date(2023, 2, 1),
    endDate: new Date(2023, 2, 1),
  },
  {
    competitionId: "TestCompMar2023",
    name: "Test Competition March 2023",
    type: "comp" as ContestType,
    startDate: new Date(2023, 2, 1),
    endDate: new Date(2023, 2, 1),
  },
  // 2026
  {
    competitionId: "TestComp2026",
    name: "Test Competition 2026",
    type: "comp" as ContestType,
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 0, 1),
  },
  {
    competitionId: "TestMeetupJan2026",
    name: "Test Meetup January 2026",
    type: "meetup" as ContestType,
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 0, 1),
  },
  {
    competitionId: "TestMeetupFeb2026",
    name: "Test Meetup February 2026",
    type: "meetup" as ContestType,
    startDate: new Date(2026, 1, 1),
    endDate: new Date(2026, 1, 1),
  },
  {
    competitionId: "TestMeetupMar2026",
    name: "Test Meetup March 2026",
    type: "meetup" as ContestType,
    startDate: new Date(2026, 2, 1),
    endDate: new Date(2026, 2, 1),
  },
  {
    competitionId: "Munich30062026",
    name: "Meetup in Munich 30 June 2026",
    type: "meetup" as ContestType,
    startDate: new Date(2026, 5, 30),
    endDate: new Date(2026, 5, 30),
  },
  // 2028
  {
    competitionId: "TestMeetupJan2028",
    name: "Test Meetup January 2028",
    type: "meetup" as ContestType,
    startDate: new Date(2028, 0, 1),
    endDate: new Date(2028, 0, 1),
  },
  {
    competitionId: "TestCompJan2028",
    name: "Test Competition January 2028",
    type: "comp" as ContestType,
    startDate: new Date(2028, 0, 1),
    endDate: new Date(2028, 0, 1),
  },
  {
    competitionId: "TestMeetupFeb2028",
    name: "Test Meetup February 2028",
    type: "meetup" as ContestType,
    startDate: new Date(2028, 1, 1),
    endDate: new Date(2028, 1, 1),
  },
  {
    competitionId: "TestCompFeb2028",
    name: "Test Competition February 2028",
    type: "comp" as ContestType,
    startDate: new Date(2028, 1, 1),
    endDate: new Date(2028, 1, 1),
  },
  {
    competitionId: "TestMeetupMar2028",
    name: "Test Meetup March 2028",
    type: "meetup" as ContestType,
    startDate: new Date(2028, 2, 1),
    endDate: new Date(2028, 2, 1),
  },
  {
    competitionId: "TestCompMar2028",
    name: "Test Competition March 2028",
    type: "comp" as ContestType,
    startDate: new Date(2028, 2, 1),
    endDate: new Date(2028, 2, 1),
  },
  {
    competitionId: "TestMeetupApr2028",
    name: "Test Meetup April 2028",
    type: "meetup" as ContestType,
    startDate: new Date(2028, 3, 1),
    endDate: new Date(2028, 3, 1),
  },
  {
    competitionId: "TestCompApr2028",
    name: "Test Competition April 2028",
    type: "comp" as ContestType,
    startDate: new Date(2028, 3, 1),
    endDate: new Date(2028, 3, 1),
  },
].map((c) => ({
  ...c,
  state: "approved",
  shortName: c.name,
  city: "Citytown",
  regionCode: "GB",
  venue: "Venueplace",
  address: "Address st. 123",
  latitudeMicrodegrees: 10,
  longitudeMicrodegrees: 10,
  startTime: c.type === "meetup" ? c.startDate : undefined,
  timezone: c.type === "meetup" ? "Europe/London" : undefined,
  organizerIds: [1],
  contact: "email@example.com",
  description: "Description",
  competitorLimit: 100,
  schedule: c.type === "meetup" ? undefined : getSchedule(c),
}));
