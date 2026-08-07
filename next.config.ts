import type { NextConfig } from "next";

/* design-process.md Step 6 puts the component gallery at /dev/components, but
 * it pulls in every Radix primitive at once. Left in the production build it
 * inflates the shared chunks that SRS §8.1 caps at 130KB, so the budget would
 * be measured against code that never ships.
 *
 * `page.dev.tsx` is only a recognised page extension in development, so in a
 * production build the route does not exist and nothing it imports is traced. */
const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  pageExtensions: isDevelopment
    ? ["tsx", "ts", "dev.tsx"]
    : ["tsx", "ts"],

  images: {
    /* design.md §3.14 specifies quality={72} for before/after pairs, and the
     * same value is used across project, gallery and material imagery. Next 16
     * requires every quality actually used to be declared here. */
    qualities: [72],
    /* SRS NFR-PERF-06 budgets first-viewport image weight at ≤1.4MB and
     * full-page at ≤3.5MB. AVIF first, WebP as the fallback. */
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
