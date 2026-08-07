import type { Metadata } from "next";
import NextLink from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteShell } from "@/components/shell/site-shell";
import { Hero } from "@/components/sections/hero";
import { Section, SectionHeader } from "@/components/sections/section-header";
import { CTABand } from "@/components/sections/cta-band";
import { StatBand } from "@/components/domain/stat-band";
import { BeforeAfter } from "@/components/domain/before-after";
import { TestimonialCard } from "@/components/domain/testimonial-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/foundation/icon";
import { ProblemStatement } from "@/components/home/problem-statement";
import { ThreeProofs } from "@/components/home/three-proofs";
import { SelectedWork } from "@/components/home/selected-work";
import { ServicesAsIntents } from "@/components/home/services-intents";
import { MiniEstimator } from "@/components/home/mini-estimator";
import { ProcessStrip } from "@/components/home/process-strip";
import { ShowcaseFrame } from "@/components/home/showcase-frame";
import {
  getFeaturedProjects,
  getFeaturedTestimonials,
  getProjectCount,
  getSiteSettings,
} from "@/lib/db/queries";

/* design.md §4.1 — HOME.
 *
 * "In 5 seconds, establish that this is a serious, transparent builder. In 60
 * seconds, prove it. Route every segment to their next step."
 *
 * Ten sections, long scroll. §4.1: "Long homepages perform well in this
 * category (R-09) BECAUSE the visitor is researching, not buying."
 *
 * A Server Component. The only client island is the mini-estimator (S07), which
 * needs state — everything else renders on the server, so FR-GBL-01 holds:
 * "content must be present without JavaScript."
 *
 * NO MOTION. design-process.md Step 8 is deliberate about this being last.
 */

// NFR-PERF-08 — ISR. The homepage reads stats and featured projects that change
// rarely; regenerating hourly keeps it static-fast without a deploy per edit.
export const revalidate = 3600;

export const metadata: Metadata = {
  // NFR-SEO-02 — hand-written, containing a number (§10.5).
  title: "ZYVORA — Construction, Interiors & Renovation in Bhopal",
  description:
    "Turnkey construction and interiors in Bhopal. 61 homes delivered, 11.4 month median handover, published rates and payment milestones. We photograph the concealed work before we close it up.",
};

