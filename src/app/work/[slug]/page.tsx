import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Download, Share2 } from "lucide-react";

import { SiteShell } from "@/components/shell/site-shell";
import { Section, SectionHeader } from "@/components/sections/section-header";
import { CTABand } from "@/components/sections/cta-band";
import { BeforeAfter } from "@/components/domain/before-after";
import { BehindTheWall } from "@/components/domain/behind-the-wall";
import { GalleryMasonry } from "@/components/domain/gallery-masonry";
import { MaterialSwatch } from "@/components/domain/material-swatch";
import { ProjectCard } from "@/components/domain/project-card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Icon } from "@/components/foundation/icon";
import {
  Display,
  Heading,
  Body,
  Datum,
  Caption,
  Numeral,
} from "@/components/foundation/typography";
import { whatsappLink } from "@/lib/navigation";
import {
  getProject,
  getProjectSlugs,
  getRelatedProjects,
  getSiteSettings,
  type ProjectDetail,
} from "@/lib/db/queries";

/* design.md §4.4 — PROJECT DETAIL.
 *
 * "The most important page on the site for a researching visitor. Structured as
 * an editorial case study."
 *
 * FR-PROJ-01 is the governing rule: 13 sections, "each conditionally omitted if
 * its data is absent — THE PAGE MUST NEVER SHOW AN EMPTY SECTION."
 *
 * Every section below is therefore guarded on the data it renders, not on a
 * flag. `npm run seed:dev` produces six fixtures with varied completeness;
 * /work/wakad-flat-refresh is the sparse one and must render only 4 of the 13.
 */

