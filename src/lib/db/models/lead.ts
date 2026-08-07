import { Schema, Types } from "mongoose";

import {
  BUDGET_BANDS,
  LEAD_STATUSES,
  PROJECT_TYPES,
  TIERS,
  baseSchemaOptions,
  defineModel,
  withBaseFields,
} from "../common";

/* SRS DM-03 · Lead. The most commercially important collection on the site.
 *
 * FR-LEAD-09 requires every lead to be enriched with the full visitor journey:
 * source page, referrer, UTMs, device, all pages viewed, estimates run,
 * projects shortlisted, generations created. That is not analytics vanity —
 * FR-ADM-05 surfaces it in the lead drawer so whoever picks up the phone knows
 * what the person has already looked at, which is the difference between a cold
 * call and a useful one.
 *
 * §0.5: contact details are captured at rung 4 or 5, always AFTER value has
 * been delivered. Nothing here is ever collected up front.
 */

const leadSchema = new Schema(
  withBaseFields({
    name: { type: String, required: true },
    /* §3.3 form rule 6: "Phone is the primary channel, email secondary. In this
     * market WhatsApp beats email." Hence phone required, email optional. */
    // Index declared once, below, via leadSchema.index({ phone: 1 }).
    phone: { type: String, required: true },
    whatsappOptIn: { type: Boolean, default: true },
    email: { type: String },

    projectType: { type: String, enum: PROJECT_TYPES, required: true },
    locality: { type: String, required: true },
    area: { type: Number },
    timeline: { type: String, required: true },
    // FR-LEAD-03: "not sure yet" is a first-class option, not a missing value.
    budgetBand: { type: String, enum: [...BUDGET_BANDS, "not-sure"], required: true },
    message: { type: String },

    /* Set by the /estimate enquiry form. The site no longer computes a figure
     * — the owner reviews the brief in admin and quotes manually — so the tier
     * and site condition the visitor selected are the estimating inputs that
     * have to survive into the back office. */
    tier: { type: String, enum: [...TIERS, null], default: null },
    siteCondition: { type: String, default: null },
    floors: { type: Number, default: null },
    addons: [{ type: String }],

    source: {
      page: { type: String, required: true },
      referrer: { type: String },
      utm: {
        source: String,
        medium: String,
        campaign: String,
        term: String,
        content: String,
      },
      device: { type: String },
      browser: { type: String },
    },

    journey: {
      sessionId: { type: String, index: true },
      pagesViewed: [
        {
          _id: false,
          path: { type: String, required: true },
          at: { type: Date, required: true },
          dwellMs: { type: Number },
        },
      ],
      estimateIds: [{ type: Types.ObjectId, ref: "Estimate" }],
      shortlistItems: [
        {
          _id: false,
          type: { type: String, enum: ["project", "image"], required: true },
          ref: { type: String, required: true },
        },
      ],
      generationIds: [{ type: Types.ObjectId, ref: "Generation" }],
      firstSeenAt: { type: Date },
      totalSessions: { type: Number, default: 1 },
    },

    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    /* FR-ADM-07 — "a mandatory reason on Lost". Enforced at the schema level so
     * an admin action cannot skip it: without the reason the pipeline data is
     * useless for the Phase 13 lead-quality review. */
    lostReason: {
      type: String,
      required: function (this: { status?: string }) {
        return this.status === "lost";
      },
    },

    assignedTo: { type: Types.ObjectId, ref: "User" },
    // FR-ADM-08: notes are APPEND-ONLY. Enforced in the action layer; the
    // schema keeps author and timestamp so an edit would be visible.
    notes: [
      {
        _id: false,
        body: { type: String, required: true },
        author: { type: Types.ObjectId, ref: "User", required: true },
        at: { type: Date, required: true },
      },
    ],
    statusHistory: [
      {
        _id: false,
        from: { type: String },
        to: { type: String, required: true },
        by: { type: Types.ObjectId, ref: "User" },
        at: { type: Date, required: true },
      },
    ],

    /* Powers the median-response metric. §0.8 / §11 risk 7: publishing our own
     * median response time creates internal accountability, which is the point
     * — the number is only credible because it is measured, not asserted. */
    firstResponseAt: { type: Date },
    siteVisitAt: { type: Date },

    isCommercial: { type: Boolean, default: false },
    // FR-LEAD-12: honeypot + time-to-complete + server-side rate limit.
    // Explicitly NO CAPTCHA — it measurably reduces genuine submissions and
    // this audience is not technical.
    spamScore: { type: Number, default: 0 },
  }),
  baseSchemaOptions,
);

/* SRS DM-03 indexes, exactly as specified. */
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1, createdAt: -1 }); // FR-ADM-04 saved views
leadSchema.index({ phone: 1 }); // FR-LEAD-15 duplicate detection within 24h
leadSchema.index({ assignedTo: 1, status: 1 });

export type LeadDocument = {
  name: string;
  phone: string;
  status: (typeof LEAD_STATUSES)[number];
  [key: string]: unknown;
};

export const Lead = defineModel<LeadDocument>("Lead", leadSchema);
