/* CLI entry point for the seeds:
 *
 *   npm run seed       — baseline reference data (safe anywhere)
 *   npm run seed:dev   — DEV-ONLY fixture projects (guarded, see seed-dev.ts)
 *
 * Loads .env.local by hand because a standalone script gets none of Next's env
 * injection. Fifteen lines against adding dotenv to the dependency tree.
 *
 * Everything is wrapped in main() rather than using top-level await: package.json
 * has no "type": "module", so tsx compiles this as CJS where top-level await is
 * a syntax error.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import mongoose from "mongoose";

function loadEnv(): void {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
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

async function main(): Promise<void> {
  loadEnv();

  if (!process.env.MONGODB_URI) {
    console.error(
      "\nMONGODB_URI is not set. Copy .env.example to .env.local and fill it in.\n",
    );
    process.exit(1);
  }

  const wantsDevFixtures = process.argv.includes("--dev");

  try {
    if (wantsDevFixtures) {
      const { seedDev } = await import("./seed-dev");
      await seedDev();
    } else {
      const { seed } = await import("./seed");
      await seed();
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(
      "\nSeed failed:",
      error instanceof Error ? error.message : error,
    );
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

void main();
