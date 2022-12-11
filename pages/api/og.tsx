import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "experimental-edge",
};

const generateOpenGraphImageHandler = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const percentPassed = searchParams.get("percentPassed");
  const currentYear = searchParams.get("currentYear");

  const font = await fetch(
    new URL("../../assets/SpaceGrotesk-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        tw="h-screen w-screen flex bg-[#1f1f1f] text-[#e3e3e3]"
        style={{ fontFamily: "'Space Grotesk'" }}
      >
        <div tw="m-auto flex flex-col items-center justify-center space-y-8 w-full max-w-2xl p-4">
          <h1 tw="font-black text-6xl">{currentYear}</h1>
          <div tw="flex h-8 w-full border border-[#e3e3e3]">
            <div
              tw="bg-gray-300 h-full"
              style={{ width: `${percentPassed}%` }}
            />
          </div>
          <h2 tw="font-extrabold text-4xl">{`${percentPassed}%`}</h2>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Space Grotesk",
          data: font,
          style: "normal",
        },
      ],
    }
  );
};

export default generateOpenGraphImageHandler;
