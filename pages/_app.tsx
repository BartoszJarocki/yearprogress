import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Space_Grotesk } from "@next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${spaceGrotesk.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
