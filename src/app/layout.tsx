import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/* design.md §2.2.1 — three families, self-hosted, ≤3 woff2 files ≤190KB total
 * (NFR-PERF-05).
 *
 * These are the LATIN SUBSET, VARIABLE cuts, so one file covers every weight
 * each family uses:
 *
 *   Fraunces       67.3 KB   (opsz + wght axes — §2.2.2 uses opsz per size)
 *   Inter          48.3 KB
 *   JetBrains Mono 40.4 KB
 *   ────────────────────────
 *   TOTAL         152.3 KB   / 190 KB budget
 *
 * `display: swap` is mandatory: fallback text renders immediately so the LCP
 * headline never waits on a font. The fallback stacks are metric-sympathetic
 * rather than generic, because they are what is actually on screen during swap;
 * `adjustFontFallback` then tunes the metrics to keep CLS under the 0.05 budget.
 */

const fraunces = localFont({
  src: "../styles/fonts/fraunces-latin-var.woff2",
  display: "swap",
  variable: "--font-fraunces",
  weight: "300 700",
  // §4.1 — the hero headline is the LCP element, so this one is preloaded.
  preload: true,
  fallback: ["Iowan Old Style", "Palatino Linotype", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});

const inter = localFont({
  src: "../styles/fonts/inter-latin-var.woff2",
  display: "swap",
  variable: "--font-inter",
  weight: "400 700",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: "Arial",
});

const jetbrainsMono = localFont({
  src: "../styles/fonts/jetbrains-mono-latin-var.woff2",
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: "300 500",
  // Mono carries datum lines and figures — none of it is above the fold on the
  // critical path, so it loads without competing with the headline.
  preload: false,
  fallback: ["ui-monospace", "SF Mono", "Cascadia Mono", "Roboto Mono", "monospace"],
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
