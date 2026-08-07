import type { Metadata } from "next";
import NextLink from "next/link";
import { ArrowRight } from "lucide-react";

import { SERVICES, ServiceGroupKey } from "@/lib/content/services";
import { Display, Heading, Body, Label, Numeral } from "@/components/foundation/typography";
import { DatumLine } from "@/components/foundation/datum-line";
import { Icon } from "@/components/foundation/icon";
import { ServiceCardDeep } from "@/components/domain/service-card";
import { FAQItem } from "@/components/domain/faq-item";
import { SectionHeader } from "@/components/sections/section-header";
import { CTABand } from "@/components/sections/cta-band";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Construction & Interior Services | Published Rates & Clear Scope",
  description:
    "Explore our 9 specialised construction, renovation, and interior design services in Bhopal. Published per-sq-ft rates, equal-weight exclusions, and transparent contracts.",
};

const GROUP_LABELS: Record<ServiceGroupKey, { title: string; subtitle: string }> = {
  build: {
    title: "01 / BUILD",
    subtitle: "Turnkey structural construction from ground up or comprehensive greenfield builds.",
  },
  transform: {
    title: "02 / TRANSFORM",
    subtitle: "Full-home renovations, interior re-architecture, and major structural re-plans.",
  },
  finish: {
    title: "03 / FINISH",
    subtitle: "Specialised finishing, waterproofing, joinery, and room-specific installations.",
  },
};

const COMPARISON_TABLE_DATA = [
  {
    name: "House Construction",
    href: "/services/house-construction",
    group: "Build",
    scope: "Full RCC structure, blockwork, plaster & turnkey finishing",
    duration: "10 – 14 mos",
    range: "₹1,500 – ₹4,500/sq ft",
    mode: "Turnkey contract only",
  },
  {
    name: "Turnkey Home Solutions",
    href: "/services/turnkey-home-solutions",
    group: "Build",
    scope: "Structure + complete interiors & custom joinery",
    duration: "12 – 16 mos",
    range: "₹1,900 – ₹5,200/sq ft",
    mode: "Turnkey contract only",
  },
  {
    name: "Home Renovation",
    href: "/services/home-renovation",
    group: "Transform",
    scope: "Demolition, re-layout, plumbing, wiring & finishes",
    duration: "6 – 12 wks",
    range: "₹1,200 – ₹3,200/sq ft",
    mode: "Turnkey or major scope",
  },
  {
    name: "Interior Design",
    href: "/services/interior-design",
    group: "Transform",
    scope: "Space planning, custom furniture, lighting & soft finishes",
    duration: "8 – 14 wks",
    range: "₹1,400 – ₹4,800/sq ft",
    mode: "Full flat/villa minimum",
  },
  {
    name: "Modular Kitchen",
    href: "/services/modular-kitchen",
    group: "Finish",
    scope: "Marine ply/HDMR carcases, hardware, countertops & appliances",
    duration: "3 – 5 wks",
    range: "₹1.8 L – ₹8.5 L total",
    mode: "Standalone allowed",
  },
  {
    name: "Waterproofing",
    href: "/services/waterproofing",
    group: "Finish",
    scope: "Concealed wet-area membranes, terrace injection & warranties",
    duration: "1 – 3 wks",
    range: "₹120 – ₹320/sq ft",
    mode: "Standalone allowed",
  },
  {
    name: "Painting",
    href: "/services/painting",
    group: "Finish",
    scope: "12-stage surface prep, moisture testing & 2 coats acrylic/PU",
    duration: "2 – 4 wks",
    range: "₹45 – ₹160/sq ft",
    mode: "Whole-home minimum",
  },
  {
    name: "Electrical Work",
    href: "/services/electrical-work",
    group: "Finish",
    scope: "Load calculation, FR wiring, DB dressing & circuit mapping",
    duration: "2 – 4 wks",
    range: "₹85 – ₹220/sq ft",
    mode: "Full home minimum",
  },
  {
    name: "False Ceiling",
    href: "/services/false-ceiling",
    group: "Finish",
    scope: "GI framing, Saint-Gobain board, acoustic insulation & coving",
    duration: "1 – 3 wks",
    range: "₹110 – ₹280/sq ft",
    mode: "Standalone allowed",
  },
];

const INDEX_FAQS = [
  {
    question: "Why do you publish per-sq-ft rate ranges instead of single quotes?",
    answer:
      "A single rate quote before architectural drawings is either dishonest or naive. Material selections (e.g. Italian marble vs vitrified tiles) and site factors (soil load, access) move costs. We publish realistic bands and exact assumptions so you understand what drives your budget.",
  },
  {
    question: "Do you undertake small standalone jobs like painting a single bedroom?",
    answer:
      "To maintain site supervision quality, we enforce minimum project thresholds. Specialized finishing like waterproofing or modular kitchens can be standalone. Painting and electrical require a full apartment or house minimum.",
  },
  {
    question: "What is the difference between Essential, Signature, and Bespoke tiers?",
    answer:
      "Structure and safety standards are identical across all tiers. Tiers define material specifications, brand tiers (e.g., Jaquar vs Grohe vs Kohler), warranty lengths (1yr vs 3yr vs 5yr), and joinery customisation.",
  },
  {
    question: "How are payment milestones structured?",
    answer:
      "We divide projects into 9 stage-gate payments linked to physical milestones (e.g., plinth completion, slab casting, plaster clearance). You never pay in advance for uncompleted work.",
  },
];

