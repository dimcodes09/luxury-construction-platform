/* SRS Phase 4 deliverable — the five transactional templates:
 *   lead notification · lead acknowledgement · estimate delivery ·
 *   generation-ready · daily digest
 *
 * Written as plain HTML strings, not React Email. Email clients support a 1998
 * subset of CSS; a component abstraction adds a dependency to the server bundle
 * and buys nothing, because none of our design tokens survive Outlook anyway.
 *
 * Copy follows §1.4 voice and the §10.1 rules: sentences under 20 words, every
 * claim carries a number, Indian-English throughout (lakh, sq ft). The §10.1
 * banned words apply here exactly as they do on the site.
 */

import { EMAIL_PALETTE as C } from "./palette";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME ?? "ZYVORA";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

/* Colours come from ./palette, which mirrors design.md §2.1.2. They must be
 * inline literals in the markup because mail clients support neither CSS custom
 * properties nor external stylesheets — see the note in palette.ts. */
const SHELL_OPEN = `<!doctype html><html><body style="margin:0;padding:0;background:${C.canvas};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${C.body};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.canvas};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.surface};border:1px solid ${C.hairline};">
<tr><td style="padding:24px 32px;border-bottom:1px solid ${C.hairline};">
<span style="font-size:18px;letter-spacing:0.08em;color:${C.heading};">${BRAND}</span><br>
<span style="font-size:11px;letter-spacing:0.10em;text-transform:uppercase;color:${C.muted};">Construction &bull; Interiors &bull; Renovation</span>
</td></tr>
<tr><td style="padding:32px;">`;

const SHELL_CLOSE = `</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid ${C.hairline};font-size:12px;color:${C.muted};">
${BRAND} &bull; <a href="${SITE}" style="color:${C.accent};">${SITE.replace(/^https?:\/\//, "")}</a>
</td></tr></table></td></tr></table></body></html>`;

const wrap = (inner: string) => SHELL_OPEN + inner + SHELL_CLOSE;

const h1 = (text: string) =>
  `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${C.heading};font-weight:400;">${text}</h1>`;
