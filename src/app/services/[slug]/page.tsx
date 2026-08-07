import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, X } from "lucide-react";

import { SERVICES } from "@/lib/content/services";
import { getFeaturedProjects, getFeaturedTestimonials } from "@/lib/db/queries";
import { Display, Heading, Body, Label, Numeral } from "@/components/foundation/typography";
import { DatumLine } from "@/components/foundation/datum-line";
import { Icon } from "@/components/foundation/icon";
import { ProcessStep } from "@/components/domain/process-step";
import { ProjectCard } from "@/components/domain/project-card";
import { TestimonialCard } from "@/components/domain/testimonial-card";
import { FAQItem } from "@/components/domain/faq-item";
import { BeforeAfter } from "@/components/domain/before-after";
import { MaterialSwatch } from "@/components/domain/material-swatch";
import { MiniEstimator } from "@/components/home/mini-estimator";
import { SectionHeader } from "@/components/sections/section-header";
import { CTABand } from "@/components/sections/cta-band";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};

  return {
    title: `${service.name} in Bhopal | ${service.metaTitle}`,
    description: service.metaDescription,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const projects = await getFeaturedProjects(3);
  const testimonials = await getFeaturedTestimonials(2);

  // Renovation Occupancy Timeline data (design.md J-06)
  const occupancyTimeline = [
    { period: "Weeks 1 – 3", status: "High Noise & Dust", access: "Kitchen unusable; demolition & masonry underway", safeToLive: false },
    { period: "Weeks 4 – 6", status: "Services & Plumbing", access: "One bathroom available; electrical rough-in active", safeToLive: true },
    { period: "Weeks 7 – 9", status: "Tiling & Flooring", access: "Living area restricted; master bedroom accessible", safeToLive: true },
    { period: "Weeks 10 – 12", status: "Final Painting & Joinery", access: "Full house accessible; deep cleaning & handover", safeToLive: true },
  ];

  // FAQPage JSON-LD
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="flex flex-col">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. HERO (Asymmetric) */}
      <section className="border-b border-border bg-bg-surface py-16 md:py-24">
        <div className="container-main">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <DatumLine label={`SERVICE / ${service.name.toUpperCase()}`} className="mb-4" />
              <Display as="h1" size="xxl" className="tracking-tight">
                {service.headline}
              </Display>
              <Body size="lg" className="mt-6 text-fg-secondary">
                {service.definition}
              </Body>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild variant="primary" size="lg">
                  <NextLink href={`/estimate?type=${service.estimatorType}`}>
                    Get a cost estimate
                    <Icon icon={ArrowRight} size={20} className="ml-2" />
                  </NextLink>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <NextLink href="#pricing">See 3 pricing tiers</NextLink>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-basalt-100 hairline">
                <Image
                  src={`/photos/service-1.jpg`}
                  alt={service.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IS THIS YOU? (Scenarios) */}
      <section className="border-b border-border bg-basalt-100/50 py-16 dark:bg-basalt-900/50">
        <div className="container-main">
          <SectionHeader
            label="CLIENT SCENARIOS"
            title="Is this you?"
            body="Self-identification beats feature lists. Common situations our clients bring to us:"
          />

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {service.scenarios.map((scenario, i) => (
              <div
                key={scenario.title}
                className="flex flex-col rounded-md bg-bg p-6 hairline"
              >
                <span className="font-mono text-caption text-brass-700 dark:text-brass-400">
                  SCENARIO 0{i + 1}
                </span>
                <Heading as="h3" size="sm" className="mt-3">
                  &ldquo;{scenario.title}&rdquo;
                </Heading>
                <Body size="sm" className="mt-3 text-fg-secondary">
                  {scenario.body}
                </Body>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INCLUDED / EXCLUDED (Equal Visual Weight) */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <SectionHeader
            label="SCOPE BOUNDARIES"
            title="Scope Inclusions & Exclusions"
            body="Two adjacent columns of equal visual weight. We publish what is NOT included so there are zero mid-project surprises."
          />

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* INCLUDED */}
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-8 dark:bg-emerald-950/10">
              <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Icon icon={Check} size={20} />
                </div>
                <Heading as="h3" size="md" className="text-emerald-900 dark:text-emerald-100">
                  What IS Included
                </Heading>
              </div>
              <ul className="mt-6 flex flex-col gap-4">
                {service.included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Icon icon={Check} size={20} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-sans text-body-md text-fg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* EXCLUDED */}
            <div className="rounded-md border border-rose-500/20 bg-rose-500/5 p-8 dark:bg-rose-950/10">
              <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <Icon icon={X} size={20} />
                </div>
                <Heading as="h3" size="md" className="text-rose-900 dark:text-rose-100">
                  What IS NOT Included
                </Heading>
              </div>
              <ul className="mt-6 flex flex-col gap-4">
                {service.excluded.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Icon icon={X} size={20} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span className="font-sans text-body-md text-fg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICE TIERS */}
      <section id="pricing" className="border-t border-border bg-basalt-100/50 py-16 md:py-24 dark:bg-basalt-900/50">
        <div className="container-main">
          <SectionHeader
            label="PRICING TIERS"
            title="Three Specification Tiers"
            body="Structure and engineering safety are identical across all tiers. Tiers define material brands, warranties, and joinery customisation."
          />

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {service.tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-md bg-bg p-8 hairline ${
                  tier.recommended ? "ring-2 ring-brass-500" : ""
                }`}
              >
                {tier.recommended && (
                  <span className="absolute -top-3 left-6 rounded-full bg-brass-500 px-3 py-1 font-mono text-caption text-basalt-950 font-medium">
                    RECOMMENDED
                  </span>
                )}

                <Heading as="h3" size="md">
                  {tier.name} Tier
                </Heading>

                <div className="mt-4">
                  <Numeral size="xl" className="text-fg">
                    ₹{tier.rateMin.toLocaleString("en-IN")} – ₹{tier.rateMax.toLocaleString("en-IN")}
                  </Numeral>
                  <span className="font-sans text-body-sm text-fg-muted ml-1">/ sq ft</span>
                </div>

                <Body size="sm" className="mt-3 text-fg-secondary">
                  {tier.audience}
                </Body>

                <div className="my-6 border-t border-border" />

                <Label className="block mb-3">5 DEFINING SPECIFICATIONS</Label>
                <ul className="flex flex-col gap-3 flex-1">
                  {tier.specifications.map((spec) => (
                    <li key={spec} className="flex items-start gap-2 text-body-sm text-fg">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-border">
                  <Label className="block text-fg-muted">TYPICAL EXAMPLE (1,500 SQ FT)</Label>
                  <Numeral size="md" className="mt-1 block text-brass-700 dark:text-brass-400">
                    ₹{((tier.rateMin * service.exampleArea) / 100000).toFixed(1)} L – ₹
                    {((tier.rateMax * service.exampleArea) / 100000).toFixed(1)} L
                  </Numeral>

                  <Button asChild className="mt-6 w-full" variant={tier.recommended ? "accent" : "secondary"}>
                    <NextLink href={`/estimate?type=${service.estimatorType}`}>
                      Estimate this tier
                    </NextLink>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHAT YOU AVOID (Loss-framed panel R-06) */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <SectionHeader
            label="PERSUASION ENGINE"
            title="What You Avoid"
            body="What a cheaper quote usually costs later. Loss framing behind low initial estimates:"
          />

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {service.avoid.map((item) => (
              <div key={item.title} className="flex flex-col rounded-md bg-bg p-6 hairline border-l-4 border-l-rose-500">
                <Heading as="h4" size="sm" className="text-fg">
                  {item.title}
                </Heading>
                <Body size="sm" className="mt-3 flex-1 text-fg-secondary">
                  {item.consequence}
                </Body>
                <div className="mt-6 pt-4 border-t border-border">
                  <Label className="block text-rose-600 dark:text-rose-400">ESTIMATED REPAIR IMPACT</Label>
                  <Numeral size="md" className="mt-1 block text-rose-600 dark:text-rose-400">
                    + ₹{(item.rupeeImpact / 1000).toLocaleString("en-IN")}k
                  </Numeral>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL MODULE: OCCUPANCY TIMELINE (FOR RENOVATION ONLY J-06) */}
      {slug === "home-renovation" && (
        <section className="border-t border-border bg-basalt-900 py-16 text-basalt-050 dark:bg-basalt-950">
          <div className="container-main">
            <SectionHeader
              label="DISRUPTION MANAGEMENT"
              title="Occupancy Timeline — Room-by-Room Functionality"
              body="Know which parts of your home remain usable in which weeks of renovation."
            />

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {occupancyTimeline.map((item) => (
                <div key={item.period} className="rounded-md bg-basalt-800 p-6 hairline">
                  <span className="font-mono text-caption text-brass-400">{item.period}</span>
                  <Heading as="h4" size="sm" className="mt-2 text-basalt-100">
                    {item.status}
                  </Heading>
                  <Body size="sm" className="mt-3 text-basalt-300">
                    {item.access}
                  </Body>
                  <div className="mt-6 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.safeToLive ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    <span className="font-mono text-caption text-basalt-400">
                      {item.safeToLive ? "Safe for partial stay" : "Relocation advised"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. PROCESS STEPS */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container-main max-w-4xl">
          <SectionHeader
            label="WORKFLOW"
            title={`The ${service.name} Process`}
            body="Step-by-step sequence with explicit durations and payment milestones."
          />

          <div className="mt-12 flex flex-col gap-6">
            {service.process.map((step) => (
              <ProcessStep
                key={step.step}
                step={{
                  number: `0${step.step}`,
                  title: step.title,
                  body: step.body,
                  durationDays: parseInt(step.duration) * 7 || 14,
                  paymentPoint: step.paymentPoint,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. WORK (Filtered Projects) */}
      {projects.length > 0 && (
        <section className="border-t border-border bg-basalt-100/50 py-16 md:py-24 dark:bg-basalt-900/50">
          <div className="container-main">
            <SectionHeader
              label="RECENT WORK"
              title={`Recent ${service.name} Projects`}
              body="Filterable project case studies with published durations and cost context."
            />

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {projects.map((project, idx) => (
                <ProjectCard
                  key={project.slug}
                  href={`/work/${project.slug}`}
                  index={`0${idx + 1}`}
                  category={project.scope.toUpperCase()}
                  title={project.title}
                  locality={project.locality}
                  areaSqft={project.builtUpArea}
                  year={project.completionYear}
                  scope={project.scope}
                  image={{ src: project.heroImage.url || "/photos/project-1.jpg", alt: project.heroImage.alt || project.title }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. MATERIALS SWATCHES */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <SectionHeader
            label="MATERIAL PALETTE"
            title="Tested Materials & Brands"
            body="Sample bill of materials used in our Signature and Bespoke tiers for this service."
          />

          <div className="mt-12 flex flex-wrap gap-8">
            <MaterialSwatch
              material={{
                name: "Ultratech OPC 53 Grade",
                brand: "Ultratech",
                grade: "Grade 53 Structural",
                image: { src: "/photos/material-1.jpg", alt: "Ultratech Cement" },
              }}
            />
            <MaterialSwatch
              material={{
                name: "Tata Tiscon Fe550D TMT",
                brand: "Tata Tiscon",
                grade: "Fe550D Ductile",
                image: { src: "/photos/material-2.jpg", alt: "Tata Tiscon Steel" },
              }}
            />
            <MaterialSwatch
              material={{
                name: "Grohe Eurosmart Fittings",
                brand: "Grohe",
                grade: "Chrome Brass",
                image: { src: "/photos/material-3.jpg", alt: "Grohe CP Fittings" },
              }}
            />
            <MaterialSwatch
              material={{
                name: "Saint-Gobain Gyproc 12.5mm",
                brand: "Saint-Gobain",
                grade: "Moisture Resistant",
                image: { src: "/photos/material-4.jpg", alt: "Saint-Gobain Gyproc" },
              }}
            />
          </div>
        </div>
      </section>

      {/* 9. BEFORE/AFTER */}
      <section className="border-t border-border bg-basalt-100/50 py-16 md:py-24 dark:bg-basalt-900/50">
        <div className="container-main max-w-4xl">
          <SectionHeader
            label="BEFORE & AFTER"
            title="Real Transformation Proof"
            body="Drag the handle to inspect before and after closure. Every pair carries cost and duration context."
          />

          <div className="mt-12">
            <BeforeAfter
              before={{ src: "/photos/before.jpg", alt: "Before renovation" }}
              after={{ src: "/photos/after.jpg", alt: "After renovation" }}
              caption="Kitchen re-planned, 128 sq ft · ₹4.6 L · 5 weeks"
            />
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container-main">
            <SectionHeader
              label="TESTIMONIALS"
              title="Client Feedback"
              body="Verifiable reviews linked to actual completed projects."
            />

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
              {testimonials.map((t) => (
                <TestimonialCard
                  key={t.clientName}
                  testimonial={{
                    quote: t.quote,
                    clientName: t.clientName,
                    projectLabel: [t.projectTitle, t.locality].filter(Boolean).join(", "),
                    projectHref: t.projectHref,
                    date: new Date(t.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
                    rating: (Math.min(5, Math.max(1, t.rating || 5)) as 1 | 2 | 3 | 4 | 5),
                    verified: t.verified,
                    sourceUrl: t.sourceUrl,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. FAQS */}
      <section className="border-t border-border py-16 md:py-24">
        <div className="container-main max-w-3xl">
          <SectionHeader
            label="FAQS"
            title="Service FAQs"
            body="Specific answers to operational and contractual questions."
          />

          <div className="mt-12 flex flex-col gap-4">
            {service.faqs.map((faq) => (
              <FAQItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* 12. INLINE ESTIMATOR */}
      <section className="border-t border-border bg-basalt-100/50 py-16 md:py-24 dark:bg-basalt-900/50">
        <div className="container-main max-w-3xl">
          <SectionHeader
            label="INLINE ESTIMATOR"
            title={`Estimate Your ${service.name} Project`}
            body="Calculate a deterministic price range ungated before contact details."
          />

          <div className="mt-12 rounded-md bg-bg p-8 hairline">
            <MiniEstimator />
          </div>
        </div>
      </section>

      {/* 13. CTA BAND */}
      <CTABand
        rung={5}
        headline={`Ready to discuss your ${service.name} project?`}
        body="Schedule a free site visit with our project engineer."
        actions={
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="accent" size="lg">
              <NextLink href="/contact">Book a site visit</NextLink>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <NextLink href="/estimate">Get a cost estimate</NextLink>
            </Button>
          </div>
        }
      />
    </div>
  );
}
