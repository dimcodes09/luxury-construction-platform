import { z } from "zod";

import { emailSchema, freeTextSchema } from "./common";

/* SRS §4.10 — AI Design Assistant ("ZYVORA Studio", §1.1.4). */

export const roomTypeSchema = z.enum([
  "living-room",
  "bedroom",
  "kitchen",
  "bathroom",
  "dining",
  "home-office",
  "balcony",
  "exterior",
]);

/* FR-AI-04 — six style options, "each illustrated with THE BUSINESS'S OWN
 * PROJECT PHOTOGRAPHY". R-07: authenticity signals outperform stock polish, and
 * §0.2 rejects watermarked/stock AI room design outright. */
export const styleSchema = z.enum([
  "contemporary-indian",
  "warm-minimal",
  "mid-century",
  "colonial-revival",
  "industrial",
  "traditional-maharashtrian",
]);

/* FR-AI-02 — JPEG, PNG, HEIC up to 10MB, client-side downscaled to 1536px
 * longest edge before upload. The cap is checked on the client for a fast
 * error and again on the server, because NFR-SEC-08 requires validation by
 * MAGIC BYTES, NOT EXTENSION — a rename must not get through. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_EDGE = 1536;

export const ACCEPTED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

export const generationRequestSchema = z.object({
  // The Cloudinary public id returned by /api/design/upload.
  sourceImageId: z.string().min(1).max(200),
  // FR-AI-03: room type is MANDATORY and constrains the generation prompt.
  roomType: roomTypeSchema,
  style: styleSchema,
  // FR-AI-05: optional, sanitised, capped at 200 characters. §7.2 inserts it
  // into a constrained slot only — never as raw instruction.
  constraints: freeTextSchema(200).optional(),
  /* FR-AI-15 — "Explicit consent checkbox covering retention (30 days),
   * non-use for training, and non-publication without written permission."
   * NFR-PRIV-04 makes the training clause explicit. Required literal true:
   * an unchecked box must fail validation, not default to consent. */
  consent: z.literal(true, {
    errorMap: () => ({
      message: "We need your agreement to the retention terms before we start.",
    }),
  }),
  sessionId: z.string().max(120).optional(),
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;

/* FR-AI-07 — "Status messages reflect REAL backend job state; FABRICATED
 * PROGRESS IS PROHIBITED." §5.3's queue experience is honest about the wait
 * precisely because a fake progress bar that stalls destroys more trust than a
 * slow but truthful one. */
export const generationStatusSchema = z.object({
  id: z.string(),
  status: z.enum([
    "queued",
    "moderating",
    "generating",
    "complete",
    "failed",
    "quota-exceeded",
  ]),
  queuePosition: z.number().int().nonnegative().optional(),
  variants: z
    .array(z.object({ url: z.string().url(), order: z.number().int() }))
    .optional(),
  /* FR-AI-17 / NFR-OPS-06 — on quota exhaustion a curated moodboard is shown.
   * "RAW PROVIDER ERRORS MUST NEVER SURFACE." So the client contract has no
   * field capable of carrying one: only a safe, human message. */
  message: z.string().max(300).optional(),
  moodboard: z
    .array(z.object({ url: z.string().url(), projectHref: z.string() }))
    .optional(),
});

export type GenerationStatus = z.infer<typeof generationStatusSchema>;

/* FR-AI-08 — "Waits exceeding 20 seconds surface an 'email me when ready'
 * option (rung 4)." A wait becomes a soft-identity capture instead of an
 * abandonment. */
export const GENERATION_EMAIL_PROMPT_AFTER_MS = 20_000;

export const generationNotifySchema = z.object({
  generationId: z.string().min(1),
  email: emailSchema,
});
