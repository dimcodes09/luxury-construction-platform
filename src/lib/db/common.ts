import mongoose, { Schema, type Model } from "mongoose";

/* SRS §5 — "All collections carry createdAt, updatedAt, and deletedAt (soft
 * delete, indexed sparse)."
 *
 * NFR-SEC-14 / FR-ADM-23: soft delete with 30-day retention, a 10-second undo
 * toast, and hard deletion only after that window.
 */

export const SOFT_DELETE_RETENTION_DAYS = 30;

/** Shared sub-document for anything stored in Cloudinary (INT-04). */
export const cloudinaryAssetSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, required: true },
    bytes: { type: Number, required: true },
    // FR-ADM-12: publishing is blocked below 90% alt coverage, so alt text
    // lives on the asset rather than on whichever component happens to use it.
    alt: { type: String, default: "" },
    blurDataUrl: { type: String },
  },
  { _id: false },
);

export const seoSchema = new Schema(
  {
    // NFR-SEO-02: unique, HAND-WRITTEN title and description on every page.
    // No generated defaults — a templated description is worse than none.
    title: { type: String, required: true },
    description: { type: String, required: true },
    ogImage: cloudinaryAssetSchema,
    canonical: { type: String },
  },
  { _id: false },
);

/** Applied to every collection: timestamps plus the soft-delete field. */
export function withBaseFields(definition: Record<string, unknown>) {
  return {
    ...definition,
    deletedAt: { type: Date, default: null, index: { sparse: true } },
  };
}

export const baseSchemaOptions = {
  timestamps: true,
  // Reject writes containing fields the schema does not declare, rather than
  // silently dropping them.
  strict: "throw" as const,
  // NFR-SEC-10: keeps user input out of operator position.
  strictQuery: true,
};

/**
 * Mongoose caches compiled models on the module registry. In Next dev, HMR
 * re-evaluates modules and `mongoose.model()` throws OverwriteModelError on the
 * second pass, so every model is registered through this helper.
 */
export function defineModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (
    (mongoose.models[name] as Model<T> | undefined) ??
    mongoose.model<T>(name, schema)
  );
}

/* §1.3 "Precise" and §10.1 — Indian-English throughout. Budget bands are
 * stored as bands, not free numbers, so FR-PORT-01 filtering stays exact. */
export const BUDGET_BANDS = [
  "under-25L",
  "25-50L",
  "50L-1Cr",
  "1Cr+",
] as const;

export const PROJECT_TYPES = [
  "new-construction",
  "renovation",
  "interiors",
  "commercial",
  "single-service",
] as const;

export const SERVICE_GROUPS = [
  "build",
  "transform",
  "finish",
  "commercial",
] as const;

export const TIERS = ["Essential", "Signature", "Bespoke"] as const;

export const PUBLISH_STATUS = ["draft", "published"] as const;

/* SRS §3 — admin roles. There is no public account system: visitors are always
 * anonymous (shortlist is localStorage, estimator is anonymous). These roles
 * exist only behind /admin. */
export const USER_ROLES = ["owner", "manager", "editor"] as const;

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "visit-booked",
  "visit-done",
  "quoted",
  "won",
  "lost",
] as const;

export const GENERATION_STATUSES = [
  "queued",
  "moderating",
  "generating",
  "complete",
  "failed",
  "quota-exceeded",
] as const;
