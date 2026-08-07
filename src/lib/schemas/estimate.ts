import { z } from "zod";

import {
  areaSchema,
  emailSchema,
  localitySchema,
  nameSchema,
  phoneSchema,
  projectTypeSchema,
  tierSchema,
} from "./common";

/* SRS §4.9 — AI Cost Estimator.
 *
 * FR-EST-02 is the load-bearing rule: "Estimate values are computed by a
 * DETERMINISTIC RATE ENGINE, NEVER BY AN LLM." CLAUDE.md repeats it. The LLM
 * only narrates figures that already exist (FR-EST-07, §7.3: "it receives the
 * COMPUTED figures as facts and is instructed to explain, never to calculate").
 *
 * These schemas describe the engine's inputs and outputs so that contract is
 * checkable rather than merely documented.
 */

export const estimatorInputSchema = z.object({
  projectType: projectTypeSchema,
  locality: localitySchema,
  city: z.string().trim().min(2).max(80),
  area: areaSchema,
  floors: z.number().int().min(1).max(20).default(1),
  tier: tierSchema,
  addons: z.array(z.string().max(60)).max(20).default([]),
  siteCondition: z.string().max(60).optional(),
});

export type EstimatorInput = z.infer<typeof estimatorInputSchema>;

const rangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
});

/* FR-EST-03 — "Output is a range with a most-likely value; A SINGLE POINT VALUE
 * MUST NEVER BE DISPLAYED ALONE." The schema refuses to describe one: min, max
 * and mostLikely are all required, and mostLikely is checked to sit inside the
 * range rather than being trusted. */
export const estimatorOutputSchema = z
  .object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
    mostLikely: z.number().nonnegative(),
    perSqft: z.number().nonnegative(),
    breakdown: z.object({
      structure: rangeSchema,
      finishes: rangeSchema,
      mep: rangeSchema,
      designPM: rangeSchema,
      contingency: rangeSchema,
    }),
    confidence: z.enum(["high", "medium", "low"]),
    comparableProjectCount: z.number().int().nonnegative(),
    /* FR-EST-04 — "Result displays inclusions and exclusions with EQUAL VISUAL
     * WEIGHT; the exclusions list CANNOT BE EMPTY." R-11 is why: per-sq-ft
     * rates cover structure, basic finishing and MEP only, and hiding that is
     * "why homeowners feel misled later". §0.8 ranks it our third-strongest
     * differentiator, so an empty array is a spec violation, not an edge case. */
    inclusions: z.array(z.string()).min(1),
    exclusions: z.array(z.string()).min(1, {
      message:
        "FR-EST-04: the exclusions list cannot be empty — it is the differentiator.",
    }),
    // FR-EST-12: out-of-bounds inputs still produce an estimate, flagged.
    outOfBounds: z.boolean().default(false),
    // FR-EST-13: unserved localities get a logistics note, recorded for
    // expansion analysis rather than refused.
    logisticsNote: z.string().optional(),
  })
  .refine((value) => value.min <= value.max, {
    message: "min must not exceed max",
    path: ["min"],
  })
  .refine(
    (value) => value.mostLikely >= value.min && value.mostLikely <= value.max,
    {
      message: "mostLikely must sit inside [min, max]",
      path: ["mostLikely"],
    },
  );

export type EstimatorOutput = z.infer<typeof estimatorOutputSchema>;

/* FR-EST-06 — every assumption used is displayed: rate-card version, regional
 * multiplier, tier, commodity rates. §0.8: "an honest estimator — publishing
 * exclusions AND assumptions alongside the range." */
export const estimateAssumptionsSchema = z.object({
  rateCardVersion: z.number().int(),
  regionalMultiplier: z.number().positive(),
  baseRate: rangeSchema,
  commodityRates: z.object({
    steelPerKg: z.number().nonnegative(),
    cementPerBag: z.number().nonnegative(),
    sandPerBrass: z.number().nonnegative(),
    bricksPerThousand: z.number().nonnegative(),
  }),
});

/* FR-EST-09 — the result can be emailed or WhatsApped AFTER name + one channel.
 * FR-EST-08 is absolute that this happens only once the number is on screen:
 * "The result is shown BEFORE any contact details are requested." §0.5 calls
 * gating the number "the most common and most damaging mistake in this
 * category — it converts a trust-building moment into a bait-and-switch." */
export const estimateSendSchema = z
  .object({
    estimateId: z.string().min(1),
    name: nameSchema,
    channel: z.enum(["email", "whatsapp"]),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
  })
  .refine(
    (value) =>
      value.channel === "email" ? Boolean(value.email) : Boolean(value.phone),
    { message: "Give us the channel you picked.", path: ["channel"] },
  );

/* FR-EST-11 — "Estimator state is encoded in the URL so a partial estimate is
 * resumable and shareable." Also how FR-HOME-05's mini-estimator hands off to
 * /estimate without re-entry. Kept as a flat, short, human-readable query
 * rather than an opaque blob, so a shared link is inspectable. */
export const estimatorUrlStateSchema = estimatorInputSchema
  .partial()
  .extend({ step: z.coerce.number().int().min(0).max(4).optional() });

export type EstimatorUrlState = z.infer<typeof estimatorUrlStateSchema>;
