import { Schema, Types } from "mongoose";

import {
  PUBLISH_STATUS,
  USER_ROLES,
  baseSchemaOptions,
  cloudinaryAssetSchema,
  defineModel,
  withBaseFields,
} from "../common";

/* SRS DM-10 · User, Locality, SiteSettings, AuditLog, Subscriber. */

/* User — ADMIN ONLY.
 *
 * SRS §3: visitors are anonymous and have no account. The shortlist is
 * device-local (FR-GBL-07) and the estimator is anonymous. This collection
 * exists solely for the three back-office roles.
 *
 * Better Auth owns credentials, sessions and 2FA in its own collections; this
 * document holds the ZYVORA-specific profile that the public About page and
 * the §3 permission matrix need. `role` lives here and is re-checked
 * server-side on every action (NFR-SEC-11: never trust the client).
 */
const userSchema = new Schema(
  withBaseFields({
    // Links to the Better Auth user record.
    authId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true, index: true },

    // §0.7 antidote to "they'll vanish mid-project": the About page publishes
    // faces and tenure, which come from here.
    phone: { type: String },
    photo: cloudinaryAssetSchema,
    bio: { type: String },
    tenureFrom: { type: Number },
    publicProfile: { type: Boolean, default: false },
  }),
  baseSchemaOptions,
);

export type UserDocument = {
  authId: string;
  email: string;
  role: (typeof USER_ROLES)[number];
  [key: string]: unknown;
};
export const User = defineModel<UserDocument>("User", userSchema);

/* Locality.
 *
 * §NFR-SEO-10 and §11 risk 9: locality pages are only safe if each carries
 * genuinely locality-specific content. `notes`, `soilType` and
 * `commonTypologies` are what make a page non-templated — without them it is a
 * doorway page and gets treated as one.
 */
const localitySchema = new Schema(
  withBaseFields({
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    notes: { type: String },
    soilType: { type: String },
    commonTypologies: [{ type: String }],
    // §4.9.1 regional multiplier, e.g. Arera Colony 1.08. Mirrored onto the rate card
    // for estimate reproducibility; this is the editable source.
    rateMultiplier: { type: Number, default: 1 },
    status: { type: String, enum: PUBLISH_STATUS, default: "draft" },
  }),
  baseSchemaOptions,
);

export type LocalityDocument = { slug: string; name: string; [key: string]: unknown };
export const Locality = defineModel<LocalityDocument>("Locality", localitySchema);

/* SiteSettings — a singleton.
 *
 * FR-HOME-03 is the reason this exists: "Stat band values are READ FROM
 * SITESETTINGS, NOT HARD-CODED." §3.12: every stat must be true and specific,
 * and SRS §10 gate 11 requires the owner to verify each one in writing before
 * launch. A hard-coded stat cannot be corrected by the person accountable for
 * its truth.
 */
const siteSettingsSchema = new Schema(
  withBaseFields({
    singleton: { type: String, default: "site", unique: true },

    business: {
      brandName: { type: String, required: true },
      descriptor: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      foundedYear: { type: Number, required: true },
      phoneE164: { type: String, required: true },
      whatsappE164: { type: String, required: true },
      email: { type: String, required: true },
      gstin: { type: String },
      registrationNo: { type: String },
      officeAddress: { type: String },
      googlePlaceId: { type: String },
      hours: { type: String },
    },

    // §3.12 stat band. Each carries its own label and sublabel so the copy
    // stays with the number it describes.
    stats: [
      {
        _id: false,
        value: { type: Number, required: true },
        precision: { type: Number, default: 0 },
        suffix: { type: String },
        label: { type: String, required: true },
        sublabel: { type: String },
        verifiedAt: { type: Date },
      },
    ],

    // FR-LEAD-10: notification within 60 seconds. FR-ADM-21 makes recipients
    // and channels configurable without a deploy.
    notifications: {
      leadRecipients: [{ type: String }],
      digestRecipients: [{ type: String }],
      whatsappEnabled: { type: Boolean, default: false },
    },

    // FR-ADM-18 / §7.1: provider order and enable/disable are admin-editable
    // WITHOUT A DEPLOY, because Cloudflare "retires models without notice".
    ai: {
      providerOrder: [{ type: String }],
      enabledProviders: [{ type: String }],
      dailyGenerationCap: { type: Number, default: 200 },
      perVisitorCap: { type: Number, default: 3 },
      perVerifiedEmailCap: { type: Number, default: 10 },
      paused: { type: Boolean, default: false },
      // Never a hard-coded constant — §7.1 operational requirement.
      cloudflareModelId: { type: String },
    },

    // FR-LEAD-13: real available slots for site-visit booking.
    siteVisitSlots: [{ type: String }],

    seoDefaults: {
      titleTemplate: { type: String },
      defaultDescription: { type: String },
      defaultOgImage: cloudinaryAssetSchema,
    },
  }),
  baseSchemaOptions,
);

export type SiteSettingsDocument = { singleton: string; [key: string]: unknown };
export const SiteSettings = defineModel<SiteSettingsDocument>(
  "SiteSettings",
  siteSettingsSchema,
);

/* AuditLog — FR-ADM-24 / NFR-SEC-13: every admin mutation, with a before/after
 * diff. Append-only by construction; nothing in the app updates these. */
const auditLogSchema = new Schema(
  {
    actor: { type: Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    diff: { type: Schema.Types.Mixed },
    at: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false, strict: "throw", strictQuery: true },
);

auditLogSchema.index({ at: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, at: -1 });
auditLogSchema.index({ actor: 1, at: -1 });

export type AuditLogDocument = { action: string; entity: string; [key: string]: unknown };
export const AuditLog = defineModel<AuditLogDocument>("AuditLog", auditLogSchema);

/* Subscriber — §10.2: "One email a month. Cost updates and things we learned on
 * site." Double opt-in via confirmedAt (NFR-PRIV-02). */
const subscriberSchema = new Schema(
  withBaseFields({
    email: { type: String, required: true, unique: true, index: true },
    source: { type: String },
    confirmedAt: { type: Date, default: null },
    unsubscribedAt: { type: Date, default: null },
  }),
  baseSchemaOptions,
);

export type SubscriberDocument = { email: string; [key: string]: unknown };
export const Subscriber = defineModel<SubscriberDocument>(
  "Subscriber",
  subscriberSchema,
);

/* NFR-OPS-02 — "Lead submission must never be lost: on database failure, write
 * to a DURABLE FALLBACK QUEUE and alert; the user always sees success if the
 * data is safely captured."
 *
 * §11 rates losing a lead to a database timeout CRITICAL. This collection is
 * the last resort when the primary write path fails; entries are replayed by
 * the cron job and alerted on.
 */
const failedWriteSchema = new Schema(
  {
    kind: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    error: { type: String },
    attempts: { type: Number, default: 0 },
    replayedAt: { type: Date, default: null },
    at: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false, strict: "throw", strictQuery: true },
);

failedWriteSchema.index({ replayedAt: 1, at: 1 });

export type FailedWriteDocument = { kind: string; [key: string]: unknown };
export const FailedWrite = defineModel<FailedWriteDocument>(
  "FailedWrite",
  failedWriteSchema,
);
