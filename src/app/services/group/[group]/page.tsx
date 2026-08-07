import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Hammer, RefreshCw, Building2, Paintbrush } from "lucide-react";

import { SERVICES, ServiceGroupKey } from "@/lib/content/services";
import { getProjects } from "@/lib/db/queries";
import { Display, Heading, Body } from "@/components/foundation/typography";
import { DatumLine } from "@/components/foundation/datum-line";
import { Icon } from "@/components/foundation/icon";
import { ServiceCardOverview } from "@/components/domain/service-card";
import { ProjectCard } from "@/components/domain/project-card";
import { FAQItem } from "@/components/domain/faq-item";
import { SectionHeader } from "@/components/sections/section-header";
import { CTABand } from "@/components/sections/cta-band";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ group: string }>;
};

const GROUP_META: Record<
  ServiceGroupKey,
  {
    title: string;
    tagline: string;
    description: string;
    icon: typeof Hammer;
    metaTitle: string;
    metaDescription: string;
    faqs: { question: string; answer: string }[];
  }
> = {
  build: {
    title: "Build Services",
    tagline: "Turnkey Structural Construction",
    description:
      "Greenfield home construction and complete turnkey building solutions in Pune. Foundation to handover under one contract, one budget, and one accountable engineer.",
    icon: Building2,
    metaTitle: "Turnkey Home Construction Services in Pune | Build Group",
    metaDescription:
      "Turnkey house construction and greenfield home building services in Pune. Published per-sq-ft rates, 9 payment milestones, and documented site supervision.",
    faqs: [
      {
        question: "What is included in Turnkey Build Services?",
        answer:
          "Everything from excavation, footings, RCC structure, blockwork, plaster, to complete electrical, plumbing, tiling, and interior joinery based on your selected specification tier.",
      },
      {
        question: "How long does a turnkey construction project take?",
        answer:
          "Standard 2,000–3,500 sq ft homes take between 10 to 14 months from site mobilisation. We publish planned vs actual timelines for every completed project.",
      },
    ],
  },
  transform: {
    title: "Transform Services",
    tagline: "Renovation & Structural Re-architecture",
    description:
      "Full-home renovation, interior design, and commercial space transformations. Re-plan your existing footprint with zero structural risk and transparent timeline scheduling.",
    icon: RefreshCw,
    metaTitle: "Home Renovation & Interior Transformation Services in Pune",
    metaDescription:
      "Complete home renovation and interior design services in Pune. Occupancy timeline scheduling, 3D visualisation, and explicit loss-framed avoidance panels.",
    faqs: [
      {
        question: "Can we live in our home during a renovation?",
        answer:
          "For partial renovations, yes. Our Occupancy Timeline maps out exact room-by-room downtime weeks so you know which bathrooms or kitchens remain functional.",
      },
      {
        question: "How are design fees structured for interior transformations?",
        answer:
          "Interior design fees are included in our per-sq-ft turnkey rates or charged as a flat design fee that is 100% credited back when you execute construction with us.",
      },
    ],
  },
  finish: {
    title: "Finish Services",
    tagline: "Specialised Crafts & Installations",
    description:
      "Precision finishing, waterproofing, modular kitchens, painting, and electrical upgrades. Delivered by in-house trained craftsmen with written warranty certificates.",
    icon: Paintbrush,
    metaTitle: "Waterproofing, Modular Kitchen & Painting Services in Pune",
    metaDescription:
      "Specialised finishing services in Pune: waterproofing, modular kitchens, false ceiling, painting, and electrical wiring with written warranties.",
    faqs: [
      {
        question: "Do finish services carry a warranty?",
        answer:
          "Yes. Waterproofing carries up to a 10-year warranty, painting carries 3–5 year warranties depending on exterior/interior acrylic systems, and hardware carries manufacturer guarantees.",
      },
      {
        question: "Can I book a single finish service like waterproofing standalone?",
        answer:
          "Yes, waterproofing, modular kitchens, and false ceiling installations can be booked as standalone projects. Painting and electrical require a full apartment or house minimum.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return [
    { group: "build" },
    { group: "transform" },
    { group: "finish" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  const meta = GROUP_META[group as ServiceGroupKey];
  if (!meta) return {};

  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
  };
}

export default async function ServiceGroupHubPage({ params }: Props) {
  const { group } = await params;
  const groupKey = group as ServiceGroupKey;
  const meta = GROUP_META[groupKey];

  if (!meta) {
    notFound();
  }

  const groupServices = SERVICES.filter((s) => s.group === groupKey);
  const { projects } = await getProjects({}, { limit: 3 });

  return (
    <div className="flex flex-col">
      {/* 1. HERO */}
      <section className="border-b border-border bg-bg-surface py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-3xl">
            <DatumLine label={`SERVICE HUB / ${groupKey.toUpperCase()}`} className="mb-4" />
            <Display as="h1" size="xl" className="tracking-tight">
              {meta.title}
            </Display>
            <Body size="lg" className="mt-6 text-fg-secondary">
              {meta.description}
            </Body>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild variant="primary" size="lg">
                <NextLink href="/estimate">
                  Estimate a {groupKey} project
                  <Icon icon={ArrowRight} size={20} className="ml-2" />
                </NextLink>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <NextLink href="/services">View all 9 services</NextLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES GRID */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <SectionHeader
            label="SERVICES IN THIS HUB"
            title={`${meta.title} Overview`}
            body="Explore individual service specs, scope inclusions, and per-sq-ft pricing."
          />

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {groupServices.map((service) => (
              <ServiceCardOverview
                key={service.slug}
                href={`/services/${service.slug}`}
                icon={meta.icon}
                title={service.name}
                description={service.definition}
                priceFrom={`₹${service.tiers[0].rateMin.toLocaleString("en-IN")}`}
                ctaLabel="See full scope & pricing"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. RELEVANT PROJECT TRIO */}
      {projects.length > 0 && (
        <section className="border-t border-border bg-basalt-100/50 py-16 md:py-24 dark:bg-basalt-900/50">
          <div className="container-main">
            <SectionHeader
              label="FEATURED WORK"
              title={`Recent ${meta.title} Projects`}
              body="Real completed work with published budgets, actual durations, and behind-the-wall photo logs."
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
                  image={{ src: project.heroImage.url || "/dev/project-1.png", alt: project.heroImage.alt || project.title }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. HUB FAQS */}
      <section className="py-16 md:py-24">
        <div className="container-main max-w-3xl">
          <SectionHeader
            label="FAQS"
            title="Hub Questions"
            body={`Common queries regarding our ${groupKey} services and contracting terms.`}
          />

          <div className="mt-12 flex flex-col gap-4">
            {meta.faqs.map((faq) => (
              <FAQItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA BAND */}
      <CTABand
        rung={5}
        headline={`Ready to start your ${groupKey} project?`}
        body="Get a cost estimate in 2 minutes with no login required."
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