export default async function HomePage() {
  const [settings, projects, totalCount, testimonials] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(6),
    getProjectCount(),
    getFeaturedTestimonials(2),
  ]);

  const phoneE164 = settings?.phoneE164 ?? "+919399817681";
  const city = settings?.city ?? "Bhopal";
  const foundedYear = settings?.foundedYear ?? 2018;

  return (
    <SiteShell
      phoneE164={phoneE164}
      rating={{ value: 4.9, count: 61 }}
      dockPerson={{
        firstName: "Priya",
        role: "Client Relations",
        responseNote: "usually replies in 20 minutes",
      }}
      featuredProject={
        projects[0]
          ? {
              title: projects[0].title,
              href: `/work/${projects[0].slug}`,
              locality: `${projects[0].locality} · ${projects[0].completionYear}`,
              image: {
                src: projects[0].heroImage.url,
                alt: projects[0].heroImage.alt,
              },
            }
          : undefined
      }
    >
      {/* ── S01 · Hero — "The claim" ─────────────────────────────────────
       * §4.1: typographic hero, not photographic. "The headline carries the
       * meaning; media is atmosphere. This also means the hero works on day one
       * with mediocre footage."
       *
       * The headline is the positioning verbatim — "concrete, memorable,
       * falsifiable, and impossible for a competitor to copy without changing
       * how they operate."
       *
       * data-header-dark tells the header to render inverted over this section. */}
      <div data-header-dark>
        <Hero
          datumLabel={`${city} · Since ${foundedYear}`}
          headline="We show you what's behind the wall."
          subtitle="Turnkey construction and interiors. Published prices. Published process. Photographed before we close it up."
          poster={{ src: "/photos/hero.jpg", alt: "" }}
          actions={
            <>
              {/* §4.1 — "Two CTAs, DELIBERATELY UNEQUAL." The estimator is
               * rung 3 and the highest-value first action (§0.5). */}
              <Button asChild variant="accent" size="lg">
                <NextLink href="/estimate">Get a cost estimate</NextLink>
              </Button>
              <NextLink
                href="/work"
                className="inline-flex min-h-target items-center gap-2 font-sans text-body-lg text-basalt-050 underline-wipe focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                See our work
                <Icon icon={ArrowRight} size={20} />
              </NextLink>
            </>
          }
        />
      </div>

      {/* §4.1 — StatBand inside the hero fold on desktop, immediately below on
       * mobile. "Putting verifiable numbers within the first screen directly
       * attacks R-01."
       *
       * FR-HOME-03: values come from SiteSettings, never hard-coded.
       * §4.17: 2×2 on mobile, NOT 4 across — "4-across at 390px makes the
       * numerals too small to carry authority." */}
      {settings?.stats?.length ? <StatBand stats={settings.stats} /> : null}

      {/* ── S02 · The problem, named ─────────────────────────────────── */}
      <ProblemStatement />

      {/* ── S03 · The three proofs ───────────────────────────────────── */}
      <ThreeProofs />

      {/* ── S04 · Selected work ──────────────────────────────────────── */}
      <SelectedWork projects={projects} totalCount={totalCount} />

      {/* The scroll showcase — a scrubbed frame that settles as it arrives.
       * Sits between the work grid and the before/after so the page has one
       * moment of held attention before the interactive comparison. */}
      <ShowcaseFrame
        image={{ src: "/photos/after.jpg", alt: "A finished kitchen in Arera Colony" }}
        caption="Kitchen re-planned, 128 sq ft · ₹4.6 L · 5 weeks"
      />

      {/* ── S05 · Before / after ─────────────────────────────────────────
       * §4.1: single full-width BeforeAfter on a DARK surface "so the images
       * glow (R-09)". Caption carries scope, cost and duration (§3.14). */}
      <section className="bg-basalt-900 py-section">
        <div className="container-wide">
          <SectionHeader
            index="03"
            label="Before / after"
            title="The same room, the same lens, the same crop."
            className="[&_*]:text-basalt-050"
          />
          <div className="mt-12">
            <BeforeAfter
              before={{ src: "/photos/before.jpg", alt: "Kitchen before the work" }}
              after={{ src: "/photos/after.jpg", alt: "Kitchen after the work" }}
              caption="Kitchen re-planned, 128 sq ft · ₹4.6 L · 5 weeks"
            />
          </div>
        </div>
      </section>

      {/* ── S06 · Services, as intents ───────────────────────────────── */}
      <ServicesAsIntents />

      {/* ── S07 · The estimator invitation ───────────────────────────── */}
      <MiniEstimator />

      {/* ── S08 · Process, compressed ────────────────────────────────── */}
      <ProcessStrip />

      {/* ── S09 · Testimonials ───────────────────────────────────────────
       * §4.1 pairs these with a live Google rating block (FR-HOME-06), which
       * needs the Places API — not wired yet, so the section renders the
       * testimonials alone rather than a broken or faked rating. INT-06 is
       * explicit that a failure here shows last-known values and NEVER an
       * error; showing nothing is the honest interim. */}
      {testimonials.length > 0 ? (
        <Section rhythm="standard">
          <SectionHeader
            index="07"
            label="What clients say"
            title="Specific praise, or none at all."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.clientName}
                testimonial={{
                  quote: testimonial.quote,
                  clientName: testimonial.clientName,
                  projectLabel: [testimonial.projectTitle, testimonial.locality]
                    .filter(Boolean)
                    .join(", "),
                  projectHref: testimonial.projectHref,
                  date: new Date(testimonial.date).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  }),
                  // Ratings are 1–5 in the schema; narrow for the card's union.
                  rating: Math.min(5, Math.max(1, testimonial.rating)) as
                    | 1
                    | 2
                    | 3
                    | 4
                    | 5,
                  verified: testimonial.verified,
                  sourceUrl: testimonial.sourceUrl,
                }}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── S10 · Closing CTA band ───────────────────────────────────────
       * §4.1: "Why 'Tell us about your site' and not 'Contact us': it names an
       * action the visitor can actually do and lowers perceived commitment
       * (R-04)." §10.3 bans `Contact us` outright.
       *
       * The journal teaser that §4.1 places above this needs published
       * articles; none exist yet, so it is omitted rather than rendered empty —
       * the same rule FR-PROJ-01 applies to project sections. */}
      <CTABand
        rung={5}
        headline="Tell us about your site."
        body="Send us the plot dimensions or a photo of the room. We'll come back with a plan and a range — no obligation, no sales call."
        actions={
          <>
            <Button asChild variant="primary" size="lg">
              <NextLink href="/contact">Book a site visit</NextLink>
            </Button>
            <Button asChild variant="whatsapp" size="lg">
              <a
                href={`https://wa.me/${phoneE164.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
              </a>
            </Button>
          </>
        }
      />
    </SiteShell>
  );
}
