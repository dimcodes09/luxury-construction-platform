import { z } from "zod";

/* SRS §2.2 — "Zod 3.x · Single schema shared client + server."
 * §6 conventions — "all inputs validated with Zod on the server REGARDLESS of
 * client validation."
 *
 * These files are the single source. They are imported by React Hook Form on
 * the client and by every Route Handler and Server Action on the server, so a
 * rule cannot drift between the two. Nothing here may import a Node-only
 * module, or it stops being shareable.
 */

export const projectTypeSchema = z.enum([
  "new-construction",
  "renovation",
  "interiors",
  "commercial",
  "single-service",
  "house-construction",
  "turnkey-home-solutions",
  "home-renovation",
  "interior-design",
  "modular-kitchen",
  "waterproofing",
  "painting",
  "electrical-work",
  "false-ceiling",
]);

export const tierSchema = z.enum([
  "Essential",
  "Signature",
  "Bespoke",
  "essential",
  "signature",
  "bespoke",
]);

export const budgetBandSchema = z.enum([
  "under-25L",
  "25-50L",
  "50L-1Cr",
  "1Cr+",
]);

/* FR-LEAD-03 — "Budget step includes a 'not sure yet' option."
 * §0.4: the site does not ask budget at the door. Forcing a band on someone who
 * genuinely does not know produces a wrong number and a worse conversation. */
export const budgetBandWithUnsureSchema = z.union([
  budgetBandSchema,
  z.literal("not-sure"),
]);

/* Indian mobile numbers: 10 digits starting 6–9, with optional +91 / 0 prefix
 * and any spacing the user naturally types. §3.3: never reject a number a
 * person would actually write down — normalise it instead. */
const PHONE_PATTERN = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .refine((value) => PHONE_PATTERN.test(value), {
    message: "Enter a 10-digit Indian mobile number.",
  })
  .transform((value) => {
    const digits = value.replace(/^\+?91/, "").replace(/^0/, "");
    // Stored E.164 (FR-GBL-06 uses tel: links with the E.164 number).
    return `+91${digits}`;
  });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("That doesn't look like an email address.");

/* §3.3: "Placeholder gives an example, never repeats the label" — and the
 * numeric bounds below match the estimator's supported range. FR-EST-12:
 * inputs outside these bounds STILL PRODUCE AN ESTIMATE, flagged low
 * confidence, so these are validation floors, not refusals. */
export const areaSchema = z
  .number({ invalid_type_error: "Enter the built-up area in sq ft." })
  .int()
  .min(100, "That looks too small — enter the built-up area in sq ft.")
  .max(100000, "That looks too large — enter the built-up area in sq ft.");

export const localitySchema = z
  .string()
  .trim()
  .min(2, "Enter your locality.")
  .max(80);

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Enter your name.")
  .max(80);

/* NFR-SEC-04 — all output escaped, rich text sanitised on save AND on render.
 * For plain free-text fields this strips control characters and caps length so
 * a paste bomb cannot reach the database. */
export const freeTextSchema = (max: number) =>
  z
    .string()
    .trim()
    .transform((value) =>
      Array.from(value)
        .filter((char) => {
          const code = char.codePointAt(0) ?? 0;
          // Keep tab, newline and carriage return: a project brief typed into
          // a textarea legitimately contains line breaks, and stripping them
          // would silently mangle what the visitor actually wrote.
          if (code === 9 || code === 10 || code === 13) return true;
          // Strip C0 (0-31), DEL (127) and C1 (128-159).
          return !(code < 32 || code === 127 || (code >= 128 && code <= 159));
        })
        .join(""),
    )
    .pipe(z.string().max(max));

/* FR-LEAD-12 — spam protection is a honeypot plus a time-to-complete check,
 * NOT a CAPTCHA: "it measurably reduces genuine submissions and this audience
 * is not technical."
 *
 * The honeypot must be EMPTY (a bot fills every field) and the form must have
 * taken at least a few seconds (a human cannot complete a 4-step form in two).
 */
export const spamGuardSchema = z.object({
  // Rendered off-screen with autocomplete="off" and aria-hidden.
  website: z.literal("").optional(),
  startedAt: z.number().int().positive(),
});

export function isLikelySpam(guard: {
  website?: string;
  startedAt: number;
}): boolean {
  if (guard.website) return true;
  const elapsedMs = Date.now() - guard.startedAt;
  // Under 3s is not a human filling a multi-step form; over 6h is a stale tab
  // being replayed.
  return elapsedMs < 3000 || elapsedMs > 6 * 60 * 60 * 1000;
}

/* §10.6 — the analytics event taxonomy. `rung` is "the analytical spine": it
 * lets us measure the §0.5 commitment ladder directly and see where the funnel
 * leaks. Typed here so an event cannot be emitted without it. */
export const ctaRungSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export type ProjectType = z.infer<typeof projectTypeSchema>;
export type Tier = z.infer<typeof tierSchema>;
export type BudgetBand = z.infer<typeof budgetBandSchema>;
export type CtaRung = z.infer<typeof ctaRungSchema>;
