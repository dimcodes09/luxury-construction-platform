import { Schema, Types } from "mongoose";

import {
  BUDGET_BANDS,
  PROJECT_TYPES,
  PUBLISH_STATUS,
  baseSchemaOptions,
  cloudinaryAssetSchema,
  defineModel,
  seoSchema,
  withBaseFields,
} from "../common";

/* SRS DM-01 · Project.
 *
 * FR-PROJ-01: the project page renders 13 sections, "each conditionally omitted
 * if its data is absent — the page must never show an empty section." Every
 * optional block below is therefore genuinely optional, and the page checks
 * length rather than assuming presence.
 */

const beforeAfterSchema = new Schema(
  {
    before: { type: cloudinaryAssetSchema, required: true },
    after: { type: cloudinaryAssetSchema, required: true },
    /* design.md §3.14 content rule: "every before/after pair carries a one-line
     * caption naming what changed and what it cost. A slider without cost
     * context is entertainment; with it, it's a sales tool." Required, not
     * optional — FR-PROJ-03 asks for scope, cost and duration captions. */
    caption: { type: String, required: true },
    scope: { type: String, required: true },
    cost: { type: Number, required: true },
    durationWeeks: { type: Number, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const behindTheWallSchema = new Schema(
  {
    asset: { type: cloudinaryAssetSchema, required: true },
    caption: { type: String, required: true },
    /* design.md §3.15 — real specifications, e.g. "2-coat polyurethane".
     * §0.8 ranks this the most defensible differentiator on the site; a set
     * without specs and dates is just more photography. */
    specification: { type: String, required: true },
    capturedAt: { type: Date, required: true },
    geo: {
      type: { lat: Number, lng: Number, label: String },
      required: false,
    },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const projectSchema = new Schema(
  withBaseFields({
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    type: { type: String, enum: PROJECT_TYPES, required: true },
    status: { type: String, enum: PUBLISH_STATUS, default: "draft" },
    featured: { type: Boolean, default: false },
    featureOrder: { type: Number, default: 0 },

    locality: { type: String, required: true, index: true },
    city: { type: String, required: true },
    state: { type: String, required: true },

    builtUpArea: { type: Number, required: true },
    plotArea: { type: Number },
    floors: { type: Number, default: 1 },
    budgetBand: { type: String, enum: BUDGET_BANDS, required: true },
    // Shown only where the client has permitted it — hence nullable, not absent.
    actualCostPerSqft: { type: Number, default: null },
    structuralSystem: { type: String },

    /* FR-PROJ-02 — "The fact table displays PLANNED VS ACTUAL duration side by
     * side." §0.7: this is the antidote to "they won't finish on time", and it
     * only works because we publish the unflattering case too (§3.12). */
    plannedDurationDays: { type: Number, required: true },
    actualDurationDays: { type: Number },
    startDate: { type: Date },
    completionDate: { type: Date, index: true },

    // Index declared once, below, via projectSchema.index({ services: 1 }).
    services: [{ type: Types.ObjectId, ref: "Service" }],
    styles: [{ type: String }],

    brief: {
      clientProblem: { type: String },
      ourApproach: { type: String },
    },

    heroImage: { type: cloudinaryAssetSchema, required: true },
    gallery: [
      {
        _id: false,
        asset: { type: cloudinaryAssetSchema, required: true },
        alt: { type: String, required: true },
        roomType: { type: String },
        caption: { type: String },
        order: { type: Number, default: 0 },
      },
    ],
    // §0.3 layer 3 — the technical drawing layer, our strongest differentiator
    // and free to produce from existing CAD.
    drawings: [
      {
        _id: false,
        asset: { type: cloudinaryAssetSchema, required: true },
        type: {
          type: String,
          enum: ["plan", "section", "elevation"],
          required: true,
        },
        floor: { type: Number },
        // FR-PROJ-10 (P2): interactive floor plan reveals room areas on hover.
        svgOverlay: { type: String },
      },
    ],
    beforeAfter: [beforeAfterSchema],
    behindTheWall: [behindTheWallSchema],
    timeline: [
      {
        _id: false,
        label: { type: String, required: true },
        date: { type: Date, required: true },
        asset: cloudinaryAssetSchema,
        note: { type: String },
      },
    ],
    materials: [{ type: Types.ObjectId, ref: "Material" }],
    testimonial: { type: Types.ObjectId, ref: "Testimonial", default: null },

    seo: { type: seoSchema, required: true },
    viewCount: { type: Number, default: 0 },
    shortlistCount: { type: Number, default: 0 },
  }),
  baseSchemaOptions,
);

/* SRS DM-01 indexes, exactly as specified. */
projectSchema.index({ status: 1, featured: -1, featureOrder: 1 }); // FR-HOME-04
projectSchema.index({ type: 1, locality: 1, budgetBand: 1 }); // FR-PORT-01 filters
projectSchema.index({ services: 1 }); // FR-SVC-07 related-by-service
projectSchema.index({ completionDate: -1 });

export type ProjectDocument = {
  slug: string;
  title: string;
  status: (typeof PUBLISH_STATUS)[number];
  [key: string]: unknown;
};

export const Project = defineModel<ProjectDocument>("Project", projectSchema);
