import type { Metadata } from "next";

import { SiteShell } from "@/components/shell/site-shell";
import { Hero } from "@/components/sections/hero";
import { Section, SectionHeader } from "@/components/sections/section-header";
import { Button } from "@/components/ui/button";
import { Body } from "@/components/foundation/typography";

/* Dev-only harness for the §3.5–§3.8 shell.
 *
 * Excluded from production by the `page.dev.tsx` extension (next.config.ts), so
 * it costs nothing in the shared-JS budget.
 *
 * What to check here:
 *  - §3.5 header collapses 84 → 64 past 120px, hides on scroll-down past 240,
 *    and reveals on scroll-up. Never fully hidden with a panel open.
 *  - §3.5 header inverts over the hero (data-header-dark), via
 *    IntersectionObserver rather than a scroll threshold.
 *  - §3.5 Services opens a PANEL with 3 intent columns + Explore + a featured
 *    project. Esc, outside click and route change all close it; Tab is trapped.
 *  - §3.5 rating chip appears at ≥1280 only.
 *  - §3.5 mobile drawer at <1024: full-screen, staggered, focus-trapped, with
 *    the page behind marked inert.
 *  - §3.6 sticky CTA bar appears past 40% scroll, mobile only.
 *  - §3.7 contact dock expands on hover, never auto-opens, dismissal persists.
 */

export const metadata: Metadata = {
  title: "Shell — ZYVORA",
  robots: { index: false, follow: false },
};

export default function ShellHarnessPage() {
  return (
    <SiteShell
      phoneE164="+919399817681"
      whatsappContext="Ridgeline House project"
      dockPerson={{
        firstName: "Ghanshyam",
        role: "Founder",
        responseNote: "usually replies in 20 minutes",
        photo: { src: "/photos/team-1.jpg", alt: "" },
      }}
      featuredProject={{
        title: "Ridgeline House",
        href: "/work/ridgeline-house",
        locality: "Arera Colony · 2025",
        image: { src: "/photos/project-1.jpg", alt: "" },
      }}
    >
      {/* data-header-dark is what the header's IntersectionObserver watches to
       * decide when to render inverted (§3.5 context-aware colour). */}
      <div data-header-dark>
        <Hero
          headline="We show you what's behind the wall."
          subtitle="Turnkey construction, interiors and renovation in Bhopal. We publish our rates, our payment milestones, and photographs of the concealed work before we close it up."
          poster={{ src: "/photos/hero.jpg", alt: "" }}
          actions={
            <>
              <Button variant="accent" size="lg">
                Get a cost estimate
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="border-basalt-050 text-basalt-050"
              >
                See our work
              </Button>
            </>
          }
        />
      </div>

      {/* Enough length to exercise the 40% scroll threshold and the
       * directional header. */}
      {Array.from({ length: 6 }, (_, index) => (
        <Section key={index} rhythm="standard">
          <SectionHeader
            index={String(index + 2).padStart(2, "0")}
            label={`Scroll section ${index + 1}`}
            title="Scroll to watch the header collapse and the CTA bar arrive."
            body="The header collapses past 120px, hides on scroll-down past 240px, and reveals immediately on scroll-up. The mobile CTA bar appears past 40% of the page."
          />
          <Body size="md" className="mt-8">
            Resize below 1024px to swap the desktop nav for the drawer and the
            dock for the sticky bar. Resize below 1280px to drop the rating chip.
          </Body>
        </Section>
      ))}
    </SiteShell>
  );
}
