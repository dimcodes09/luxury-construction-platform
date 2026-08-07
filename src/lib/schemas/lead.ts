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
} from "./common";

/* SRS §4.8 — Lead capture. FR-LEAD-01: a 4-step progressive form where
 * "contact details are collected LAST".
 *
 * The step split below is not cosmetic. §0.5 puts a full lead at rung 5, the
 * highest rung on the commitment ladder, and §3.3 form rule 3 says "ask for
 * contact details last, and only after value has been given". Splitting the
 * schema per step means the client can validate step 1 without the server ever
 * being handed a half-formed lead.
 */

export const leadStep1Schema = z.object({
  projectType: projectTypeSchema,
});

export const leadStep2Schema = z.object({
  locality: localitySchema,
  area: areaSchema.optional(),
});

export const leadStep3Schema = z.object({
  timeline: z.enum([
    "ready-now",
    "1-3-months",
    "3-6-months",
    "6-12-months",
    "just-researching",
  ]),
  budgetBand: budgetBandWithUnsureSchema,
});

/* Step 4 — and only step 4 — asks who they are. */
export const leadStep4Schema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  /* FR-LEAD-05 — "WhatsApp opt-in DEFAULTS TO ON and is clearly labelled."
   * §3.3 rule 6: in this market WhatsApp beats email. Defaulting on is a
   * deliberate, disclosed choice, not a dark pattern — the label says so. */
  whatsappOptIn: z.boolean().default(true),
  message: freeTextSchema(2000).optional(),
});

export const leadSubmissionSchema = leadStep1Schema
  .merge(leadStep2Schema)
  .merge(leadStep3Schema)
  .merge(leadStep4Schema)
  .extend({
    // FR-LEAD-09 enrichment, gathered client-side and re-verified server-side.
    source: z.object({
      page: z.string().max(400),
      referrer: z.string().max(400).optional(),
      utm: z
        .object({
          source: z.string().max(120).optional(),
          medium: z.string().max(120).optional(),
          campaign: z.string().max(120).optional(),
          term: z.string().max(120).optional(),
          content: z.string().max(120).optional(),
        })
        .optional(),
    }),
    sessionId: z.string().max(120).optional(),
    // FR-LEAD-14: a shortlist can be converted into an enquiry with its items
    // attached.
    shortlistItems: z
      .array(
        z.object({
          type: z.enum(["project", "image"]),
          ref: z.string().max(200),
        }),
      )
      .max(50) // FR-GBL-07 caps the shortlist at 50
      .optional(),
    estimateIds: z.array(z.string().max(60)).max(20).optional(),
    generationIds: z.array(z.string().max(60)).max(20).optional(),
  })
  .merge(spamGuardSchema);

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

/* FR-ADM-07 — status changes, with a MANDATORY reason on Lost. Modelled as a
 * discriminated union so `lostReason` is required by the type system, not just
 * by a runtime check that an admin action could forget. */
export const leadStatusUpdateSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("lost"),
    lostReason: z.string().trim().min(3, "A reason is required to mark a lead lost."),
  }),
  z.object({
    status: z.enum([
      "new",
      "contacted",
      "visit-booked",
      "visit-done",
      "quoted",
      "won",
    ]),
  }),
]);

export const leadNoteSchema = z.object({
  body: freeTextSchema(4000).pipe(z.string().min(1, "Write something first.")),
});

/* §10.2 — the microcopy that must appear under every form. Exported so the
 * promise and the code that keeps it live together: FR-LEAD-08's success page
 * has to say the same thing this says. */
export const LEAD_RESPONSE_PROMISE =
  "We reply within one working day. We never share your number.";
