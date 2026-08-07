import type { ReactNode } from "react";

import { FOOTER_COLUMNS } from "@/lib/navigation";
import { FooterMega } from "@/components/sections/footer-mega";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { StickyCtaBar } from "./sticky-cta-bar";
import { ContactDock } from "./contact-dock";

/* design.md §3.0 SHELL — assembles §3.5 header, §3.6 sticky CTA bar,
 * §3.7 contact dock and §3.8 footer into one wrapper.
 *
 * A Server Component: the interactive pieces are the only client islands, and
 * the footer's link matrix and trust band render on the server so they are in
 * the HTML for crawlers (§10.5 treats the footer as a real internal-linking
 * surface, and FR-GBL-01 requires meaningful HTML without JavaScript).
 *
 * §9.4 — "Skip to content as the FIRST FOCUSABLE ELEMENT, visible on focus."
 */

export function SiteShell({
  children,
  phoneE164,
  rating,
  dockPerson,
  /** FR-GBL-05 — pre-fills WhatsApp with page context, e.g. a project name. */
  whatsappContext,
  featuredProject,
}: {
  children: ReactNode;
  phoneE164: string;
  rating?: { value: number; count: number };
  dockPerson: React.ComponentProps<typeof ContactDock>["person"];
  whatsappContext?: string;
  featuredProject?: React.ComponentProps<typeof Header>["featuredProject"];
}) {
  return (
    <>
      {/* §9.4 skip link — first in the DOM, invisible until focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-devtools focus:rounded-sm focus:bg-ink-900 focus:px-4 focus:py-3 focus:font-sans focus:text-body-sm focus:text-basalt-050"
      >
        Skip to content
      </a>

      <Header
        phoneE164={phoneE164}
        rating={rating}
        featuredProject={featuredProject}
      />

      <main id="main" className="min-h-svh">
        {children}
      </main>

      <FooterMega
        brandName="ZYVORA"
        foundedYear={2018}
        conversionHeadline="Building in Pune? Let's talk about your site."
        conversionActions={
          <>
            {/* §0.5 — a rung-5 ask is correct here: the footer sits at the end
             * of a page that has already offered the estimator (rung 3). */}
            <Button asChild variant="primary" size="lg">
              <a href="/contact">Book a site visit</a>
            </Button>
            <Button asChild variant="whatsapp" size="lg">
              <a href={`tel:${phoneE164}`}>Talk to a designer</a>
            </Button>
          </>
        }
        columns={FOOTER_COLUMNS}
        contactSlot={
          <div>
            <p className="font-sans text-caption text-basalt-400">
              Placeholder address, Pune 411045
            </p>
            <a
              href={`tel:${phoneE164}`}
              data-analytics="phone_click"
              className="mt-2 block font-mono text-body-sm tabular text-basalt-300 underline-wipe"
            >
              {phoneE164}
            </a>
            <p className="mt-2 font-sans text-caption text-basalt-400">
              Mon–Sat, 10:00–19:00
            </p>
          </div>
        }
        credentials={[
          // §3.8 zone 3 — GSTIN and registration numbers are "the cheapest,
          // highest-impact legitimacy signals available" (R-01).
          { label: "GSTIN", value: "27AABCZ1234M1Z5" },
          { label: "Registration", value: "U45200PN2018PTC" },
          { label: "Insurance", value: "CAR policy, active" },
        ]}
        localities={["Baner", "Aundh", "Kothrud", "Pashan", "Bavdhan", "Wakad"]}
        localityHref={(locality) => `/areas/${locality.toLowerCase()}`}
        legalLinks={[
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ]}
      />

      <StickyCtaBar phoneE164={phoneE164} context={whatsappContext} />
      <ContactDock
        phoneE164={phoneE164}
        person={dockPerson}
        context={whatsappContext}
      />
    </>
  );
}
