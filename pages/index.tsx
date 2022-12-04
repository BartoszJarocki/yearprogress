import { GetServerSideProps, NextPage } from "next";
import { DateTime, Duration } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { showFireworks } from "../lib/fireworks/showFireworks";
import { calculateYearProgress, calculateYearTimeLeft } from "../lib/utils";
import { NextSeo } from "next-seo";

const TIMER_INTERVAL_MS = 1000; // 1s
const IS_CLOSE_THRESHOLD = 30;

interface Props {
  initialTimeLeft: number;
  ogUrl: string;
}

const YearProgress: NextPage<Props> = ({ initialTimeLeft, ogUrl }) => {
  const timeZoneRef = useRef(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timeLeftDuration, setTimeLeftDuration] = useState<Duration>();
  const currentYear = useMemo(() => DateTime.local().year, []);
  const timeLeftInSeconds = useMemo(
    () =>
      timeLeftDuration
        ? Math.floor(timeLeftDuration.as("seconds"))
        : initialTimeLeft,
    [timeLeftDuration, initialTimeLeft]
  );
  const percentPassed = useMemo(
    () => calculateYearProgress(timeLeftInSeconds),
    [timeLeftInSeconds]
  );
  const messageToDisplay =
    timeLeftInSeconds === 0 ? "Happy new year!" : timeLeftInSeconds;
  const isCloseToEnd = timeLeftInSeconds <= IS_CLOSE_THRESHOLD;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeftDuration(calculateYearTimeLeft(timeZoneRef.current));
    }, TIMER_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (timeLeftInSeconds === 0) {
      showFireworks();
    }
  }, [timeLeftInSeconds]);

  return (
    <div>
      <NextSeo
        title="Year progress"
        description="Shows current year progress"
        canonical={"https://getyearprogress.com"}
        openGraph={{
          url: ogUrl,
          title: `${currentYear} year progress`,
          description: `${percentPassed}%`,
          images: [{ url: ogUrl, width: 1200, height: 630 }],
          site_name: "Year progress",
        }}
      />

      <main className="h-screen w-screen flex">
        {isCloseToEnd ? (
          <div className="m-auto flex items-center justify-center w-full p-4">
            <h1 className="font-black text-8xl text-center">
              {messageToDisplay}
            </h1>
          </div>
        ) : (
          <div className="m-auto flex flex-col items-center justify-center gap-8 w-full h-full max-w-2xl p-4">
            <h1 className="mt-auto font-black text-6xl">{currentYear}</h1>
            <div className="h-8 w-full border flex-shrink-0">
              <div
                className="bg-gray-300 h-full"
                style={{ width: `${percentPassed}%` }}
              />
            </div>
            <h2 className="font-extrabold text-4xl">{`${percentPassed}%`}</h2>
            <div className="mt-auto font-mono min-h-[32px] text-xs">
              {timeLeftDuration && (
                <span>
                  {timeLeftDuration.months > 0 && `${timeLeftDuration.months} months, `} 
                  {timeLeftDuration.days > 0 && `${timeLeftDuration.days} days, `}
                  {timeLeftDuration.hours} hours,{" "}
                  {timeLeftDuration.minutes} minutes,{" "}
                  {Math.floor(timeLeftDuration.seconds)} seconds{" "}
                  left
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
}) => {
  const timeZone = (req.headers["x-vercel-ip-timezone"] as string) || "UTC";
  const timeLeftDuration = calculateYearTimeLeft(timeZone);
  const timeLeftinSeconds = Math.floor(timeLeftDuration.as("seconds"));
  const percentPassed = calculateYearProgress(timeLeftinSeconds);
  const { ogPercent, ogYear } = query;

  return {
    props: {
      initialTimeLeft: timeLeftinSeconds,
      ogUrl: `https://${req.headers.host}/api/og?currentYear=${
        ogYear ?? DateTime.local().year
      }&percentPassed=${ogPercent ?? percentPassed}`,
    },
  };
};

export default YearProgress;
