import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { showFireworks } from "../lib/fireworks/showFireworks";
import { calculateYearProgress, calculateYearTimeLeft } from "../lib/utils";
import { NextSeo } from "next-seo";

const TIMER_INTERVAL_MS = 1000; // 1s
const IS_CLOSE_THRESHOLD = 30;

interface Props {
  initialPercentPassed: number;
  initialTimeLeft: number;
  ogUrl: string;
}

const YearProgress: NextPage<Props> = ({
  initialPercentPassed,
  initialTimeLeft,
  ogUrl
}) => {
  const timeZoneRef = useRef(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState(initialTimeLeft);
  const [percentPassed, setPercentPassed] = useState(initialPercentPassed);
  const messageToDisplay =
    timeLeftInSeconds === 0 ? "Happy new year!" : timeLeftInSeconds;
  const isCloseToEnd = timeLeftInSeconds <= IS_CLOSE_THRESHOLD;
  const currentYear = useMemo(() => DateTime.local().year, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timeLeft = calculateYearTimeLeft(timeZoneRef.current);

      setTimeLeftInSeconds(timeLeft);
      setPercentPassed(calculateYearProgress(timeLeft));
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
          title: "Year progress",
          description: `${percentPassed}% of ${currentYear} has passed.`,
          images: [{ url: ogUrl, width: 1200, height: 500 }],
          site_name: "Year progress"
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
