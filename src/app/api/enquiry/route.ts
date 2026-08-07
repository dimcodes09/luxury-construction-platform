import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/connect";
import { FailedWrite, Lead } from "@/lib/db/models";
import { enquirySubmissionSchema } from "@/lib/schemas/enquiry";
import { isLikelySpam } from "@/lib/schemas/common";
import { checkRateLimit, clientIpFrom, hashIp } from "@/lib/rate-limit";

/* POST /api/enquiry — the /estimate cost-estimate request.
 *
 * Persists a Lead the owner reads in the admin panel and quotes manually. No
 * figure is computed and nothing is emailed from here.
 *
 * NFR-OPS-02 is the rule that shapes the error handling: "Lead submission must
 * never be lost: on database failure, write to a DURABLE FALLBACK QUEUE and
 * alert; the user always sees success IF THE DATA IS SAFELY CAPTURED." §11
 * rates losing a lead to a database timeout the single most expensive failure
 * on the site, so a Mongo outage falls through to FailedWrite rather than
 * showing the visitor an error and losing the brief.
 */

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Something went wrong. Please try again." } },
      { status: 400 },
    );
  }

  // §6 conventions — validated on the server regardless of the client.
  const parsed = enquirySubmissionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          // Safe to display: names the field, never internals.
          message:
            parsed.error.issues[0]?.message ??
            "Please check the highlighted fields.",
          field: parsed.error.issues[0]?.path?.join("."),
        },
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  /* FR-LEAD-12 — honeypot plus time-to-complete. Explicitly NOT a CAPTCHA:
   * "it measurably reduces genuine submissions and this audience is not
   * technical." A bot gets a 200 so it learns nothing. */
  if (isLikelySpam({ website: data.website, startedAt: data.startedAt })) {
    return NextResponse.json({ ok: true, id: null });
  }

  const ip = clientIpFrom(request.headers);
  const ipHash = hashIp(ip);

  // NFR-SEC-05 — 5 per hour per IP on the lead path.
  const limit = await checkRateLimit("leads", ipHash);
  if (!limit.success) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message:
            "That's a few enquiries from this connection already. Call us on +91 93998 17681 and we'll pick it up directly.",
        },
      },
      { status: 429 },
    );
  }

  const lead = {
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    whatsappOptIn: data.whatsappOptIn,

    projectType: data.projectType,
    locality: data.locality,
    area: data.area,
    floors: data.floors ?? null,
    timeline: data.timeline,
    budgetBand: data.budgetBand,
    message: data.message,

    // The estimating inputs the owner quotes from.
    tier: data.tier ?? null,
    siteCondition: data.siteCondition ?? null,
    addons: data.addons ?? [],

    source: {
      page: data.source?.page ?? "/estimate",
      referrer: data.source?.referrer,
    },
    journey: { sessionId: data.sessionId },
    status: "new" as const,
  };

  try {
    await connectToDatabase();

    /* FR-LEAD-15 — duplicate detection inside 24h. The same person refining
     * their brief should update one record, not create three for the owner to
     * reconcile. */
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await Lead.findOne({
      phone: lead.phone,
      createdAt: { $gte: since },
      deletedAt: null,
    });

    if (existing) {
      await Lead.updateOne({ _id: existing._id }, { $set: lead });
      return NextResponse.json({ ok: true, id: String(existing._id), updated: true });
    }

    const created = await Lead.create(lead);
    return NextResponse.json({ ok: true, id: String(created._id) });
  } catch (error) {
    /* NFR-OPS-02 — the durable fallback. The visitor still sees success,
     * because the brief IS safely captured; the cron replays it. */
    try {
      await FailedWrite.create({
        kind: "lead:enquiry",
        payload: lead,
        error: error instanceof Error ? error.message : String(error),
        at: new Date(),
      });
      return NextResponse.json({ ok: true, id: null, queued: true });
    } catch {
      // Both writes failed — now it is honest to say so.
      return NextResponse.json(
        {
          error: {
            code: "STORAGE_UNAVAILABLE",
            message:
              "We couldn't save that. Please call or WhatsApp +91 93998 17681 and we'll take the details directly.",
          },
        },
        { status: 503 },
      );
    }
  }
}
