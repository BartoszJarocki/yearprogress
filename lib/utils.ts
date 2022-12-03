import { DateTime, Duration } from "luxon";

export const calculateYearTimeLeft = (timeZone: string) => {
  const currentDate = DateTime.local({ zone: timeZone });
  const endOfYearDate = DateTime.local({ zone: timeZone }).endOf("year");

  return Math.floor(endOfYearDate.diff(currentDate).as("seconds"));
};

export const calculateYearProgress = (timeLeftSeconds: number) => {
  const yearDurationInSeconds = Duration.fromObject({ years: 1 }).as("seconds");

  return Math.floor(
    ((yearDurationInSeconds - timeLeftSeconds) / yearDurationInSeconds) * 100
  );
};