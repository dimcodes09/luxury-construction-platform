import { z } from "zod";

import { emailSchema, spamGuardSchema } from "./common";

/* §10.2 — "One email a month. Cost updates and things we learned on site."
 * That promise is the whole pitch, so it lives next to the schema that
 * collects against it. NFR-PRIV-02 requires consent state to be persisted and
 * honoured; `confirmedAt` on the Subscriber model is the double opt-in. */

export const subscribeSchema = z
  .object({
    email: emailSchema,
    source: z.string().max(120).optional(),
  })
  .merge(spamGuardSchema);

export type SubscribeInput = z.infer<typeof subscribeSchema>;

export const SUBSCRIBE_PROMISE =
  "One email a month. Cost updates and things we learned on site.";
