/* SRS §5 — the sixteen collections, in one place.
 *
 * Importing from here (rather than reaching into individual files) guarantees
 * every model is registered before a query runs. Mongoose `populate()` resolves
 * refs by model NAME at call time, so a model that has not been imported yet
 * throws MissingSchemaError — a failure that only shows up on the code path
 * that populates, which is usually in production.
 */

export { Project, type ProjectDocument } from "./project";
export { Service, type ServiceDocument } from "./service";
export { Lead, type LeadDocument } from "./lead";
export {
  Estimate,
  RateCard,
  type EstimateDocument,
  type RateCardDocument,
} from "./estimate";
export { Generation, type GenerationDocument } from "./generation";
export {
  Testimonial,
  Article,
  Material,
  FAQ,
  ARTICLE_BLOCK_TYPES,
  type TestimonialDocument,
  type ArticleDocument,
  type MaterialDocument,
  type FAQDocument,
} from "./content";
export {
  User,
  Locality,
  SiteSettings,
  AuditLog,
  Subscriber,
  FailedWrite,
  type UserDocument,
  type LocalityDocument,
  type SiteSettingsDocument,
  type AuditLogDocument,
  type SubscriberDocument,
  type FailedWriteDocument,
} from "./system";

export { connectToDatabase, getRawDb } from "../connect";
export * from "../common";
