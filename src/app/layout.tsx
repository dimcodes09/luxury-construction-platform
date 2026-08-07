import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* design.md §2.2.1 — three families, no more.
 *
 * next/font downloads these at BUILD time and serves them from our own origin,
 * so there is no Google Fonts CDN request at runtime and no extra connection on
 * the critical path (§2.2.1 loading column, SRS NFR-PERF-05). Each is variable,
 * so one file covers every weight we use.
 *
 * `display: swap` is mandatory: fallback text renders immediately and the LCP
 * headline never waits on a font. */

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  // §2.2.2 uses opsz per size token; SOFT/WONK stay at defaults for now.
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  // §1.1.1 consequence 3: a coined name carries no meaning, so every
  // first-impression surface must state what we do in the first line.
  title: "ZYVORA — Construction • Interiors • Renovation",
  description:
    "We show you what's behind the wall. Published rates, published payment milestones, and photographs of the concealed work before we close it up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
