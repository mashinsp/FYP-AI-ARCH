import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI ARCH",
  description: "AI-powered floor plan generator",
};

function BackgroundSVG() {
  return (
    <>
      {/* Left Top Pattern */}
      <svg
        className="absolute top-0 left-0 transform -translate-x-1/4 -translate-y-1/4 opacity-25"
        width="800"
        height="800"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <mask id="fadeOutMask">
            <radialGradient id="maskGradient" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="white" />
              <stop offset="80%" stopColor="white" />
              <stop offset="100%" stopColor="black" />
            </radialGradient>
            <rect width="800" height="800" fill="url(#maskGradient)" />
          </mask>
        </defs>
        {/* Base pattern with curved paths */}
        <g mask="url(#fadeOutMask)">
          <path
            d="M0 100q 100 0 100 100t 100 100t 100 -100"
            stroke="url(#leftGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-50 200q 150 0 150 150t 150 150"
            stroke="url(#leftGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M100 0q 0 100 100 100t 100 100t 100 100"
            stroke="url(#leftGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>

      {/* Right Bottom Pattern */}
      <svg
        className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 opacity-25"
        width="800"
        height="800"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rightGradient" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <mask id="fadeOutMaskRight">
            <radialGradient id="maskGradientRight" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="white" />
              <stop offset="80%" stopColor="white" />
              <stop offset="100%" stopColor="black" />
            </radialGradient>
            <rect width="800" height="800" fill="url(#maskGradientRight)" />
          </mask>
        </defs>
        {/* Base pattern with curved paths - mirrored */}
        <g mask="url(#fadeOutMaskRight)" transform="rotate(180 300 300)">
          <path
            d="M0 100q 100 0 100 100t 100 100t 100 -100"
            stroke="url(#rightGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-50 200q 150 0 150 150t 150 150"
            stroke="url(#rightGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M100 0q 0 100 100 100t 100 100t 100 100"
            stroke="url(#rightGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 relative overflow-hidden min-h-screen`}>
        <BackgroundSVG />
          {children}
      </body>
    </html>
  );
}