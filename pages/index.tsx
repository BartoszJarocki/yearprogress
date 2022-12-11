import { GetServerSideProps, NextPage } from "next";
import { DateTime, Duration } from "luxon";
import { useEffect, useState } from "react";
import { showFireworks } from "../lib/fireworks/showFireworks";
import { calculateYearProgress, calculateYearTimeLeft } from "../lib/utils";
import { NextSeo } from "next-seo";
import Icon from "@mdi/react";
import { mdiTwitter, mdiFacebook } from "@mdi/js";

const TIMER_INTERVAL_MS = 1000; // 1s
const IS_CLOSE_THRESHOLD = 30;

interface Props {
  timeLeftInSeconds: number;
  ogUrl: string;
}

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const YearProgress: NextPage<Props> = ({ timeLeftInSeconds, ogUrl }) => {
  const [timeLeftDuration, setTimeLeftDuration] = useState<Duration>();
  const currentYear = DateTime.local().year;
  const currentTimeLeftInSeconds = timeLeftDuration
    ? Math.floor(timeLeftDuration.as("seconds"))
    : timeLeftInSeconds;

  const yearProgressPercent = calculateYearProgress(currentTimeLeftInSeconds);
  const messageToDisplay =
    currentTimeLeftInSeconds === 0
      ? "Happy new year!"
      : currentTimeLeftInSeconds;
  const isCloseToEnd = currentTimeLeftInSeconds <= IS_CLOSE_THRESHOLD;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeftDuration(calculateYearTimeLeft(userTimeZone));
    }, TIMER_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (currentTimeLeftInSeconds === 0) {
      showFireworks();
    }
  }, [currentTimeLeftInSeconds]);

  const siteName = "Year progress";
  const title = `${currentYear} year progress`;
  const description = `${yearProgressPercent}%`;

  return (
    <div>
      <NextSeo
        title={title}
        description={description}
        canonical={"https://getyearprogress.com"}
        openGraph={{
          url: ogUrl,
          title,
          description,
          images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
          site_name: siteName,
        }}
        twitter={{
          handle: "@GetYearProgress",
          cardType: "summary_large_image",
        }}
      />

      <main className="h-screen w-screen flex">
        {isCloseToEnd ? (
          <section className="m-auto flex items-center justify-center w-full p-4">
            <h1 className="font-black text-8xl text-center">
              {messageToDisplay}
            </h1>
          </section>
        ) : (
          <section className="m-auto flex flex-col items-center gap-8 w-full h-full max-w-2xl p-4 min-h-0">
            <h1 className="mt-auto font-black text-6xl">{currentYear}</h1>
            <div className="h-8 w-full border flex-shrink-0">
              <div
                className="bg-gray-300 h-full"
                style={{ width: `${yearProgressPercent}%` }}
              />
            </div>
            <h2 className="font-extrabold text-4xl">{`${yearProgressPercent}%`}</h2>
            <div className="mt-auto font-mono min-h-[32px] text-xs">
              {timeLeftDuration && (
                <span>
                  {timeLeftDuration.months > 0 &&
                    `${timeLeftDuration.months} months, `}
                  {timeLeftDuration.days > 0 &&
                    `${timeLeftDuration.days} days, `}
                  {timeLeftDuration.hours} hours, {timeLeftDuration.minutes}{" "}
                  minutes, {Math.floor(timeLeftDuration.seconds)} seconds left
                </span>
              )}
            </div>
            <div className="text-sm inline-flex gap-4 items-center justify-center p-4">
              <a href="https://twitter.com/GetYearProgress">
                <Icon
                  path={mdiTwitter}
                  title="Follow Year Progress on Twitter"
                  size={0.8}
                />
              </a>
              <a href="https://www.facebook.com/profile.php?id=100077422771557">
                <Icon
                  path={mdiFacebook}
                  title="Follow Year Progress on Facebook"
                  size={0.8}
                />
              </a>
            </div>
          </section>
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
  const ogPercent = query.ogPercent as string
  const ogYear = query.ogYear as string

  return {
    props: {
      timeLeftInSeconds: timeLeftinSeconds,
      ogUrl: `https://${req.headers.host}/api/og?currentYear=${
        ogYear ?? DateTime.local().year
      }&percentPassed=${ogPercent ?? percentPassed}`,
    },
  };
};

export default YearProgress;
