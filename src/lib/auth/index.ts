import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { twoFactor } from "better-auth/plugins";

import { getRawDb } from "@/lib/db/connect";
import { ROLES, type Role } from "./permissions";

/* SRS §2.2 / §3 — Better Auth, ADMIN ONLY.
 *
 * There is no public sign-up and no visitor login anywhere on this site. §3
 * lists exactly one unauthenticated actor (Visitor, "None. Device-local
 * shortlist via localStorage") and one cookie-recognised actor (Identified
 * visitor, explicitly "no login"). Every account here is a back-office account
 * created by invitation.
 *
 * NFR-SEC-06: sessions expire after 7 days idle; 2FA (TOTP) is MANDATORY for
 * Owner and optional for others.
 * NFR-SEC-05: auth is rate-limited at 5 attempts / 15 min / IP with
 * exponential backoff.
 */

const db = await getRawDb();

export const auth = betterAuth({
  database: mongodbAdapter(db),

  // Admin accounts are created by invitation (FR-ADM-22, Owner only).
  // Open registration would be a public login surface, which this site
  // deliberately does not have.
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    requireEmailVerification: true,
  },

  session: {
    // NFR-SEC-06 — 7 days idle.
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  user: {
    additionalFields: {
      /* The §3 role. Stored on the auth user so a session carries it without a
       * second query, but NEVER trusted from the client — every Server Action
       * re-reads the session server-side and re-checks (NFR-SEC-11). */
      role: {
        type: "string",
        required: true,
        defaultValue: "editor" satisfies Role,
        input: false, // cannot be set through any client-supplied payload
      },
    },
  },

  plugins: [
    // NFR-SEC-06 — TOTP. Mandatory for Owner; enforcement of "mandatory" lives
    // in the admin guard, since Better Auth cannot express per-role required 2FA.
    twoFactor({ issuer: "ZYVORA Admin" }),
  ],

  advanced: {
    cookiePrefix: "zyvora",
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
    },
  },

  // NFR-SEC-05
  rateLimit: {
    enabled: true,
    window: 15 * 60,
    max: 5,
  },

  trustedOrigins: process.env.NEXT_PUBLIC_SITE_URL
    ? [process.env.NEXT_PUBLIC_SITE_URL]
    : [],
});

export type Session = typeof auth.$Infer.Session;

/** Narrow an unknown role string off a session to the §3 union. */
export function toRole(value: unknown): Role | undefined {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
    ? (value as Role)
    : undefined;
}
