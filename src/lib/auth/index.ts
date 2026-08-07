import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { getRawDb } from "@/lib/db/connect";
import { ROLES, type Role } from "./permissions";

/* SRS §2.2 / §3 — Better Auth, ADMIN ONLY.
 *
 * There is no public sign-up and no visitor login anywhere on this site. §3
 * lists exactly one unauthenticated actor (Visitor, "device-local shortlist via
 * localStorage") and one cookie-recognised actor, explicitly "no login". Every
 * account here is a back-office account created by the invite script.
 *
 * The instance is built LAZILY. Building it at module scope needs a top-level
 * await for the Mongo handle, which forces a database connection during the
 * build's module-evaluation pass — pages that never touch auth would fail to
 * prerender when the database is unreachable.
 */

let instance: Awaited<ReturnType<typeof create>> | null = null;

async function create() {
  const db = await getRawDb();

  return betterAuth({
    database: mongodbAdapter(db),

    /* Admin accounts are created by the invite script (FR-ADM-22, Owner only).
     * Open registration would be a public login surface, which this site
     * deliberately does not have. */
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 12,
      requireEmailVerification: false,
    },

    session: {
      // NFR-SEC-06 — 7 days idle.
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },

    user: {
      additionalFields: {
        /* The §3 role. Never accepted from a client payload — `input: false` —
         * and re-checked server-side on every action (NFR-SEC-11). */
        role: {
          type: "string",
          required: false,
          defaultValue: "editor" satisfies Role,
          input: false,
        },
      },
    },

    advanced: {
      cookiePrefix: "zyvora",
      useSecureCookies: process.env.NODE_ENV === "production",
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
    },

    // NFR-SEC-05 — 5 attempts / 15 min / IP.
    rateLimit: { enabled: true, window: 15 * 60, max: 5 },

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  });
}

export async function getAuth() {
  if (!instance) instance = await create();
  return instance;
}

/** Narrow an unknown role string off a session to the §3 union. */
export function toRole(value: unknown): Role | undefined {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
    ? (value as Role)
    : undefined;
}