const p = (text: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${C.body};">${text}</p>`;
const small = (text: string) =>
  `<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:${C.muted};">${text}</p>`;
const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;padding:14px 28px;background:${C.heading};color:${C.canvas};text-decoration:none;font-size:15px;">${label}</a>`;

const row = (label: string, value: string) =>
  `<tr><td style="padding:8px 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};width:40%;">${label}</td>
   <td style="padding:8px 0;font-size:14px;color:${C.heading};">${value}</td></tr>`;

const table = (rows: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.hairline};border-bottom:1px solid ${C.hairline};margin:8px 0 24px;">${rows}</table>`;

export type EmailBody = { subject: string; html: string; text: string };

/* ── 1 · Lead notification (FR-LEAD-10) ──────────────────────────────────
 * To the team, within 60 seconds. Leads with journey context convert better
 * because the caller already knows what the person looked at (FR-ADM-05). */
export function leadNotificationEmail(lead: {
  name: string;
  phone: string;
  email?: string;
  projectType: string;
  locality: string;
  area?: number;
  budgetBand: string;
  timeline: string;
  message?: string;
  sourcePage: string;
  estimatesRun: number;
  projectsShortlisted: number;
  adminUrl: string;
}): EmailBody {
  const subject = `New enquiry — ${lead.name}, ${lead.locality} (${lead.projectType})`;

  const html = wrap(
    h1("New enquiry") +
      p(`<strong>${lead.name}</strong> just sent their details.`) +
      table(
        row("Phone", `<a href="tel:${lead.phone}" style="color:${C.accent};">${lead.phone}</a>`) +
          (lead.email ? row("Email", lead.email) : "") +
          row("Project", lead.projectType) +
          row("Locality", lead.locality) +
          (lead.area ? row("Area", `${lead.area.toLocaleString("en-IN")} sq ft`) : "") +
          row("Budget", lead.budgetBand) +
          row("Timeline", lead.timeline) +
          row("Came from", lead.sourcePage) +
          row(
            "Already did",
            `${lead.estimatesRun} estimate(s), ${lead.projectsShortlisted} project(s) shortlisted`,
          ),
      ) +
      (lead.message ? p(`<em>&ldquo;${lead.message}&rdquo;</em>`) : "") +
      button(lead.adminUrl, "Open in admin") +
      // §11 risk 7 — the published median response time only holds if someone
      // actually acts on this. Stating the target in the mail is the nudge.
      small("Target first response: within one working day."),
  );

  const text = [
    `New enquiry — ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : "",
    `Project: ${lead.projectType}`,
    `Locality: ${lead.locality}`,
    lead.area ? `Area: ${lead.area} sq ft` : "",
    `Budget: ${lead.budgetBand}`,
    `Timeline: ${lead.timeline}`,
    `From: ${lead.sourcePage}`,
    lead.message ? `Message: ${lead.message}` : "",
    ``,
    lead.adminUrl,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

/* ── 2 · Lead acknowledgement (FR-LEAD-11) ───────────────────────────────
 * To the visitor: "a summary of their brief and a link to the process page."
 * §3.3 rule 7 — every form states what happens next and when. */
export function leadAcknowledgementEmail(lead: {
  name: string;
  projectType: string;
  locality: string;
  area?: number;
  processUrl: string;
  phoneE164: string;
}): EmailBody {
  const subject = `We've got your details, ${lead.name.split(" ")[0]}`;

  const html = wrap(
    h1("We've got your details") +
      p(`Thanks ${lead.name.split(" ")[0]}. Here's what you sent us.`) +
      table(
        row("Project", lead.projectType) +
          row("Locality", lead.locality) +
          (lead.area ? row("Area", `${lead.area.toLocaleString("en-IN")} sq ft`) : ""),
      ) +
      // §10.2 microcopy, verbatim — the same promise the form made.
      p("We reply within one working day. We never share your number.") +
      p(
        "While you wait, read how a build actually runs — every phase, every payment milestone, and what you receive at each one.",
      ) +
      button(lead.processUrl, "Read the process") +
      small(
        `Need us sooner? Call <a href="tel:${lead.phoneE164}" style="color:${C.accent};">${lead.phoneE164}</a>.`,
      ),
  );

  const text = [
    `We've got your details, ${lead.name.split(" ")[0]}.`,
    ``,
    `Project: ${lead.projectType}`,
    `Locality: ${lead.locality}`,
    lead.area ? `Area: ${lead.area} sq ft` : "",
    ``,
    `We reply within one working day. We never share your number.`,
    ``,
    `Read the process: ${lead.processUrl}`,
    `Call us: ${lead.phoneE164}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

/* ── 3 · Estimate delivery (FR-EST-09, FR-EST-17) ────────────────────────
 * FR-EST-17: the PDF carries all assumptions and the disclaimer. The mail
 * repeats the range and the exclusions rather than only linking, because the
 * whole differentiator is that we do not hide either (§0.8). */
export function estimateDeliveryEmail(estimate: {
  name: string;
  rangeLabel: string;
  mostLikelyLabel: string;
  perSqftLabel: string;
  projectType: string;
  area: number;
  locality: string;
  tier: string;
  exclusions: string[];
  rateCardVersion: number;
  estimateUrl: string;
  pdfUrl?: string;
}): EmailBody {
  const subject = `Your estimate: ${estimate.rangeLabel}`;

  const html = wrap(
    h1("Your cost estimate") +
      p(`${estimate.name.split(" ")[0]}, here's the range for what you described.`) +
      `<p style="margin:0 0 8px;font-size:28px;color:${C.technical};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${estimate.rangeLabel}</p>` +
      `<p style="margin:0 0 24px;font-size:13px;color:${C.muted};">Most likely ${estimate.mostLikelyLabel} &bull; ${estimate.perSqftLabel} per sq ft</p>` +
      table(
        row("Project", estimate.projectType) +
          row("Area", `${estimate.area.toLocaleString("en-IN")} sq ft`) +
          row("Locality", estimate.locality) +
          row("Tier", estimate.tier) +
          row("Rate card", `v${estimate.rateCardVersion}`),
      ) +
      // §10.2 — "This is a range, not a quote. Here's exactly what it excludes."
      p("<strong>This is a range, not a quote. Here's exactly what it excludes:</strong>") +
      `<ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.7;color:${C.body};">${estimate.exclusions
        .map((item) => `<li>${item}</li>`)
        .join("")}</ul>` +
      button(estimate.estimateUrl, "See the full breakdown") +
      (estimate.pdfUrl
        ? small(`<a href="${estimate.pdfUrl}" style="color:${C.accent};">Download the PDF</a>`)
        : "") +
      small(
        "Rates are reviewed quarterly. Your estimate stays reproducible from its rate-card version.",
      ),
  );

  const text = [
    `Your cost estimate: ${estimate.rangeLabel}`,
    `Most likely ${estimate.mostLikelyLabel} (${estimate.perSqftLabel} per sq ft)`,
    ``,
    `${estimate.projectType}, ${estimate.area} sq ft, ${estimate.locality}, ${estimate.tier} tier`,
    `Rate card v${estimate.rateCardVersion}`,
    ``,
    `This is a range, not a quote. It excludes:`,
    ...estimate.exclusions.map((item) => `  - ${item}`),
    ``,
    estimate.estimateUrl,
  ].join("\n");

  return { subject, html, text };
}

/* ── 4 · Generation ready (FR-AI-08) ─────────────────────────────────────
 * Sent when a wait exceeded 20s and the visitor chose "email me when ready".
 * FR-AI-22: the disclaimer that this is an indicative visualisation, not a
 * construction drawing, is persistent — including here. */
export function generationReadyEmail(generation: {
  roomType: string;
  style: string;
  resultUrl: string;
  variantCount: number;
}): EmailBody {
  const subject = "Your room redesign is ready";

  const html = wrap(
    h1("Your redesign is ready") +
      p(
        `We restyled your ${generation.roomType.replace("-", " ")} in ${generation.style.replace(/-/g, " ")}. ${generation.variantCount} version(s) to look at.`,
      ) +
      button(generation.resultUrl, "See it restyled") +
      // FR-AI-22, verbatim in intent.
      small(
        "This is an indicative visualisation, not a construction drawing. We'll tell you what would need to change to build it for real.",
      ) +
      // NFR-PRIV-03 / §10.2 — restate the retention promise.
      small("Your photo is deleted after 30 days. It is never used to train anything."),
  );

  const text = [
    `Your redesign is ready.`,
    ``,
    `${generation.variantCount} version(s) of your ${generation.roomType.replace("-", " ")}.`,
    generation.resultUrl,
    ``,
    `This is an indicative visualisation, not a construction drawing.`,
    `Your photo is deleted after 30 days and is never used to train anything.`,
  ].join("\n");

  return { subject, html, text };
}

/* ── 5 · Daily digest (NFR-OPS-09) ───────────────────────────────────────
 * "Daily lead digest email to the owner EVEN WHEN THERE ARE NO LEADS (absence
 * of the email signals a failure)." So the zero case is a first-class branch,
 * not an early return. */
export function dailyDigestEmail(digest: {
  date: string;
  newLeads: number;
  needingResponse: number;
  estimatesRun: number;
  generationsRun: number;
  medianResponseHours: number | null;
  adminUrl: string;
}): EmailBody {
  const subject =
    digest.newLeads > 0
      ? `${digest.newLeads} new enquir${digest.newLeads === 1 ? "y" : "ies"} — ${digest.date}`
      : `No new enquiries — ${digest.date}`;

  const body =
    digest.newLeads > 0
      ? p(
          `${digest.newLeads} new enquir${digest.newLeads === 1 ? "y" : "ies"} yesterday. ${digest.needingResponse} still need a response.`,
        )
      : p(
          "No new enquiries yesterday. This email arrives every day either way — if it stops, something is broken.",
        );

  const html = wrap(
    h1(`Yesterday — ${digest.date}`) +
      body +
      table(
        row("New enquiries", String(digest.newLeads)) +
          row("Needing response", String(digest.needingResponse)) +
          row("Estimates run", String(digest.estimatesRun)) +
          row("Redesigns run", String(digest.generationsRun)) +
          row(
            "Median first response",
            digest.medianResponseHours === null
              ? "—"
              : `${digest.medianResponseHours.toFixed(1)} hours`,
          ),
      ) +
      button(digest.adminUrl, "Open the dashboard"),
  );

  const text = [
    `Yesterday — ${digest.date}`,
    ``,
    `New enquiries: ${digest.newLeads}`,
    `Needing response: ${digest.needingResponse}`,
    `Estimates run: ${digest.estimatesRun}`,
    `Redesigns run: ${digest.generationsRun}`,
    `Median first response: ${digest.medianResponseHours === null ? "—" : `${digest.medianResponseHours.toFixed(1)} hours`}`,
    ``,
    digest.adminUrl,
  ].join("\n");

  return { subject, html, text };
}
