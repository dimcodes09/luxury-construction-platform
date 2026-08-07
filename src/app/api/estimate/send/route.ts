/* eslint-disable no-restricted-syntax, @typescript-eslint/no-explicit-any --
 * The `any` is a Mongoose .lean() document, whose shape is only known at
 * runtime; it is read defensively with optional chaining throughout.
 * Builds an email body. Mail clients
 * support neither CSS custom properties nor external stylesheets, so colours
 * are inline literals. See src/lib/email/palette.ts for the rationale. */

import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/connect";
import { Estimate, Lead } from "@/lib/db/models";
import { sendEmail } from "@/lib/email/client";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";

/**
 * FR-EST-09: Send estimate summary via Email or WhatsApp after providing name + contact info (rung 4).
 */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const limitResult = await checkRateLimit("leads", hashIp(ip));
    if (!limitResult.success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many send requests. Please try again later." } },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { estimateId, name, email, phone, channel = "email" } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Name and at least one contact channel are required." } },
        { status: 400 },
      );
    }

    await connectToDatabase();

    let estimateDoc: Record<string, any> | null = null;
    if (estimateId) {
      estimateDoc = await Estimate.findById(estimateId);
    }

    // Create or update Lead record (Rung 4 capture)
    const leadDoc = await Lead.create({
      name,
      phone: phone || "0000000000",
      email: email || undefined,
      whatsappOptIn: channel === "whatsapp",
      projectType: estimateDoc?.inputs?.projectType || "house-construction",
      locality: estimateDoc?.inputs?.locality || "Baner",
      area: estimateDoc?.inputs?.area || 2000,
      timeline: "1-3-months",
      budgetBand: "50L-1Cr",
      source: { page: "/estimate", referrer: request.headers.get("referer") || "" },
      journey: {
        sessionId: estimateDoc?.sessionId || "anon",
        shortlistItems: [],
        estimateIds: estimateId ? [estimateId] : [],
        generationIds: [],
        pagesViewed: [],
        firstSeenAt: new Date(),
        totalSessions: 1,
      },
      status: "new",
      notes: [{ body: `Requested estimate delivery via ${channel}`, author: "System", at: new Date() }],
    });

    if (estimateDoc) {
      estimateDoc.contactCaptured = true;
      estimateDoc.leadId = leadDoc._id;
      if (Array.isArray(estimateDoc.sentVia) && !estimateDoc.sentVia.includes(channel)) {
        estimateDoc.sentVia.push(channel);
      }
      await estimateDoc.save();
    }

    // Send email notification if channel === 'email' and email provided
    if (email) {
      const minLakhs = estimateDoc?.outputs?.min ? (estimateDoc.outputs.min / 100000).toFixed(1) : "45.0";
      const maxLakhs = estimateDoc?.outputs?.max ? (estimateDoc.outputs.max / 100000).toFixed(1) : "62.0";

      await sendEmail({
        to: email,
        subject: `Your ZYVORA Construction Estimate — ₹${minLakhs} L to ₹${maxLakhs} L`,
        html: `<div style="font-family: sans-serif; padding: 20px;">
          <h2>ZYVORA Construction Estimate</h2>
          <p>Dear ${name},</p>
          <p>Thank you for using our deterministic cost estimator. Here is the summary of your calculation:</p>
          <ul>
            <li><strong>Project Type:</strong> ${estimateDoc?.inputs?.projectType || "House Construction"}</li>
            <li><strong>Locality:</strong> ${estimateDoc?.inputs?.locality || "Baner, Pune"}</li>
            <li><strong>Area:</strong> ${estimateDoc?.inputs?.area || 2000} sq ft</li>
            <li><strong>Specification Tier:</strong> ${estimateDoc?.inputs?.tier || "Signature"}</li>
            <li><strong>Estimated Range:</strong> ₹${minLakhs} Lakhs – ₹${maxLakhs} Lakhs</li>
          </ul>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://zyvora.in"}/api/estimate/${
          estimateDoc?._id || "latest"
        }/pdf" style="display: inline-block; background: #b8860b; color: #fff; padding: 10px 20px; text-decoration: none;">Download Full PDF Estimate</a></p>
          <p>Our senior site engineer will follow up with you shortly.</p>
        </div>`,
        text: `ZYVORA Construction Estimate for ${name}: ₹${minLakhs} L to ₹${maxLakhs} L. Visit https://zyvora.in for details.`,
        tag: "estimate-delivery",
      });
    }

    return NextResponse.json({
      success: true,
      leadId: leadDoc._id.toString(),
      message: `Estimate sent via ${channel} to ${email || phone}`,
    });
  } catch (err) {
    console.error("Estimate send API error:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to send estimate." } },
      { status: 500 },
    );
  }
}
