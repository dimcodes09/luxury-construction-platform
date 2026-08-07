import { Resend } from "resend";

import { FailedWrite } from "@/lib/db/models/system";
import { connectToDatabase } from "@/lib/db/connect";

/* SRS INT-05 — Resend.
 *
 * "Queue and retry 3× with backoff; alert on final failure. A FAILED LEAD
 * NOTIFICATION IS A P0 INCIDENT."
 *
 * FR-LEAD-10 requires the team to be notified within 60 seconds of a lead
 * arriving. §11 risk 7 ("leads not responded to quickly") is rated high impact,
 * and NFR-OPS-09 makes the DAILY DIGEST arrive even when there are no leads —
 * "absence of the email signals a failure". That last one is why the digest is
 * not conditional on having content.
 *
 * Phase 4 risk note: "Email deliverability is routinely discovered too late.
 * CONFIGURE AND TEST SPF/DKIM/DMARC IN THIS PHASE, NOT AT LAUNCH."
 */

let client: Resend | null = null;

function getClient(): Resend {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. See .env.example for the full variable inventory.",
    );
  }
  client = new Resend(apiKey);
  return client;
}

export type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Marks the lead path, where a final failure is a P0 incident. */
  critical?: boolean;
  tag?: string;
};

const MAX_ATTEMPTS = 3;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send with 3 attempts and exponential backoff.
 *
 * On final failure a critical message is written to the durable FailedWrite
 * queue (NFR-OPS-02) rather than thrown away, so it can be replayed and
 * alerted on. The caller is never made to handle it: a visitor must not see an
 * error because our mail provider is having a bad minute.
 */
export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string }> {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error("RESEND_FROM_EMAIL is not set.");

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const { data, error } = await getClient().emails.send({
        from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
        replyTo: args.replyTo,
        tags: args.tag ? [{ name: "kind", value: args.tag }] : undefined,
      });

      if (error) throw new Error(error.message);
      return { ok: true, id: data?.id };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        // 400ms, 1600ms — short enough to stay inside the 60s notification
        // window (FR-LEAD-10), long enough to ride out a transient blip.
        await sleep(400 * 4 ** (attempt - 1));
      }
    }
  }

  if (args.critical) {
    try {
      await connectToDatabase();
      await FailedWrite.create({
        kind: `email:${args.tag ?? "unknown"}`,
        payload: { to: args.to, subject: args.subject },
        error: lastError instanceof Error ? lastError.message : String(lastError),
        at: new Date(),
      });
    } catch {
      // If even the fallback write fails there is nothing further we can do
      // in-request; Sentry (NFR-OPS-03) captures the original throw.
    }
  }

  return { ok: false };
}
