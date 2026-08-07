/* eslint-disable no-restricted-syntax, @typescript-eslint/no-explicit-any --
 * The `any` is a Mongoose .lean() document, whose shape is only known at
 * runtime; it is read defensively with optional chaining throughout.
 * This route emits a STANDALONE HTML
 * document for print/PDF. A detached document cannot reference our CSS custom
 * properties, so colours must be inline literals, exactly as in
 * src/lib/email/palette.ts. Values mirror design.md §2.1.2. */

import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/connect";
import { Estimate } from "@/lib/db/models";
import { DEFAULT_INCLUSIONS, DEFAULT_EXCLUSIONS } from "@/lib/estimator/engine";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * FR-EST-17: Server-side branded PDF / HTML printable view for an estimate.
 * Includes all assumptions, rate-card version, inclusions, exclusions, and legal disclaimers.
 */
export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;

    let estimate: Record<string, any> | null = null;

    if (id && id !== "latest") {
      await connectToDatabase();
      estimate = await Estimate.findById(id).lean();
    }

    // Default values if not found or demo
    const projectType = (estimate?.inputs?.projectType || "house-construction").replace("-", " ").toUpperCase();
    const locality = estimate?.inputs?.locality || "Baner";
    const city = estimate?.inputs?.city || "Pune";
    const area = estimate?.inputs?.area || 2400;
    const tier = (estimate?.inputs?.tier || "signature").toUpperCase();

    const minLakhs = estimate?.outputs?.min ? (estimate.outputs.min / 100000).toFixed(2) : "50.40";
    const maxLakhs = estimate?.outputs?.max ? (estimate.outputs.max / 100000).toFixed(2) : "67.20";
    const likelyLakhs = estimate?.outputs?.mostLikely ? (estimate.outputs.mostLikely / 100000).toFixed(2) : "58.80";
    const perSqft = estimate?.outputs?.perSqft ? estimate.outputs.perSqft : 2450;
    const rateCardVersion = estimate?.assumptions?.rateCardVersion || 20261;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>ZYVORA Construction Estimate #${id || "DEMO"}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px; color: #111; line-height: 1.5; background: #fff; }
    .header { border-bottom: 2px solid #b8860b; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 24px; font-weight: bold; letter-spacing: 0.1em; color: #111; }
    .doc-title { font-size: 14px; text-transform: uppercase; color: #666; letter-spacing: 0.08em; text-align: right; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .box { border: 1px solid #e2e8f0; padding: 20px; border-radius: 4px; background: #f8fafc; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 4px; display: block; }
    .value { font-size: 16px; font-weight: 600; color: #0f172a; }
    .hero-box { background: #0f172a; color: #fff; padding: 24px; border-radius: 4px; margin-bottom: 30px; }
    .hero-box .label { color: #b8860b; }
    .hero-box .amount { font-size: 32px; font-family: monospace; font-weight: bold; color: #fff; margin: 8px 0; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th { border-bottom: 2px solid #e2e8f0; text-align: left; padding: 8px; font-size: 12px; text-transform: uppercase; color: #64748b; }
    .table td { border-bottom: 1px solid #e2e8f0; padding: 12px 8px; font-size: 14px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .inc { border-left: 4px solid #10b981; padding-left: 12px; }
    .exc { border-left: 4px solid #f43f5e; padding-left: 12px; }
    .disclaimer { font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 40px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">ZYVORA</div>
      <div style="font-size: 12px; color: #64748b;">Turnkey Construction & Interiors • Pune</div>
    </div>
    <div class="doc-title">
      Cost Estimate Report<br>
      <span style="font-size: 11px; font-family: monospace; color: #94a3b8;">Ref: #${id || "DEMO-2026"}</span>
    </div>
  </div>

  <div class="hero-box">
    <span class="label">ESTIMATED INVESTMENT RANGE</span>
    <div class="amount">₹${minLakhs} Lakhs – ₹${maxLakhs} Lakhs</div>
    <div style="font-size: 13px; color: #94a3b8;">Most likely budget: <strong>₹${likelyLakhs} Lakhs</strong> (₹${perSqft.toLocaleString(
      "en-IN",
    )} / sq ft)</div>
  </div>

  <div class="grid">
    <div class="box">
      <span class="label">PROJECT PARAMETERS</span>
      <div class="value">${projectType}</div>
      <div style="font-size: 13px; color: #475569; margin-top: 4px;">
        Locality: ${locality}, ${city}<br>
        Built-up Area: ${area.toLocaleString("en-IN")} sq ft<br>
        Specification Tier: ${tier}
      </div>
    </div>

    <div class="box">
      <span class="label">GOVERNANCE & RATE CARD</span>
      <div class="value">Rate Card v${rateCardVersion}</div>
      <div style="font-size: 13px; color: #475569; margin-top: 4px;">
        Payment Milestones: 9 Stages<br>
        Regional Multiplier: ${estimate?.assumptions?.regionalMultiplier || 1.08}<br>
        Steel Benchmark: ₹${estimate?.assumptions?.commodityRates?.steelPerKg || 64}/kg
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="inc">
      <span class="label" style="color: #059669;">WHAT IS INCLUDED</span>
      <ul style="font-size: 13px; padding-left: 16px; margin-top: 8px; color: #334155;">
        ${DEFAULT_INCLUSIONS.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join("")}
      </ul>
    </div>

    <div class="exc">
      <span class="label" style="color: #e11d48;">WHAT IS NOT INCLUDED</span>
      <ul style="font-size: 13px; padding-left: 16px; margin-top: 8px; color: #334155;">
        ${DEFAULT_EXCLUSIONS.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join("")}
      </ul>
    </div>
  </div>

  <div class="disclaimer">
    <strong>Legal Disclaimer & Terms:</strong> This document is an indicative cost estimate generated by ZYVORA's deterministic rate engine based on standard 2026 construction benchmarks in Pune. It does not constitute a binding legal contract or lump-sum quotation. Final binding pricing is established in a formal construction contract following soil bearing tests, structural engineering calculations, and detailed line-item BOQ approval.
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("PDF generation API error:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to render PDF estimate." } },
      { status: 500 },
    );
  }
}
