import type { RoundFormat } from "./types.ts";

export type RoundFormatObject = {
  value: RoundFormat;
  label: string;
  shortLabel: string;
  attempts: number;
  isAverage: boolean;
  bestAndWorstAttemptsToExclude: number; // TO-DO: ADD SUPPORT FOR THIS VALUE BEING > 1 TO getBestAndAverage()!!!
};

export const roundFormats: RoundFormatObject[] = [
  {
    value: "1",
    label: "Best of 1",
    shortLabel: "Bo1",
    attempts: 1,
    isAverage: false,
    bestAndWorstAttemptsToExclude: 0,
  },
  {
    value: "2",
    label: "Best of 2",
    shortLabel: "Bo2",
    attempts: 2,
    isAverage: false,
    bestAndWorstAttemptsToExclude: 0,
  },
  // Average is always calculated for results with 3 or more attempts, even if it's a Best of N format
  {
    value: "3",
    label: "Best of 3",
    shortLabel: "Bo3",
    attempts: 3,
    isAverage: false,
    bestAndWorstAttemptsToExclude: 0,
  },
  {
    value: "m",
    label: "Mean of 3",
    shortLabel: "Mo3",
    attempts: 3,
    isAverage: true,
    bestAndWorstAttemptsToExclude: 0,
  },
  {
    value: "5",
    label: "Best of 5",
    shortLabel: "Bo5",
    attempts: 5,
    isAverage: false,
    bestAndWorstAttemptsToExclude: 1,
  },
  {
    value: "a",
    label: "Average of 5",
    shortLabel: "Ao5",
    attempts: 5,
    isAverage: true,
    bestAndWorstAttemptsToExclude: 1,
  },
];
