import { z } from "zod";

import {
  areaSchema,
  budgetBandWithUnsureSchema,
  emailSchema,
  freeTextSchema,
  localitySchema,
  nameSchema,
  phoneSchema,
  projectTypeSchema,
  spamGuardSchema,
  tierSchema,
} from "./common";

/* /estimate — the cost-estimate ENQUIRY.
 *
 * The site no longer computes or displays a figure. The visitor describes the
 * project, the brief lands in the admin panel, and the owner quotes manually
 * from it. That is a deliberate change of approach, and it changes what this
 * form has to do: it is now a lead-capture flow, so §3.3's form rules govern it
 * rather than §4.9's estimator rules.
 *
 * Two of those rules shape the schema:
 *  - FR-LEAD-03 / §4.8: "not sure yet" on budget is MANDATORY, because forcing
 *    a budget guess is a leading cause of abandonment.
 *  - §3.3 rule 3 / §0.5: contact details come LAST, so steps 1–4 must validate
 *    and persist independently of step 5.
 */

export const enquiryStep1Schema = z.object({
  projectType: projectTypeSchema,
});

export const enquiryStep2Schema = z.object({
  locality: localitySchema,
  city: z.string().trim().min(2).max(80).default("Bhopal"),
  area: areaSchema.optional(),
  floors: z.number().int().min(1).max(20).optional(),
});

export const enquiryStep3Schema = z.object({
  /* Not a price — a specification level. It tells the owner which rate band to
   * quote from without the site publishing one. */
  tier: tierSchema.optional(),
  siteCondition: z
    .enum(["standard", "sloped", "black-cotton-soil", "rocky-strata"])
    .optional(),
  addons: z.array(z.string().max(60)).max(20).default([]),
});

export const enquiryStep4Schema = z.object({
  timeline: z.enum([
    "ready-now",
    "1-3-months",
    "3-6-months",
    "6-12-months",
    "just-researching",
  ]),
  budgetBand: budgetBandWithUnsureSchema,
});

/* Step 5 — and only step 5 — asks who they are (§0.5 rung 5). */
export const enquiryStep5Schema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  /* FR-LEAD-05 — WhatsApp opt-in defaults to ON and is clearly labelled.
   * §3.3 rule 6: in this market WhatsApp beats email. */
  whatsappOptIn: z.boolean().default(true),
  message: freeTextSchema(2000).optional(),
});

export const enquirySubmissionSchema = enquiryStep1Schema
  .merge(enquiryStep2Schema)
  .merge(enquiryStep3Schema)
  .merge(enquiryStep4Schema)
  .merge(enquiryStep5Schema)
  .extend({
    source: z
      .object({
        page: z.string().max(400).default("/estimate"),
        referrer: z.string().max(400).optional(),
      })
      .default({ page: "/estimate" }),
    sessionId: z.string().max(120).optional(),
  })
  .merge(spamGuardSchema);

export type EnquirySubmission = z.infer<typeof enquirySubmissionSchema>;

/* §10.2 — the promise shown under the form, and the one the success screen
 * repeats. Kept beside the schema so the copy and the code that honours it
 * cannot drift apart. */
export const ENQUIRY_PROMISE =
  "We read every enquiry ourselves and reply within one working day. We never share your number.";