export const revalidate = 3600; // NFR-PERF-08

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found — ZYVORA" };

  return {
    title: `${project.title} — ${project.locality}, ZYVORA`,
    description: `${project.builtUpArea.toLocaleString("en-IN")} sq ft ${project.scope.toLowerCase()} in ${project.locality}, completed ${project.completionYear}. Planned against actual duration published.`,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [project, settings] = await Promise.all([
    getProject(slug),
    getSiteSettings(),
  ]);

  if (!project) notFound();

  const related = await getRelatedProjects(project, 3);
  const phoneE164 = settings?.phoneE164 ?? "+919876543210";

  return (
    <SiteShell
      phoneE164={phoneE164}
      rating={{ value: 4.9, count: 61 }}
      whatsappContext={`${project.title} project`}
      dockPerson={{
        firstName: "Priya",
        role: "Client Relations",
        responseNote: "usually replies in 20 minutes",
      }}
    >
      {/* ══ 1 · HERO ═══════════════════════════════════════════════════════
       * §4.4: full-bleed image at 70svh, overlaid bottom-left with the datum
       * line, project name and the locality/area/year caption.
       * Always present — heroImage is required by DM-01. */}
      <div data-header-dark>
        {/* §7.7 project §1 "Hero image": M3 at -8%, scrub 0.6. */}
        <section
          data-motion="M3"
          data-motion-parallax="8"
          className="relative h-hero-project min-h-100 w-full overflow-hidden bg-basalt-900"
        >
          <Image
            src={project.heroImage.url}
            alt={project.heroImage.alt}
            fill
            sizes="100vw"
            quality={72}
            /* The LCP element on this page. NFR-PERF-01 budgets LCP under 2.0s,
             * and priority is what stops Next lazy-loading the one image the
             * metric is measured against. */
            priority
            className="object-cover"
          />
          {/* §4.4 — scrim gradient at the bottom so the overlay text holds its
           * contrast regardless of what the photograph is doing (§9.4). */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-basalt-950 via-basalt-950/40 to-transparent"
          />

          <div className="container-base absolute inset-x-0 bottom-0 pb-12">
            <Datum className="block text-brass-300">
              {project.scope.toUpperCase()}
            </Datum>
            <Display as="h1" size="lg" className="mt-3 text-basalt-050">
              {project.title}
            </Display>
            <Caption className="mt-3 text-basalt-300">
              {project.locality} ·{" "}
              <span className="font-mono tabular">
                {project.builtUpArea.toLocaleString("en-IN")}
              </span>{" "}
              sq ft ·{" "}
              <span className="font-mono tabular">{project.completionYear}</span>
            </Caption>
          </div>
        </section>
      </div>

      <div className="container-base py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Work", href: "/work" },
            { label: project.title, href: `/work/${project.slug}` },
          ]}
        />
      </div>

      {/* §4.4 sticky rail at ≥1280. §4.17: "the desktop sticky rail has NO
       * mobile equivalent. Its actions become an inline row after the gallery."
       * Below xl the rail collapses and the row (further down) takes over. */}
      <div className="container-base xl:grid xl:grid-cols-12 xl:gap-8">
        <div className="xl:col-span-9">
          {/* ══ 2 · FACT TABLE ═══════════════════════════════════════════
           * §4.4: "PLANNED VS ACTUAL DURATION SIDE BY SIDE IS THE TRUST
           * PAYLOAD" (FR-PROJ-02). Blueprint surface — §2.1.1 makes the colour
           * itself the signal that this is engineering output, not marketing. */}
          <FactTable project={project} />

          {/* ══ 3 · THE BRIEF ════════════════════════════════════════════
           * Omitted unless BOTH halves exist — the query only sets `brief` when
           * clientProblem and ourApproach are both present, because a heading
           * over one empty column is the empty section FR-PROJ-01 forbids. */}
          {project.brief ? (
            <Section rhythm="standard" container="full" className="px-0">
              <SectionHeader index="01" label="The brief" title="What they asked for." />
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-12">
                <div className="md:col-span-5">
                  <Heading as="h3" size="lg">
                    {project.brief.clientProblem}
                  </Heading>
                </div>
                <div className="md:col-span-6 md:col-start-7">
                  <Body size="md">{project.brief.ourApproach}</Body>
                </div>
              </div>
            </Section>
          ) : null}

          {/* ══ 4 · DRAWINGS ═════════════════════════════════════════════
           * §0.3 layer 3 / §4.4: "This is THE DIFFERENTIATOR LAYER and costs
           * nothing — the CAD already exists." Omitted when absent.
           * Fixture check: aund­h-row-house has none. */}
          {project.drawings.length > 0 ? (
            <Section rhythm="standard" container="full" className="px-0">
              <SectionHeader
                index="02"
                label="Drawings"
                title="The plan, as drawn."
              />
              {/* §7.7 project §4: stroke-dashoffset draw, 1400ms, stagger
                * 200ms, once — "THE SIGNATURE MOMENT OF THE PAGE". It only
                * fires on inline SVG; raster drawings fall back to M1 so the
                * section still enters rather than sitting inert. */}
              <div
                data-motion="M1"
                data-motion-children=":scope > figure"
                data-motion-stagger="200"
                data-motion-start="top 75%"
                className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                {project.drawings.map((drawing, index) => (
                  <figure
                    key={`${drawing.type}-${index}`}
                    className="overflow-hidden rounded-md bg-basalt-900"
                  >
                    <div className="relative aspect-4/3 w-full">
                      <Image
                        src={drawing.url}
                        alt={drawing.alt}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        quality={72}
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="p-4">
                      <Datum className="text-brass-300">
                        {drawing.type}
                        {drawing.floor !== undefined
                          ? ` · Floor ${drawing.floor}`
                          : ""}
                      </Datum>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Section>
          ) : null}

          {/* ══ 5 · BEFORE / AFTER ═══════════════════════════════════════
           * §4.4: 2–4 pairs with cost and duration captions.
           * Fixture check: kothrud-terrace-flat has none. */}
          {project.beforeAfter.length > 0 ? (
            <Section rhythm="standard" container="full" className="px-0">
              <SectionHeader
                index="03"
                label="Before / after"
                title="What changed, and what it cost."
              />
              <div className="mt-10 flex flex-col gap-12">
                {project.beforeAfter.map((pair, index) => (
                  <BeforeAfter
                    key={index}
                    before={{ src: pair.before.url, alt: pair.before.alt }}
                    after={{ src: pair.after.url, alt: pair.after.alt }}
                    caption={pair.caption}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {/* ══ 6 · BEHIND THE WALL ══════════════════════════════════════
           * §0.8 ranks this the most defensible differentiator on the site.
           * Fixture check: bavdhan-kitchen and wakad-flat-refresh have none. */}
          {project.behindTheWall.length > 0 ? (
            <Section rhythm="standard" container="full" className="px-0">
              <BehindTheWall
                index="04"
                label="What you won't see again"
                items={project.behindTheWall.map((item) => ({
                  image: { src: item.url, alt: item.alt },
                  title: item.caption,
                  specification: item.specification,
                  capturedAt: item.capturedAt
                    ? new Date(item.capturedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })
                    : "",
                }))}
              />
            </Section>
          ) : null}

          {/* ══ 7 · GALLERY ══════════════════════════════════════════════ */}
          {project.gallery.length > 0 ? (
            <Section rhythm="standard" container="full" className="px-0">
              <SectionHeader index="05" label="Gallery" title="The finished rooms." />
              {/* §7.7 project §7 "Gallery": M1 batch, stagger 50ms, top 90%. */}
              <div
                data-motion="M1"
                data-motion-batch=""
                data-motion-children="figure, img"
                data-motion-stagger="50"
                data-motion-start="top 90%"
                className="mt-10"
              >
                <GalleryMasonry
                  images={project.gallery.map((image) => ({
                    src: image.url,
                    alt: image.alt,
                    caption: image.caption,
                  }))}
                />
              </div>
            </Section>
          ) : null}

          {/* ══ 8 · MATERIALS ════════════════════════════════════════════
           * Fixture check: bavdhan-kitchen and wakad-flat-refresh have none. */}
          {project.materials.length > 0 ? (
            <Section rhythm="standard" container="full" className="px-0">
              <SectionHeader
                index="06"
                label="Materials"
                title="Named by brand and grade."
              />
              <div className="mt-10 grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {project.materials.map((material) => (
                  <MaterialSwatch
                    key={material.slug}
                    material={{
                      name: material.name,
                      brand: material.brand,
                      grade: material.grade,
                      image: {
                        src: material.macroImage.url,
                        alt: material.macroImage.alt,
                      },
                      href: `/materials#${material.slug}`,
                    }}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {/* ══ 9 · TIMELINE ═════════════════════════════════════════════
           * Fixture check: bavdhan-kitchen and wakad-flat-refresh have none. */}
          {project.timeline.length > 0 ? (
            <Section rhythm="standard" container="full" className="px-0">
              <SectionHeader index="07" label="Timeline" title="Actual dates." />
              {/* §7.7 project §9 "Timeline": M2, the rule draws along the
                * timeline. Scrubbed in the map; fired once here, because a
                * 4-item strip finishes drawing before a scrub would even
                * engage on a short page. */}
              <ol
                data-motion="M2"
                data-motion-children=".datum-rule"
                data-motion-stagger="120"
                className="mt-10 flex flex-col gap-8 lg:flex-row lg:gap-6"
              >
                {project.timeline.map((milestone) => (
                  <li key={milestone.label} className="flex-1">
                    <div className="datum-rule bg-accent" />
                    <Datum className="mt-3 block text-brass-600 dark:text-brass-300">
                      {milestone.date
                        ? new Date(milestone.date).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </Datum>
                    <Heading as="h3" size="sm" className="mt-2">
                      {milestone.label}
                    </Heading>
                    {milestone.note ? (
                      <Body size="sm" className="mt-2">
                        {milestone.note}
                      </Body>
                    ) : null}
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}

          {/* §4.17 — the mobile/tablet action row replacing the sticky rail.
           * Sits after the gallery, exactly where §4.17 places it. */}
          <div className="flex flex-wrap gap-3 border-y border-hairline py-6 xl:hidden">
            <Button variant="secondary" size="md">
              Save to shortlist
            </Button>
            <Button
              variant="ghost"
              size="md"
              iconLeading={<Icon icon={Share2} size={20} />}
            >
              Share
            </Button>
            <Button
              variant="ghost"
              size="md"
              iconLeading={<Icon icon={Download} size={20} />}
            >
              Download the spec sheet
            </Button>
          </div>
        </div>

        {/* §4.4 sticky rail — xl and up only. */}
        <aside className="hidden xl:col-span-3 xl:block">
          <div className="sticky top-24 flex flex-col gap-4 border-l border-hairline pl-6">
            <Datum>At a glance</Datum>
            <dl className="flex flex-col gap-3">
              <RailFact label="Area" value={`${project.builtUpArea.toLocaleString("en-IN")} sq ft`} />
              <RailFact label="Locality" value={project.locality} />
              <RailFact label="Completed" value={String(project.completionYear)} />
            </dl>

            <div className="mt-2 flex flex-col gap-2">
              <Button variant="secondary" size="md">
                Save to shortlist
              </Button>
              <Button
                variant="ghost"
                size="md"
                iconLeading={<Icon icon={Download} size={20} />}
              >
                Download the spec sheet
              </Button>
              {/* FR-GBL-05 — WhatsApp prefilled with the project name. */}
              <Button asChild variant="whatsapp" size="md">
                <a
                  href={whatsappLink(phoneE164, `${project.title} project`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ask about this project
                </a>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* ══ 10 · CLIENT TESTIMONIAL ══════════════════════════════════════
       * §4.4: full-width on basalt-900, single quote at display-lg.
       * Fixture check: pashan-duplex and wakad-flat-refresh have none. */}
      {project.testimonial ? (
        <section className="bg-basalt-900 py-section-feature">
          {/* §7.7 project §10 "Testimonial": M1, top 80%. */}
          <div
            data-motion="M1"
            data-motion-start="top 80%"
            className="container-narrow text-center"
          >
            <Display as="blockquote" size="lg" className="mx-auto text-basalt-050">
              &ldquo;{project.testimonial.quote}&rdquo;
            </Display>
            <Caption className="mt-8 text-basalt-300">
              {project.testimonial.clientName}
              {project.testimonial.locality
                ? ` · ${project.testimonial.locality}`
                : ""}
            </Caption>
            {/* R-02 / §3.13 — a testimonial without verifiable provenance is
             * rendered in a demoted style rather than given a false badge. */}
            {project.testimonial.verified && project.testimonial.sourceUrl ? (
              <a
                href={project.testimonial.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-sans text-caption text-brass-300 underline-wipe"
              >
                Verified Google review ↗
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ══ 11 · COST CONTEXT ════════════════════════════════════════════
       * §4.4 calls this "THE HIGHEST-CONVERTING MODULE ON THE PAGE — the
       * visitor is already imagining themselves in this project."
       * Needs a published per-sq-ft figure, so it is omitted when the client
       * has not permitted one (DM-01 makes actualCostPerSqft nullable).
       * Fixture check: wakad-flat-refresh has none. */}
      {project.actualCostPerSqft ? (
        <section className="bg-blueprint-700 py-section">
          <div className="container-narrow">
            <Datum className="block text-blueprint-300">08 — Cost context</Datum>
            <Heading as="h2" size="lg" className="mt-4 text-basalt-050">
              This project cost{" "}
              <Numeral size="md" className="text-brass-300">
                ₹{project.actualCostPerSqft.toLocaleString("en-IN")}
              </Numeral>{" "}
              per sq ft in {project.completionYear}.
            </Heading>
            <Body size="md" className="mt-4 text-blueprint-100">
              Run the estimator for today&rsquo;s range on a similar build. You
              see the number, the breakdown and the exclusions before we ask for
              anything.
            </Body>
            <Button asChild variant="accent" size="lg" className="mt-8">
              <NextLink
                href={`/estimate?projectType=${project.type}&area=${project.builtUpArea}&city=Pune`}
              >
                Estimate this project
              </NextLink>
            </Button>
          </div>
        </section>
      ) : null}

      {/* ══ 12 · RELATED ═════════════════════════════════════════════════
       * FR-PROJ-09 — minimum 3, never the current project. */}
      {related.length > 0 ? (
        <Section rhythm="standard">
          <SectionHeader index="09" label="Next" title="Projects like this one." />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {related.map((item, index) => (
              <ProjectCard
                key={item.slug}
                href={`/work/${item.slug}`}
                index={String(index + 1).padStart(2, "0")}
                category={item.scope.toUpperCase()}
                title={item.title}
                locality={item.locality}
                areaSqft={item.builtUpArea}
                year={item.completionYear}
                scope={item.scope}
                image={{ src: item.heroImage.url, alt: item.heroImage.alt }}
                size="sm"
              />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ══ 13 · CTA BAND ════════════════════════════════════════════════
       * §4.4: prefilled with the project name. */}
      <CTABand
        rung={5}
        headline={`Building something like ${project.title}?`}
        body="Send us the plot dimensions or a photo of the room. We'll come back with a plan and a range."
        actions={
          <>
            <Button asChild variant="primary" size="lg">
              <NextLink href="/contact">Book a site visit</NextLink>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <NextLink href="/work">
                See our work
                <Icon icon={ArrowRight} size={20} />
              </NextLink>
            </Button>
          </>
        }
      />
    </SiteShell>
  );
}

/* §4.4 section 2 — the fact table. Rows are omitted individually when their
 * value is absent, so a sparse project shows a shorter table rather than a
 * column of dashes. */
function FactTable({ project }: { project: ProjectDetail }) {
  const facts: { label: string; value: string }[] = [
    { label: "Type", value: project.scope },
    {
      label: "Built-up area",
      value: `${project.builtUpArea.toLocaleString("en-IN")} sq ft`,
    },
  ];

  if (project.plotArea) {
    facts.push({
      label: "Plot area",
      value: `${project.plotArea.toLocaleString("en-IN")} sq ft`,
    });
  }
  facts.push({ label: "Floors", value: String(project.floors) });

  /* FR-PROJ-02 — planned vs actual, side by side. The whole point is that the
   * unflattering case is published too (§3.12), so this renders the real
   * number even when actual exceeded planned. */
  const plannedMonths = (project.plannedDurationDays / 30.44).toFixed(1);
  facts.push({
    label: "Duration",
    value: project.actualDurationDays
      ? `${plannedMonths} planned / ${(project.actualDurationDays / 30.44).toFixed(1)} actual months`
      : `${plannedMonths} months planned`,
  });

  facts.push({ label: "Budget band", value: formatBudget(project.budgetBand) });

  if (project.structuralSystem) {
    facts.push({ label: "Structural system", value: project.structuralSystem });
  }
  if (project.completionDate) {
    facts.push({
      label: "Completed",
      value: new Date(project.completionDate).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    });
  }

  return (
    <section className="bg-technical -mx-5 mt-8 px-5 py-10 md:mx-0 md:rounded-md md:px-8">
      <Datum className="block text-blueprint-500 dark:text-blueprint-300">
        Facts
      </Datum>
      {/* §7.7 project §2 "Fact table rows": M1, stagger 40ms, top 85%. */}
      <dl
        data-motion="M1"
        data-motion-children=":scope > div"
        data-motion-stagger="40"
        className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2"
      >
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex items-baseline justify-between gap-4 border-b border-blueprint-300/40 pb-3"
          >
            <dt className="font-sans text-label uppercase text-blueprint-500 dark:text-blueprint-300">
              {fact.label}
            </dt>
            {/* §2.2.3 — tabular figures so the value column aligns. */}
            <dd className="text-right font-mono text-body-sm tabular text-blueprint-700 dark:text-basalt-050">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function RailFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="font-sans text-label uppercase text-fg-muted">{label}</dt>
      <dd className="font-mono text-body-sm tabular text-fg">{value}</dd>
    </div>
  );
}

function formatBudget(band: string): string {
  const labels: Record<string, string> = {
    "under-25L": "Under ₹25L",
    "25-50L": "₹25–50L",
    "50L-1Cr": "₹50L–1Cr",
    "1Cr+": "₹1Cr+",
  };
  return labels[band] ?? band;
}
