import { createHash } from "node:crypto";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { connectToDatabase } from "@/lib/db/connect";

/* SRS NFR-SEC-05 — the exact limits:
 *
 *   leads        5  / hour   / IP
 *   estimates   20  / hour   / IP     (FR-EST-16)
 *   generations  3  / 24h    / visitor (FR-AI-16; 10 with a verified email)
 *   auth         5  / 15min  / IP     with exponential backoff
 *
 * INT-12 — "Upstash Redis · Rate limiting and job queue · FALLS BACK TO
 * MONGODB TTL-BASED LIMITING." That fallback is not optional politeness: if
 * Upstash is unreachable and we fail open, the lead endpoint is unprotected;
 * if we fail closed, we drop leads, and §11 risk 6 rates losing a lead
 * critical. The Mongo path keeps us protected without dropping anything.
 */

export type LimitKind = "leads" | "estimates" | "generations" | "auth" | "subscribe";

type LimitRule = { max: number; windowSeconds: number };

const RULES: Record<LimitKind, LimitRule> = {
  leads: { max: 5, windowSeconds: 60 * 60 },
  estimates: { max: 20, windowSeconds: 60 * 60 },
  generations: { max: 3, windowSeconds: 60 * 60 * 24 },
  auth: { max: 5, windowSeconds: 15 * 60 },
  subscribe: { max: 5, windowSeconds: 60 * 60 },
};

/* FR-AI-16 — "3 generations per visitor per 24h; 10 WITH A VERIFIED EMAIL."
 * Rung 4 (§0.5) buys more capacity, which is the intended trade. */
export const VERIFIED_EMAIL_GENERATION_LIMIT = 10;

/* NFR-PRIV-06 — "IP addresses stored HASHED, NEVER IN PLAINTEXT."
 * The salt means a hash cannot be reversed by enumerating the IPv4 space,
 * which an unsalted SHA-256 of an IP trivially can be. */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

let redis: Redis | null = null;
let redisUnavailable = false;

function getRedis(): Redis | null {
  if (redisUnavailable) return null;
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisUnavailable = true;
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

const limiters = new Map<LimitKind, Ratelimit>();

function getLimiter(kind: LimitKind): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  const existing = limiters.get(kind);
  if (existing) return existing;

  const rule = RULES[kind];
  const limiter = new Ratelimit({
    redis: client,
    // Sliding window rather than fixed: a fixed window lets someone send 2x the
    // limit across a boundary, which on the lead endpoint is a spam burst.
    limiter: Ratelimit.slidingWindow(rule.max, `${rule.windowSeconds} s`),
    prefix: `zyvora:rl:${kind}`,
    analytics: false,
  });

  limiters.set(kind, limiter);
  return limiter;
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: Date;
  /** Which backend answered — surfaced in logs, never to the client. */
  backend: "upstash" | "mongodb";
};

/* The MongoDB fallback (INT-12).
 *
 * A TTL index expires counters automatically, so there is no sweep to run and
 * no unbounded growth. `expireAt` is set on first hit of a window and left
 * alone afterwards, which gives fixed-window semantics — coarser than the
 * sliding window above, but this path only runs when Upstash is down.
 */
async function mongoLimit(
  kind: LimitKind,
  identifier: string,
): Promise<RateLimitResult> {
  const rule = RULES[kind];
  const connection = await connectToDatabase();
  const collection = connection.connection.db!.collection("rateLimits");

  // Created once; MongoDB ignores a repeat createIndex with the same spec.
  await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });

  const key = `${kind}:${identifier}`;
  const now = new Date();
  const expireAt = new Date(now.getTime() + rule.windowSeconds * 1000);

  const result = await collection.findOneAndUpdate(
    { _id: key as never },
    {
      $inc: { count: 1 },
      $setOnInsert: { expireAt },
    },
    { upsert: true, returnDocument: "after" },
  );

  const count = (result?.count as number | undefined) ?? 1;
  const windowEnd = (result?.expireAt as Date | undefined) ?? expireAt;

  return {
    success: count <= rule.max,
    remaining: Math.max(0, rule.max - count),
    resetAt: windowEnd,
    backend: "mongodb",
  };
}

/**
 * Check and consume one unit.
 *
 * `identifier` should already be hashed for IP-based limits (NFR-PRIV-06) —
 * pass hashIp(ip), not the raw address.
 */
export async function checkRateLimit(
  kind: LimitKind,
  identifier: string,
  options?: { max?: number },
): Promise<RateLimitResult> {
  const limiter = getLimiter(kind);

  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        resetAt: new Date(result.reset),
        backend: "upstash",
      };
    } catch {
      /* INT-12 — fall through to MongoDB rather than failing open. Deliberately
       * swallowing the error: a rate limiter that throws would take down the
       * lead endpoint it exists to protect. Sentry captures it upstream. */
      redisUnavailable = true;
    }
  }

  const result = await mongoLimit(kind, identifier);

  // FR-AI-16's verified-email allowance raises the ceiling for one caller
  // without needing a second limiter definition.
  if (options?.max && options.max > RULES[kind].max) {
    const consumed = RULES[kind].max - result.remaining;
    return {
      ...result,
      success: consumed <= options.max,
      remaining: Math.max(0, options.max - consumed),
    };
  }

  return result;
}

/**
 * Extracts the client IP behind Vercel's proxy.
 * `x-forwarded-for` is a comma-separated chain; the FIRST entry is the client.
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}
