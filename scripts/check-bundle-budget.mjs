/* SRS §8.1 / NFR-PERF-10 — "Budgets are enforced in CI; a build exceeding any
 * budget fails."
 *
 * implementationplan.md Phase 0 makes this an acceptance criterion: "A
 * deliberately oversized dependency added to a PR causes CI to fail on the
 * bundle budget." Phase 0's risk note is blunt about why it exists now rather
 * than later: "Deferring CI enforcement to 'later' — it never happens, and the
 * performance budgets become unachievable retroactively."
 *
 * What is measured
 * ----------------
 * SHARED first-load JS: the chunks every route loads, which is what Next
 * reports as "First Load JS shared by all". Computed as the intersection of the
 * chunk lists across every route in app-build-manifest.json, then gzipped —
 * the budget is stated in gzipped bytes, and raw bytes would be roughly 3x and
 * would fail a budget that is actually being met.
 *
 * PER-ROUTE additional JS is also checked at 90KB (NFR-PERF-03).
 */

import { gzipSync } from "node:zlib";
import { readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const NEXT_DIR = join(ROOT, ".next");

// SRS §8.1
const SHARED_BUDGET_KB = 130;
const PER_ROUTE_BUDGET_KB = 90;

const KB = 1024;

function fail(message) {
  console.error(`\n[31m✗ Bundle budget: ${message}[39m\n`);
  process.exit(1);
}

const manifestPath = join(NEXT_DIR, "app-build-manifest.json");
if (!existsSync(manifestPath)) {
  fail(
    `${manifestPath} not found. Run \`next build\` before the budget check.`,
  );
}

/** @type {{ pages: Record<string, string[]> }} */
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const routes = Object.entries(manifest.pages);

if (routes.length === 0) fail("no routes found in app-build-manifest.json");

/* Gzipped size of one built asset. Cached: shared chunks appear in every
 * route's list, and gzipping a 60KB chunk once per route adds up. */
const sizeCache = new Map();
function gzippedSize(file) {
  if (sizeCache.has(file)) return sizeCache.get(file);
  const path = join(NEXT_DIR, file);
  if (!existsSync(path) || !statSync(path).isFile()) {
    sizeCache.set(file, 0);
    return 0;
  }
  const size = gzipSync(readFileSync(path), { level: 9 }).length;
  sizeCache.set(file, size);
  return size;
}

const isJs = (file) => file.endsWith(".js");

/* SHARED = the framework baseline every route loads, which Next tracks as
 * `rootMainFiles` in build-manifest.json.
 *
 * An earlier version derived this as the INTERSECTION of every route in
 * app-build-manifest. That silently broke once most pages became fully static:
 * only routes carrying a client component appear in that manifest, so with two
 * entries the intersection collapsed to almost nothing and the remainder was
 * misattributed to the route — reporting /estimate at 126KB against a 90KB
 * budget when its real additional cost was a fraction of that. */
const buildManifestPath = join(NEXT_DIR, "build-manifest.json");
if (!existsSync(buildManifestPath)) {
  fail(`${buildManifestPath} not found. Run \`next build\` before the check.`);
}

const buildManifest = JSON.parse(readFileSync(buildManifestPath, "utf8"));
const shared = new Set((buildManifest.rootMainFiles ?? []).filter(isJs));

if (shared.size === 0) {
  fail("no rootMainFiles in build-manifest.json — is this a production build?");
}

/* A dev server writing to the same .next would leave HMR chunks here, which are
 * not shipped and would inflate the number. Catch it rather than report a
 * figure that means nothing. */
if ([...shared].some((file) => file.includes("hmr-client"))) {
  fail(
    "build-manifest.json contains dev HMR chunks. Stop `next dev`, delete .next, and rebuild.",
  );
}

const sharedBytes = [...shared].reduce(
  (total, file) => total + gzippedSize(file),
  0,
);

const perRoute = routes
  .map(([route, chunks]) => {
    const additional = chunks
      .filter((file) => isJs(file) && !shared.has(file))
      .reduce((total, file) => total + gzippedSize(file), 0);
    return { route, additional };
  })
  .sort((a, b) => b.additional - a.additional);

const kb = (bytes) => (bytes / KB).toFixed(1);

console.log("\nBundle budget (gzipped) — SRS §8.1");
console.log("─".repeat(56));
console.log(
  `  Shared first-load JS   ${kb(sharedBytes).padStart(7)} KB / ${SHARED_BUDGET_KB} KB   ` +
    `(${shared.size} chunks, ${routes.length} routes)`,
);
for (const { route, additional } of perRoute) {
  console.log(
    `  ${route.padEnd(22)} ${kb(additional).padStart(7)} KB / ${PER_ROUTE_BUDGET_KB} KB`,
  );
}
console.log("─".repeat(56));

const failures = [];
if (sharedBytes > SHARED_BUDGET_KB * KB) {
  failures.push(
    `shared first-load JS is ${kb(sharedBytes)}KB, over the ${SHARED_BUDGET_KB}KB budget`,
  );
}
for (const { route, additional } of perRoute) {
  if (additional > PER_ROUTE_BUDGET_KB * KB) {
    failures.push(
      `route ${route} adds ${kb(additional)}KB, over the ${PER_ROUTE_BUDGET_KB}KB budget`,
    );
  }
}

if (failures.length) fail(failures.join("; "));

console.log("[32m✓ within budget[39m\n");
