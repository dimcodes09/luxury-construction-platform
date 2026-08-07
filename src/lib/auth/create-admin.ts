/* Creates the first back-office account.
 *
 *   npm run admin:create -- owner@example.com "a-long-password" Owner
 *
 * Better Auth has `disableSignUp: true` (SRS §3 — there is no public account
 * system), so this script is the only way an account comes into existence.
 * Role defaults to Owner, because the first account has to be able to create
 * the others (FR-ADM-22).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import mongoose from "mongoose";

function loadEnv(): void {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  loadEnv();

  const [email, password, roleArg] = process.argv.slice(2);
  const role = (roleArg ?? "owner").toLowerCase();

  if (!email || !password) {
    console.error(
      '\nUsage: npm run admin:create -- <email> "<password>" [owner|manager|editor]\n',
    );
    process.exit(1);
  }

  // NFR-SEC-06 — the instance enforces this too; failing early is friendlier.
  if (password.length < 12) {
    console.error("\nPassword must be at least 12 characters.\n");
    process.exit(1);
  }

  if (!["owner", "manager", "editor"].includes(role)) {
    console.error("\nRole must be owner, manager or editor.\n");
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error("\nMONGODB_URI is not set. Fill in .env.local first.\n");
    process.exit(1);
  }
  if (!process.env.BETTER_AUTH_SECRET) {
    console.error(
      "\nBETTER_AUTH_SECRET is not set. Generate one with:\n" +
        "  openssl rand -base64 32\n",
    );
    process.exit(1);
  }

  const { getAuth } = await import("./index");
  const { connectToDatabase } = await import("@/lib/db/connect");
  const { User } = await import("@/lib/db/models");

  const auth = await getAuth();

  const result = await auth.api.signUpEmail({
    body: { email, password, name: email.split("@")[0] ?? "Admin" },
  });

  if (!result?.user) {
    console.error("\nCould not create the account. Does it already exist?\n");
    process.exit(1);
  }

  /* The role lives on the auth user (read by the session) AND on our own User
   * document (SRS DM-10, which carries the public profile). `input: false` on
   * the auth field means it can never be set from a client payload, so it is
   * written here directly. */
  const db = (await import("@/lib/db/connect")).getRawDb;
  const rawDb = await db();
  await rawDb.collection("user").updateOne(
    { id: result.user.id },
    { $set: { role } },
  );
  await rawDb.collection("user").updateOne(
    { _id: result.user.id as unknown as never },
    { $set: { role } },
  );

  await connectToDatabase();
  await User.findOneAndUpdate(
    { authId: result.user.id },
    { authId: result.user.id, email, name: result.user.name ?? email, role },
    { upsert: true, setDefaultsOnInsert: true },
  );

  console.log(`\n✓ ${role} account created for ${email}`);
  console.log("  Sign in at /admin/login\n");

  await mongoose.disconnect();
  process.exit(0);
}

void main();
