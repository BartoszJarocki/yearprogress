import type { NextApiRequest, NextApiResponse } from "next";
import moment from "moment-timezone";
// @ts-ignore
import FB from "fb";
import TwitterApi from "twitter-api-v2";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FB_ACCESS_TOKEN: string;
      TWITTER_APP_KEY: string;
      TWITTER_APP_SECRET: string;
      TWITTER_ACCESS_TOKEN: string;
      TWITTER_ACCESS_SECRET: string;
    }
  }
}

const timeZone = `Pacific/Auckland`;
FB.setAccessToken(process.env.FB_ACCESS_TOKEN);

console.log("Creating Twitter client...", process.env.TWITTER_APP_KEY);
const twitterClient = new TwitterApi(
  new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  })
);

const postToFacebook = async (message: string, url: string) => {
  return new Promise((resolve, reject) => {
    FB.api(
      "/108123055076949/feed",
      "POST",
      { message, link: url },
      function (response: any) {
        if (response.error) {
          console.error(response.error);
          reject(response.error);
          return;
        }
        resolve(response);
      }
    );
  });
};

const postToTwitter = async (message: string) => {
  return twitterClient.v2.tweet(message);
};

const calculateEndOfTheYearTimeLeft = (startDate: any) => {
  const endOfYear = moment.tz(timeZone).endOf("year");
  return endOfYear.diff(startDate, "seconds");
};

const calculatePercentPassed = (startDate: any) => {
  const secondsInYear = moment.duration(1, "year").asSeconds();

  return Math.floor(
    ((secondsInYear - calculateEndOfTheYearTimeLeft(startDate)) * 100) /
      secondsInYear
  );
};

const SocialMediaRobot = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("Running YearProgress robot....");

  const now = moment.tz(timeZone);
  const todayPercentPassed = calculatePercentPassed(now);
  const yesterday = moment.tz(timeZone).subtract(1, "days");
  const yesterdayPercentPassed = calculatePercentPassed(yesterday);
  const url = `https://www.getyearprogress.com?ogPercent=${todayPercentPassed}&ogYear=${now.year()}`;
  const message = `🤖 ⏳ #yearprogress ${url}`;

  console.log(`Yesterday: ${yesterdayPercentPassed}%`);
  console.log(`Today: ${todayPercentPassed}%`);

  let result = { fb: "", twitter: "" };
  if (todayPercentPassed > yesterdayPercentPassed) {
  try {
    await postToFacebook(message, url);
    console.log("Posted to Facebook.");
    result.fb = "success";
  } catch (e: any) {
    console.error(e);
    result.fb = e.message || "error";
  }

  try {
    await postToTwitter(message);
    console.log("Posted to Twitter.");
    result.twitter = "success";
  } catch (error: any) {
    console.error(error);
    result.twitter = error.message || "error";
  }
  } else {
    console.log("No need to post.");
  }

  res.status(200).json({ result });
};

export default SocialMediaRobot;
