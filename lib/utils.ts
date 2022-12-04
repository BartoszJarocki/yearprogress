import { DateTime, Duration } from "luxon";

export const calculateYearTimeLeft = (timeZone: string) => {
  const currentDate = DateTime.local({ zone: timeZone });
  const endOfYearDate = DateTime.local({ zone: timeZone }).endOf("year");

  return endOfYearDate.diff(currentDate, [
    "months",
    "days",
    "hours",
    "minutes",
    "seconds",
  ]);
};

export const calculateYearProgress = (timeLeftInSeconds: number) => {
  const yearDurationInSeconds = Duration.fromObject({ years: 1 }).as("seconds");

  return Math.floor(
    ((yearDurationInSeconds - timeLeftInSeconds) / yearDurationInSeconds) * 100
  );
};
