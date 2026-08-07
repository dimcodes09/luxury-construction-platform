/* Preloaded via `node --require` before Next starts.
 *
 * Some sandboxes, CI runners and corporate networks point the system resolver
 * at a stub that refuses external queries. Node then fails every DNS lookup —
 * `next/font/google` cannot download its woff2 files at build time and the font
 * module fails to compile, which surfaces as:
 *
 *   Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
 *
 * …and every page 500s, which looks nothing like a DNS problem.
 *
 * src/lib/db/connect.ts applies the same override for Mongoose, but that runs
 * too late for the bundler: fonts are fetched during compilation, before any
 * app module is imported. Hence a preload.
 *
 * Opt-in via DNS_SERVERS in .env.local. Absent, this does nothing at all — on
 * Vercel the platform resolver is the correct one and must not be overridden.
 */

const { setServers, getServers } = require("node:dns");
const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

function readEnvFile() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

readEnvFile();

const servers = process.env.DNS_SERVERS?.split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (servers?.length) {
  try {
    setServers(servers);
    console.log(
      `[dns-bootstrap] resolver → ${getServers().join(", ")} (DNS_SERVERS override)`,
    );
  } catch (error) {
    console.warn(
      "[dns-bootstrap] could not apply DNS_SERVERS:",
      error instanceof Error ? error.message : error,
    );
  }
}
