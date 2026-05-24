import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./layout-client";

// Editorial serif for display/headings (high-contrast, luxe)
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-family",
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

// Clean humanist sans for body/UI
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body-family",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "XchangeSkills — Exchange Your Skills",
  description:
    "A community platform to exchange skills with others — no money required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="atelier"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body bg-bg text-content antialiased">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
