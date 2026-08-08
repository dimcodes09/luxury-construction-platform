import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteShell } from "@/components/shell/site-shell";
import { EnquiryFlow } from "@/components/estimator/enquiry-flow";
import { getSiteSettings } from "@/lib/db/queries";

/* /estimate — "Get a cost estimate".
 *
 * The site does NOT compute or display a figure. The visitor describes the
 * project across five short steps, the brief lands in the admin panel, and the
 * owner replies with a costed range themselves.
 *
 * That is a deliberate departure from design.md §4.9 and FR-EST-02/03, which
 * specify a deterministic rate engine rendering a range on screen. It is
 * recorded in CLAUDE.md's deviations table. The consequence handled here is
 * that the homepage can no longer claim a published price — the S03 proof card
 * and the S07 band were rewritten to match what the site actually does.
 *
 * The flow keeps the §3.3 form rules: one question per screen, contact details
 * last (§0.5), "not sure yet" always available on budget (FR-LEAD-03), and a
 * fixed-bottom CTA on mobile (§4.17) rather than a button at the end of a
 * scroll.
 */

export const metadata: Metadata = {
  title: "Get a cost estimate — ZYVORA Bhopal",
  description:
    "Tell us about your project in 5 short steps. We read every enquiry ourselves and reply within one working day with a costed range and what it excludes.",
};

export default async function EstimatePage() {
  const settings = await getSiteSettings();
  const phoneE164 = settings?.phoneE164 ?? "+919399817681";

  return (
    <SiteShell
      phoneE164={phoneE164}
      dockPerson={{
        firstName: "Ghanshyam",
        role: "Founder",
        responseNote: "usually replies in 20 minutes",
      }}
    >
      <Suspense fallback={<div className="min-h-svh" />}>
        <EnquiryFlow phoneE164={phoneE164} />
      </Suspense>
    </SiteShell>
  );
}
