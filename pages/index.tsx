import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { DateTime, Duration } from "luxon";
import { useEffect, useRef, useState } from "react";
import { showFireworks } from "../lib/fireworks/showFireworks";

const TIMER_INTERVAL_MS = 1000; // 1s
const IS_CLOSE_THRESHOLD = 30;

const calculateYearTimeLeft = (timeZone: string) => {
  const currentDate = DateTime.local({ zone: timeZone });
  const endOfYearDate = DateTime.local({ zone: timeZone }).endOf("year");

  return endOfYearDate.diff(currentDate).as("seconds");
};

const calculateYearProgress = (timeLeftSeconds: number) => {
  const yearDurationInSeconds = Duration.fromObject({ years: 1 }).as("seconds");

  return Math.floor(
    ((yearDurationInSeconds - timeLeftSeconds) / yearDurationInSeconds) * 100
  );
};

export const useYearProgress = (
  initialPercentPassed: number,
  initialTimeLeft: number
) => {
  const timeZoneRef = useRef(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState(initialTimeLeft);
  const [percentPassed, setPercentPassed] = useState(initialPercentPassed);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timeLeft = calculateYearTimeLeft(timeZoneRef.current);

      setTimeLeftInSeconds(timeLeft);
      setPercentPassed(calculateYearProgress(timeLeft));
    }, TIMER_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return {
    currentYear: DateTime.local().year,
    percentPassed,
    timeLeftInSeconds,
    messageToDisplay:
      timeLeftInSeconds === 0 ? "Happy new year!" : timeLeftInSeconds,
    isCloseToEnd: timeLeftInSeconds <= IS_CLOSE_THRESHOLD,
  };
};

interface Props {
  initialPercentPassed: number;
  initialTimeLeft: number;
}

const YearProgress: NextPage<Props> = ({
  initialPercentPassed,
  initialTimeLeft,
}) => {
  const {
    currentYear,
    percentPassed,
    messageToDisplay,
    isCloseToEnd,
    timeLeftInSeconds,
  } = useYearProgress(initialPercentPassed, initialTimeLeft);

  useEffect(() => {
    if (timeLeftInSeconds === 0) {
      showFireworks();
    }
  }, [timeLeftInSeconds]);

  return (
    <div>
      <Head>
        <title>Year Progress</title>
        <meta name="description" content="Shows the year progress" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-screen w-screen flex">
        {isCloseToEnd ? (
          <h1 className="font-black text-6xl">{messageToDisplay}</h1>
        ) : (
          <div className="m-auto flex flex-col items-center justify-center gap-8 w-full max-w-2xl p-4">
            <h1 className="font-black text-6xl">{currentYear}</h1>
            <div className="h-8 w-full border">
              <div
                className="bg-gray-300 h-full"
                style={{ width: `${percentPassed}%` }}
              />
            </div>
            <h2 className="font-extrabold text-4xl">{`${percentPassed}%`}</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const timeZone = (req.headers["x-vercel-ip-timezone"] as string) || "UTC";
  const timeLeft = calculateYearTimeLeft(timeZone);
  const percentPassed = calculateYearProgress(timeLeft);
  const { ogPercent, ogYear } = query;

  return {
    props: {
      initialPercentPassed: percentPassed,
      initialTimeLeft: timeLeft,
      ogUrl: `https://${req.headers.host}/api/og?currentYear=${
        ogYear || DateTime.local().year
      }&percentPassed=${ogPercent || percentPassed}`,
    },
  };
};

export default YearProgress;
