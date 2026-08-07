import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/connect";
import { Lead } from "@/lib/db/models";
import { leadSubmissionSchema } from "@/lib/schemas/lead";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/client";
import { leadNotificationEmail, leadAcknowledgementEmail } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Rate limiting: 5 lead submissions per hour per IP (NFR-SEC-05)
    const limitResult = await checkRateLimit("leads", hashIp(ip));
    if (!limitResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many lead submissions from this IP. Please wait or contact us via WhatsApp.",
          },
        },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Honeypot spam check (FR-LEAD-12)
    if (body.website_hp) {
      return NextResponse.json({ success: true, leadId: "spammed" });
    }

    // Server-side Zod validation
    const parsed = leadSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Please check your form inputs.",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    await connectToDatabase();

    // Duplicate detection (FR-LEAD-15): same phone within 24h updates existing lead
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingLead = await Lead.findOne({
      phone: data.phone,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    let leadIdStr: string;
    const leadEmail: string | undefined = data.email;

    if (existingLead) {
      existingLead.projectType = data.projectType;
      existingLead.locality = data.locality;
      existingLead.area = data.area;
      existingLead.timeline = data.timeline;
      existingLead.budgetBand = data.budgetBand;
      if (data.message && Array.isArray(existingLead.notes)) {
        existingLead.notes.push({
          body: `Updated submission: ${data.message}`,
          author: "System",
          at: new Date(),
        });
      }
      await existingLead.save();
      leadIdStr = existingLead._id.toString();
    } else {
      const newLead = await Lead.create({
        name: data.name,
        phone: data.phone,
        whatsappOptIn: data.whatsappOptIn,
        email: data.email || undefined,
        projectType: data.projectType,
        locality: data.locality,
        area: data.area,
        timeline: data.timeline,
        budgetBand: data.budgetBand,
        message: data.message,
        source: data.source,
        journey: {
          sessionId: data.sessionId || "anonymous",
          shortlistItems: data.shortlistItems || [],
          estimateIds: data.estimateIds || [],
          generationIds: data.generationIds || [],
          pagesViewed: [],
          firstSeenAt: new Date(),
          totalSessions: 1,
        },
        status: "new",
        notes: data.message
          ? [{ body: data.message, author: "Visitor", at: new Date() }]
          : [],
      });
      leadIdStr = newLead._id.toString();
    }

    // Trigger transactional emails asynchronously (non-blocking per NFR-OPS-02)
    try {
      const recipient = process.env.NOTIFICATION_EMAIL || "leads@zyvora.in";
      const notif = leadNotificationEmail({
        name: data.name,
        phone: data.phone,
        email: data.email,
        projectType: data.projectType,
        locality: data.locality,
        area: data.area,
        budgetBand: data.budgetBand,
        timeline: data.timeline,
        message: data.message,
        sourcePage: data.source?.page || "/contact",
        estimatesRun: data.estimateIds?.length || 0,
        projectsShortlisted: data.shortlistItems?.length || 0,
        adminUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://zyvora.in"}/admin/leads/${leadIdStr}`,
      });

      await sendEmail({
        to: recipient,
        ...notif,
        critical: true,
        tag: "lead-notification",
      });

      if (leadEmail) {
        const ack = leadAcknowledgementEmail({
          name: data.name,
          projectType: data.projectType,
          locality: data.locality,
          area: data.area,
          processUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://zyvora.in"}/process`,
          phoneE164: "+919399817681",
        });
        await sendEmail({
          to: leadEmail,
          ...ack,
          tag: "lead-acknowledgement",
        });
      }
    } catch (emailErr) {
      console.error("Non-fatal lead email notification error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      leadId: leadIdStr,
    });
  } catch (err) {
    console.error("Lead submission API error:", err);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Unable to process submission. Please try contacting us directly via WhatsApp or Phone.",
        },
      },
      { status: 500 },
    );
  }
}
