import { Schema, Types } from "mongoose";

import {
  PROJECT_TYPES,
  TIERS,
  baseSchemaOptions,
  defineModel,
  withBaseFields,
} from "../common";

/* SRS DM-04 · Estimate and DM-06 · RateCard. */

const rangeSchema = new Schema(
  { min: { type: Number, required: true }, max: { type: Number, required: true } },
  { _id: false },
);

const estimateSchema = new Schema(
  withBaseFields({
    sessionId: { type: String, required: true, index: true },

    inputs: {
      projectType: { type: String, enum: PROJECT_TYPES, required: true },
      locality: { type: String, required: true },
      city: { type: String, required: true },
      area: { type: Number, required: true },
      floors: { type: Number, default: 1 },
      tier: { type: String, enum: TIERS, required: true },
      addons: [{ type: String }],
    },

    outputs: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      mostLikely: { type: Number, required: true },
      perSqft: { type: Number, required: true },
      breakdown: {
        structure: rangeSchema,
        finishes: rangeSchema,
        mep: rangeSchema,
        designPM: rangeSchema,
        contingency: rangeSchema,
      },
      // FR-EST-14: derived from the count of comparable completed projects,
      // not asserted.
      confidence: {
        type: String,
        enum: ["high", "medium", "low"],
        required: true,
      },
      comparableProjectCount: { type: Number, default: 0 },
    },

    /* FR-EST-06 / §4.9.1 — "Historical estimates store their rateCardVersion so
     * any past estimate is exactly reproducible — REQUIRED FOR DISPUTE
     * DEFENCE." That is why assumptions are denormalised onto the estimate
     * rather than joined from the rate card at read time: the rate card will
     * change, and the estimate we gave someone must not. */
    assumptions: {
      rateCardVersion: { type: Number, required: true },
      regionalMultiplier: { type: Number, required: true },
      baseRate: { type: rangeSchema, required: true },
      commodityRates: {
        steelPerKg: Number,
        cementPerBag: Number,
        sandPerBrass: Number,
        bricksPerThousand: Number,
      },
    },

    /* FR-EST-07: an LLM writes a plain-language explanation of what drives the
     * number. FR-EST-02 is absolute that it never CALCULATES anything — the
     * figures come from the deterministic engine. Nullable, because
     * "if narration fails, the estimate renders without it". */
    narration: { type: String, default: null },

    // FR-EST-10: abandoned runs are persisted too, with the step reached, so
    // FR-ADM-19 can show abandonment-by-step.
    completed: { type: Boolean, default: false },
    abandonedAtStep: { type: Number, default: null },

    contactCaptured: { type: Boolean, default: false },
    leadId: { type: Types.ObjectId, ref: "Lead" },
    sentVia: [{ type: String, enum: ["email", "whatsapp"] }],

    // NFR-PRIV-06: IP addresses are stored HASHED, never in plaintext.
    ipHash: { type: String, required: true },
    userAgent: { type: String },
  }),
  baseSchemaOptions,
);

estimateSchema.index({ createdAt: -1 });
estimateSchema.index({ completed: 1, abandonedAtStep: 1 });
estimateSchema.index({ leadId: 1 });

export type EstimateDocument = { sessionId: string; [key: string]: unknown };
export const Estimate = defineModel<EstimateDocument>("Estimate", estimateSchema);

/* SRS DM-06 · RateCard.
 *
 * §4.9.1 constraint: "Splits must sum to 1.00; validated on rate-card save."
 * FR-ADM-20 surfaces that validation in the editor. Getting this wrong silently
 * skews every breakdown on every estimate, so it is validated here at the
 * schema boundary rather than only in the form.
 */

const splitsSchema = new Schema(
  {
    structure: { type: Number, required: true },
    finishes: { type: Number, required: true },
    mep: { type: Number, required: true },
    designPM: { type: Number, required: true },
    contingency: { type: Number, required: true },
  },
  { _id: false },
);

const rateCardSchema = new Schema(
  withBaseFields({
    version: { type: Number, required: true, unique: true },
    effectiveFrom: { type: Date, required: true },
    active: { type: Boolean, default: false, index: true },

    // { [projectType]: { [tier]: {min, max} } } in ₹/sq ft.
    rates: { type: Schema.Types.Mixed, required: true },
    localityMultipliers: { type: Schema.Types.Mixed, default: {} },
    siteFactors: { type: Schema.Types.Mixed, default: {} },

    addons: [
      {
        _id: false,
        key: { type: String, required: true },
        label: { type: String, required: true },
        unit: { type: String, required: true },
        // §4.9.1: addons are ABSOLUTE ₹, not per sq ft.
        costPerUnit: { type: Number, required: true },
      },
    ],

    splits: { type: splitsSchema, required: true },
    commodityRates: {
      steelPerKg: { type: Number, required: true },
      cementPerBag: { type: Number, required: true },
      sandPerBrass: { type: Number, required: true },
      bricksPerThousand: { type: Number, required: true },
    },
    // §4.9.1: mostLikely = min + (max - min) * likelyBias. 0.5 default.
    likelyBias: { type: Number, default: 0.5, min: 0, max: 1 },
    createdBy: { type: Types.ObjectId, ref: "User" },
  }),
  baseSchemaOptions,
);

rateCardSchema.pre("validate", function (next) {
  const splits = this.get("splits") as Record<string, number> | undefined;
  if (!splits) return next();

  const total = Object.values(splits).reduce((sum, value) => sum + value, 0);
  // Floating point: 0.37 + 0.33 + 0.15 + 0.08 + 0.07 does not land exactly on 1.
  if (Math.abs(total - 1) > 1e-6) {
    return next(
      new Error(
        `SRS §4.9.1: rate-card splits must sum to 1.00, got ${total.toFixed(4)}.`,
      ),
    );
  }
  return next();
});

rateCardSchema.index({ effectiveFrom: -1 });

export type RateCardDocument = { version: number; [key: string]: unknown };
export const RateCard = defineModel<RateCardDocument>("RateCard", rateCardSchema);
