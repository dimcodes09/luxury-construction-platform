import { Schema, Types } from "mongoose";

import {
  GENERATION_STATUSES,
  baseSchemaOptions,
  cloudinaryAssetSchema,
  defineModel,
  withBaseFields,
} from "../common";

/* SRS DM-05 · Generation — one AI room-redesign job.
 *
 * Two privacy requirements are structural here rather than procedural:
 *
 *  - NFR-PRIV-03 / FR-AI-19: uploads are deleted after 30 days unless flagged
 *    `showcase`. `sourceImageDeleteAt` carries a MongoDB TTL index so expiry
 *    happens even if the cron job (FR-AI-19) fails. Two independent mechanisms,
 *    because we state the 30 days at the point of upload (§10.2) and breaking
 *    that promise is worse than losing the feature.
 *
 *  - NFR-PRIV-04: explicit consent that uploads are NOT used for training.
 *    Recorded per generation, not once per session, so consent is provable
 *    against the specific image.
 *
 * FR-AI-20 requires provider, model, latency and cost on every generation, so
 * FR-ADM-18 can compare quality per provider — the whole reason the §7.1
 * provider chain exists is that free tiers move without notice.
 */

const generationSchema = new Schema(
  withBaseFields({
    sessionId: { type: String, required: true, index: true },

    sourceImage: { type: cloudinaryAssetSchema, required: true },
    sourceImageDeleteAt: { type: Date, required: true },

    roomType: { type: String, required: true },
    style: { type: String, required: true },
    // FR-AI-05: sanitised and length-capped at 200 characters.
    freeText: { type: String, maxlength: 200 },

    /* §7.2 — the EXACT prompt sent. "Prompt templates are versioned and stored
     * so any past generation is reproducible and prompt changes can be A/B
     * evaluated." The user's free text only ever enters a constrained slot,
     * never as raw instruction. */
    prompt: { type: String, required: true },
    promptTemplateVersion: { type: Number, required: true },

    provider: { type: String, required: true },
    model: { type: String, required: true },

    status: {
      type: String,
      enum: GENERATION_STATUSES,
      default: "queued",
      index: true,
    },
    variants: [
      {
        _id: false,
        asset: { type: cloudinaryAssetSchema, required: true },
        order: { type: Number, default: 0 },
      },
    ],

    latencyMs: { type: Number },
    // FR-AI / §7.5: recorded EVEN WHEN ZERO, so a future migration to a paid
    // tier has a baseline to reason from.
    costPaise: { type: Number, default: 0 },

    // INT-03 / FR-AI-13: moderation runs before generation; rejections use
    // neutral language and never expose the category to the visitor.
    moderationResult: {
      passed: { type: Boolean },
      reason: { type: String },
    },
    // FR-AI-14: faces blurred before generation.
    facesBlurred: { type: Boolean, default: false },
    // NFR-PRIV-04
    consentedAt: { type: Date, required: true },

    qualityFlag: { type: String, enum: ["good", "poor", null], default: null },
    // FR-AI-19: exempts this generation from TTL deletion.
    showcase: { type: Boolean, default: false },

    errorCode: { type: String },
    leadId: { type: Types.ObjectId, ref: "Lead" },

    // NFR-PRIV-06 — hashed, never plaintext. FR-AI-16 enforces quota by
    // IP + fingerprint server-side.
    ipHash: { type: String, required: true },
    fingerprint: { type: String, required: true, index: true },
  }),
  baseSchemaOptions,
);

/* The TTL index. MongoDB expires the document when sourceImageDeleteAt passes;
 * `showcase` documents get the field cleared instead of a far-future date, so
 * they simply fall out of the index. */
generationSchema.index({ sourceImageDeleteAt: 1 }, { expireAfterSeconds: 0 });
generationSchema.index({ createdAt: -1 });
generationSchema.index({ fingerprint: 1, createdAt: -1 }); // FR-AI-16 quota

export type GenerationDocument = { sessionId: string; [key: string]: unknown };
export const Generation = defineModel<GenerationDocument>(
  "Generation",
  generationSchema,
);
