/* Downloads the development photography set from Unsplash into public/photos/.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  THIS IS A DELIBERATE, DOCUMENTED DEVIATION FROM THE SPEC.
 *
 *  design.md §0.2 rejects stock photography outright, and implementationplan.md
 *  Phase 2 makes "Zero stock photography anywhere" an acceptance criterion. R-07
 *  is the reasoning: authenticity signals outperform stock polish, and a site
 *  whose entire positioning is "we photograph the concealed work" cannot be
 *  illustrated with someone else's photographs without undermining itself.
 *
 *  These images exist so the UI can be judged against real photographic weight
 *  during development instead of grey rectangles. They MUST be replaced with the
 *  business's own project photography before launch (Phase 2, §8.2 shoots 1–7).
 *  SRS §10 gate 4 — "zero stock photography" — is a release gate.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Images are downloaded rather than hot-linked so that:
 *   - NFR-SEC-02's `default-src 'self'` CSP needs no external image host,
 *   - next/image can optimise them to AVIF/WebP (NFR-PERF-06),
 *   - the site works with no network at build time.
 *
 * Photo IDs are pinned, so the set is identical on every run and does not churn.
 * public/photos/ is gitignored; run `npm run photos` after cloning.
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const OUT = join(process.cwd(), "public", "photos");

/* Node's fetch fails the TLS handshake against images.unsplash.com in some
 * sandboxes (ERR_SSL_TLSV1_ALERT_DECODE_ERROR) while curl succeeds, so the
 * download goes through curl. */
function download(url, path) {
  execFileSync("curl", ["-sS", "--max-time", "90", "-L", "-o", path, url], {
    stdio: ["ignore", "ignore", "pipe"],
  });
}

/** Unsplash serves derivatives from query params — crop server-side so we never
 *  ship pixels the layout will not use. */
function url(id, w, h) {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&crop=entropy&auto=format&q=75`;
}

/* The set, mapped to where each image is actually used. Subjects are chosen to
 * match §8.2's shot list as closely as stock allows: interiors with real light,
 * construction detail for the behind-the-wall strip, and material macros. */
const PHOTOS = [
  // Hero — a dark, light-led interior so the headline scrim has depth (§4.1).
  ["hero.jpg", "photo-1600607687939-ce8a6c25118c", 1920, 1200],

  // Project heroes (16:10)
  ["project-1.jpg", "photo-1600585154340-be6161a56a0c", 1200, 750],
  ["project-2.jpg", "photo-1600566753086-00f18fb6b3ea", 1200, 750],
  ["project-3.jpg", "photo-1600047509807-ba8f99d2cdde", 1200, 750],
  ["project-4.jpg", "photo-1541888946425-d81bb19240f5", 1200, 750],
  ["project-5.jpg", "photo-1449844908441-8829872d2607", 1200, 750],
  ["project-6.jpg", "photo-1518005020951-eccb494ad742", 1200, 750],

  /* §3.14 before/after: two shots of a comparable room, one raw and one
   * finished. Stock cannot give a true matched pair — the spec requires
   * identical framing and crop, which only our own tripod can produce. */
  ["before.jpg", "photo-1503387762-592deb58ef4e", 1200, 675],
  ["after.jpg", "photo-1600585154526-990dced4db0d", 1200, 675],

  // §3.15 behind-the-wall — concealed works, the differentiator strip.
  ["btw-1.jpg", "photo-1567767292278-a4f21aa2d36e", 800, 600],
  ["btw-2.jpg", "photo-1504307651254-35680f356dfd", 800, 600],
  ["btw-3.jpg", "photo-1621905251189-08b45d6a269e", 800, 600],
  ["btw-4.jpg", "photo-1581094794329-c8112a89af12", 800, 600],
  ["btw-5.jpg", "photo-1503594384566-461fe158e797", 800, 600],

  // §3.17 material swatches — 1:1 macros.
  ["material-1.jpg", "photo-1511818966892-d7d671e672a2", 600, 600],
  ["material-2.jpg", "photo-1615873968403-89e068629265", 600, 600],
  ["material-3.jpg", "photo-1493397212122-2b85dda8106b", 600, 600],
  ["material-4.jpg", "photo-1524230572899-a752b3835840", 600, 600],

  // Gallery — mixed crops so the masonry staggers (§4.4 §7).
  ["gallery-1.jpg", "photo-1600210492486-724fe5c67fb0", 900, 1200],
  ["gallery-2.jpg", "photo-1600566753190-17f0baa2a6c3", 900, 700],
  ["gallery-3.jpg", "photo-1560448204-e02f11c3d0e2", 900, 1100],
  ["gallery-4.jpg", "photo-1522708323590-d24dbb6b0267", 900, 700],
  ["gallery-5.jpg", "photo-1502005229762-cf1b2da7c5d6", 900, 1200],
  ["gallery-6.jpg", "photo-1493809842364-78817add7ffb", 900, 700],

  // Drawings / technical layer (§0.3 layer 3) and the team/workshop shot.
  ["drawing-1.jpg", "photo-1487958449943-2429e8be8625", 1200, 900],
  ["team-1.jpg", "photo-1416339306562-f3d12fefd36f", 800, 600],
  ["service-1.jpg", "photo-1600573472550-8090b5e0745e", 1200, 900],
];

mkdirSync(OUT, { recursive: true });

const force = process.argv.includes("--force");
let fetched = 0;
let skipped = 0;
let failed = 0;

console.log(
  "\nDEV PHOTOGRAPHY — stock, and a documented deviation from design.md §0.2.\n" +
    "Replace with the business's own project photography before launch.\n",
);

for (const [name, id, w, h] of PHOTOS) {
  const path = join(OUT, name);
  if (existsSync(path) && !force) {
    skipped += 1;
    continue;
  }
  try {
    download(url(id, w, h), path);
    fetched += 1;
    process.stdout.write(`  ${name}\n`);
  } catch {
    failed += 1;
    console.error(`  FAILED ${name} (${id})`);
  }
}

console.log(
  `\n${fetched} downloaded, ${skipped} already present, ${failed} failed.\n`,
);
if (failed > 0) process.exitCode = 1;