export async function generateStaticParams() {
  return [];
}

export default async function ServicesIndexPage() {
  const groups: ServiceGroupKey[] = ["build", "transform", "finish"];

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SERVICES.map((service, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: service.name,
      description: service.metaDescription,
      url: `https://zyvora.in/services/${service.slug}`,
    })),
  };

  return (
    <div className="flex flex-col">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO */}
      <section className="border-b border-border bg-bg-surface py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-3xl">
            <DatumLine label="OUR OFFERING" className="mb-4" />
            <Display as="h1" size="xxl" className="tracking-tight">
              Nine services. Published rates. Zero hidden costs.
            </Display>
            <Body size="lg" className="mt-6 text-fg-secondary">
              We group our capabilities into three clear intents: Build from scratch, Transform existing homes, or Finish specific spaces. Every service includes explicit scope inclusions, a mandatory non-included list, and published pricing bands.
            </Body>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild variant="primary" size="lg">
                <NextLink href="/estimate">
                  Get a cost estimate
                  <Icon icon={ArrowRight} size={20} className="ml-2" />
                </NextLink>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <NextLink href="/process">Read our 38-step process</NextLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE GROUP BLOCKS */}
      <section className="py-16 md:py-24">
        <div className="container-main flex flex-col gap-24">
          {groups.map((groupKey) => {
            const groupInfo = GROUP_LABELS[groupKey];
            const groupServices = SERVICES.filter((s) => s.group === groupKey);

            return (
              <div key={groupKey} className="flex flex-col gap-12">
                <div className="border-b border-border pb-6">
                  <Heading as="h2" size="xl">
                    {groupInfo.title}
                  </Heading>
                  <Body size="md" className="mt-2 text-fg-secondary">
                    {groupInfo.subtitle}
                  </Body>
                </div>

                <div className="flex flex-col divide-y divide-border">
                  {groupServices.map((service, index) => {
                    const sampleOutcomes: [string, string, string] = [
                      service.scenarios[0]?.title || "Clear line-item BOQ",
                      service.included[0] || "Turnkey supervision",
                      service.tiers[1]?.audience || "Signature specification available",
                    ];

                    return (
                      <ServiceCardDeep
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        title={service.name}
                        body={service.headline + " " + service.definition}
                        outcomes={sampleOutcomes}
                        media={{
                          src: `/photos/service-1.jpg`,
                          alt: service.name,
                        }}
                        ctaLabel="See full scope & pricing →"
                        flip={index % 2 === 1}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. COMPARISON TABLE */}
      <section className="border-t border-border bg-basalt-900 py-16 text-basalt-050 dark:bg-basalt-950">
        <div className="container-main">
          <SectionHeader
            label="TRANSPARENCY MATRIX"
            title="Service Comparison & Operational Boundaries"
            body="Admitting what we do NOT do standalone is our commitment to site supervision quality."
          />

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead>
                <tr className="border-b border-basalt-800 text-basalt-400">
                  <th className="pb-4 font-mono font-medium">Service</th>
                  <th className="pb-4 font-mono font-medium">Group</th>
                  <th className="pb-4 font-mono font-medium">Primary Scope</th>
                  <th className="pb-4 font-mono font-medium">Typical Duration</th>
                  <th className="pb-4 font-mono font-medium">Rate Range</th>
                  <th className="pb-4 font-mono font-medium">Engagement Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-basalt-800">
                {COMPARISON_TABLE_DATA.map((row) => (
                  <tr key={row.name} className="hover:bg-basalt-800/50">
                    <td className="py-4 font-medium text-basalt-100">
                      <NextLink
                        href={row.href}
                        className="hover:text-brass-400 underline-wipe"
                      >
                        {row.name}
                      </NextLink>
                    </td>
                    <td className="py-4 text-basalt-300">{row.group}</td>
                    <td className="py-4 text-basalt-300 max-w-xs">{row.scope}</td>
                    <td className="py-4 text-basalt-300 font-mono">{row.duration}</td>
                    <td className="py-4 font-mono text-brass-400">{row.range}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-basalt-800 px-2.5 py-1 text-caption text-basalt-300">
                        {row.mode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <SectionHeader
            label="SERVICE FAQS"
            title="Frequently Asked Questions about our Services"
            body="Clear answers on contracts, scope boundaries, and warranty commitments."
          />

          <div className="mt-12 max-w-3xl flex flex-col gap-4">
            {INDEX_FAQS.map((faq) => (
              <FAQItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA BAND */}
      <CTABand
        rung={5}
        headline="Ready to estimate your project?"
        body="Get a deterministic price range based on your exact square footage and location."
        actions={
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="accent" size="lg">
              <NextLink href="/estimate">Get a cost estimate</NextLink>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <NextLink href="/contact">Talk to a designer</NextLink>
            </Button>
          </div>
        }
      />
    </div>
  );
}
