import { Schema, Types } from "mongoose";

import {
  PUBLISH_STATUS,
  SERVICE_GROUPS,
  TIERS,
  baseSchemaOptions,
  defineModel,
  seoSchema,
  withBaseFields,
} from "../common";

/* SRS DM-02 · Service.
 *
 * Two validators here enforce rules the spec states as hard requirements
 * rather than preferences, because both are load-bearing for the positioning:
 *
 *  - `excluded` MUST be non-empty (FR-SVC-03, DM-02 comment). §R-11: per-sq-ft
 *    rates normally cover structure, basic finishing and MEP only. "Most
 *    competitor calculators hide this, which is why homeowners feel misled
 *    later." §0.8 ranks honesty about exclusions our third-strongest
 *    differentiator. An empty exclusions list silently reverts us to the
 *    competitor behaviour.
 *
 *  - each tier carries EXACTLY 5 specifications (FR-SVC-04). Uneven tiers make
 *    a comparison table unreadable, which is the one job it has.
 */

const tierSchema = new Schema(
  {
    name: { type: String, enum: TIERS, required: true },
    audience: { type: String, required: true },
    specifications: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length === 5,
        message:
          "FR-SVC-04: each tier needs exactly 5 named specifications, got {VALUE}.",
      },
    },
    // FR-SVC-05: resolves against the active rate card, so a rate-card change
    // updates every service page without a deploy.
    rateKey: { type: String, required: true },
    recommended: { type: Boolean, default: false },
  },
  { _id: false },
);

const serviceSchema = new Schema(
  withBaseFields({
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    // design.md §3.9 — 9 services collapse into 3 INTENT groups, because
    // visitors arrive with an intent, not a service name.
    group: { type: String, enum: SERVICE_GROUPS, required: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: PUBLISH_STATUS, default: "draft" },

    headline: { type: String, required: true },
    definition: { type: String, required: true },
    icon: { type: String, required: true },

    // "Is this you?" — §0.6 maps each segment to the question that decides it.
    scenarios: [
      {
        _id: false,
        title: { type: String, required: true },
        body: { type: String, required: true },
      },
    ],

    included: { type: [String], default: [] },
    excluded: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message:
          "FR-SVC-03: the excluded-scope list cannot be empty. Publishing exclusions is the differentiator (design.md §0.8).",
      },
    },

    tiers: { type: [tierSchema], required: true },

    /* FR-SVC-06 / R-06 — the loss-framed panel. "People are more motivated to
     * avoid losses than to achieve gains. Framing price around what the client
     * AVOIDS makes higher rates feel justified." rupeeImpact is what turns it
     * from a claim into a number (§1.4: numbers over adjectives). */
    avoidancePanel: [
      {
        _id: false,
        title: { type: String, required: true },
        consequence: { type: String, required: true },
        rupeeImpact: { type: Number, required: true },
      },
    ],

    process: [
      {
        _id: false,
        step: { type: Number, required: true },
        title: { type: String, required: true },
        body: { type: String, required: true },
        durationDays: { type: Number, required: true },
        paymentPoint: { type: Boolean, default: false },
      },
    ],

    faqs: [{ type: Types.ObjectId, ref: "FAQ" }],
    seo: { type: seoSchema, required: true },
  }),
  baseSchemaOptions,
);

serviceSchema.index({ status: 1, group: 1, order: 1 });

export type ServiceDocument = {
  slug: string;
  name: string;
  group: (typeof SERVICE_GROUPS)[number];
  [key: string]: unknown;
};

export const Service = defineModel<ServiceDocument>("Service", serviceSchema);
