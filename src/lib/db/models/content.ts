import { Schema, Types } from "mongoose";

import {
  PUBLISH_STATUS,
  TIERS,
  baseSchemaOptions,
  cloudinaryAssetSchema,
  defineModel,
  seoSchema,
  withBaseFields,
} from "../common";

/* SRS DM-07 · Testimonial, DM-08 · Article, DM-09 · Material, plus FAQ. */

/* R-02 / §3.13 — "A testimonial without a linked project or verifiable source
 * renders in a visually demoted style." DM-07 goes further: sourceUrl is
 * REQUIRED when verified is true. Enforced below, because a `verified` badge
 * with nothing behind it is the exact fabricated-testimonial pattern §0.2 bans.
 */
const testimonialSchema = new Schema(
  withBaseFields({
    clientName: { type: String, required: true },
    clientPhoto: cloudinaryAssetSchema,
    quote: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },

    project: { type: Types.ObjectId, ref: "Project", default: null },
    services: [{ type: Types.ObjectId, ref: "Service" }],
    locality: { type: String },

    date: { type: Date, required: true },
    source: {
      type: String,
      enum: ["google", "direct", "video"],
      required: true,
    },
    sourceUrl: {
      type: String,
      required: function (this: { verified?: boolean }) {
        return this.verified === true;
      },
    },
    verified: { type: Boolean, default: false },
    video: cloudinaryAssetSchema,

    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: PUBLISH_STATUS, default: "draft" },
  }),
  baseSchemaOptions,
);

testimonialSchema.index({ status: 1, featured: -1, order: 1 });
testimonialSchema.index({ project: 1 });
testimonialSchema.index({ services: 1 });

export type TestimonialDocument = { clientName: string; [key: string]: unknown };
export const Testimonial = defineModel<TestimonialDocument>(
  "Testimonial",
  testimonialSchema,
);

/* SRS DM-08 · Article.
 *
 * FR-JRN-02 restricts blocks to an APPROVED SET, and FR-ADM-16 restricts the
 * Tiptap editor to the same. §0.2's replacement for free-form page building is
 * a structured editor — FR-ADM-10 states "free-form page building is
 * prohibited". The enum below is what makes that enforceable at the data layer
 * rather than only in the UI.
 */
export const ARTICLE_BLOCK_TYPES = [
  "paragraph",
  "heading",
  "image",
  "pull-quote",
  "cost-table",
  "spec-callout",
  "warning-callout",
  "checklist",
  "before-after",
  "project-card",
  "estimator",
] as const;

const articleSchema = new Schema(
  withBaseFields({
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],

    author: { type: Types.ObjectId, ref: "User", required: true },
    // FR-JRN-04 — the optional technical reviewer. On a cost guide, "reviewed
    // by" is a stronger credibility signal than the byline.
    reviewedBy: { type: Types.ObjectId, ref: "User", default: null },

    heroImage: cloudinaryAssetSchema,
    blocks: [
      {
        _id: false,
        type: { type: String, enum: ARTICLE_BLOCK_TYPES, required: true },
        // Shape varies per block type; validated by the Zod discriminated
        // union in lib/schemas before it ever reaches here.
        data: { type: Schema.Types.Mixed, required: true },
      },
    ],

    readTimeMinutes: { type: Number, required: true },
    status: { type: String, enum: PUBLISH_STATUS, default: "draft" },
    publishedAt: { type: Date },
    // FR-ADM-16: scheduled publishing.
    scheduledFor: { type: Date, default: null },

    seo: { type: seoSchema, required: true },
    viewCount: { type: Number, default: 0 },
    relatedServices: [{ type: Types.ObjectId, ref: "Service" }],
  }),
  baseSchemaOptions,
);

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ scheduledFor: 1 }, { sparse: true });

export type ArticleDocument = { slug: string; title: string; [key: string]: unknown };
export const Article = defineModel<ArticleDocument>("Article", articleSchema);

/* SRS DM-09 · Material.
 *
 * §0.8 ranks the materials library sixth in defensibility, and §0.3 layer 2
 * makes macro material photography the cheapest high-quality asset we can
 * produce. FR-MAT-02 requires the lower-tier ALTERNATIVE with its trade-off —
 * publishing what you give up is the same honesty play as the exclusions list.
 */
const materialSchema = new Schema(
  withBaseFields({
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tier: { type: String, enum: TIERS, required: true },
    brand: { type: String, required: true },
    grade: { type: String, required: true },

    macroImage: { type: cloudinaryAssetSchema, required: true },
    // FR-MAT-03 / §7.4 3D-01 — PBR maps for the materials explorer.
    textureMaps: {
      albedo: cloudinaryAssetSchema,
      normal: cloudinaryAssetSchema,
      roughness: cloudinaryAssetSchema,
    },

    unitCost: { type: Number, required: true },
    unit: { type: String, required: true },
    rationale: { type: String, required: true },
    alternative: {
      name: { type: String },
      tradeoff: { type: String },
    },

    usedIn: [{ type: Types.ObjectId, ref: "Project" }],
    status: { type: String, enum: PUBLISH_STATUS, default: "draft" },
    order: { type: Number, default: 0 },
  }),
  baseSchemaOptions,
);

materialSchema.index({ status: 1, category: 1, order: 1 });

export type MaterialDocument = { slug: string; name: string; [key: string]: unknown };
export const Material = defineModel<MaterialDocument>("Material", materialSchema);

/* SRS DM-10 · FAQ. Feeds FAQPage structured data on /faq and every service
 * page (FR-FAQ-01, FR-SVC-08). */
const faqSchema = new Schema(
  withBaseFields({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true, index: true },
    services: [{ type: Types.ObjectId, ref: "Service" }],
    order: { type: Number, default: 0 },
    status: { type: String, enum: PUBLISH_STATUS, default: "draft" },
  }),
  baseSchemaOptions,
);

faqSchema.index({ status: 1, category: 1, order: 1 });
faqSchema.index({ services: 1 });

export type FAQDocument = { question: string; answer: string; [key: string]: unknown };
export const FAQ = defineModel<FAQDocument>("FAQ", faqSchema);
