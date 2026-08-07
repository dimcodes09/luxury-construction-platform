import NextLink from "next/link";
import { ArrowRight } from "lucide-react";

import { Section, SectionHeader } from "@/components/sections/section-header";
import { ProjectCard } from "@/components/domain/project-card";
import { Icon } from "@/components/foundation/icon";
import type { ProjectSummary } from "@/lib/db/queries";

/* design.md §4.1 S04 — "Selected work."
 *
 * Desktop: two feature cards then four standard — "an asymmetric rhythm that
 * reads editorial rather than catalogue."
 *
 * Mobile (§4.17): a horizontal scroll-snap carousel showing 1.15 CARDS, because
 * "the cut edge is what tells the user there is more". §9.3 is explicit that
 * carousels use NATIVE scroll-snap, never a JS carousel — better momentum,
 * better accessibility, less code.
 *
 * The heading is deliberately "Six of sixty-one": §4.1 calls this "quantity as
 * a credibility signal without a boastful adjective", which is §1.4 principle 3
 * (numbers over adjectives) applied to a section title.
 */

export function SelectedWork({
  projects,
  totalCount,
}: {
  projects: ProjectSummary[];
  totalCount: number;
}) {
  if (projects.length === 0) return null;

  const [firstFeature, secondFeature, ...rest] = projects;

  return (
    <Section rhythm="standard">
      <SectionHeader
        index="02"
        label="Selected work"
        title={`Six of ${totalCount}.`}
        action={
          <NextLink
            href="/work"
            className="inline-flex items-center gap-2 font-sans text-body-md text-brass-700 underline-wipe focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-brass-300"
          >
            All {totalCount} projects
            <Icon icon={ArrowRight} size={20} />
          </NextLink>
        }
      />

      {/* Mobile: scroll-snap carousel at 1.15 cards.
       * The negative inline margin lets cards bleed to the viewport edge while
       * the page keeps its gutter — without it the "cut edge" signal is lost
       * behind 20px of padding. */}
      <div
        className={[
          "mt-12 -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4",
          // From md up this stops being a carousel and becomes the grid.
          "md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0",
        ].join(" ")}
      >
        {firstFeature ? (
          <div className="peek-card snap-start md:w-auto">
            <ProjectCard
              {...toCardProps(firstFeature, 0)}
              size="lg"
              // §4.1: the hero poster is the LCP element, so nothing below the
              // fold competes for priority.
              priority={false}
            />
          </div>
        ) : null}

        {secondFeature ? (
          <div className="peek-card snap-start md:w-auto">
            <ProjectCard {...toCardProps(secondFeature, 1)} size="lg" />
          </div>
        ) : null}

        {/* The four standard cards continue the same carousel on mobile and
         * become a 4-up row from md. */}
        {rest.map((project, index) => (
          <div
            key={project.slug}
            className="peek-card snap-start md:hidden"
          >
            <ProjectCard {...toCardProps(project, index + 2)} size="md" />
          </div>
        ))}
      </div>

      {rest.length > 0 ? (
        <div
          data-motion="M1"
          data-motion-batch=""
          data-motion-children=":scope > *"
          data-motion-stagger="60"
          data-motion-start="top 88%"
          className="mt-6 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4"
        >
          {rest.map((project, index) => (
            <ProjectCard
              key={project.slug}
              {...toCardProps(project, index + 2)}
              size="md"
            />
          ))}
        </div>
      ) : null}
    </Section>
  );
}

function toCardProps(project: ProjectSummary, index: number) {
  return {
    href: `/work/${project.slug}`,
    index: String(index + 1).padStart(2, "0"),
    category: project.scope.toUpperCase(),
    title: project.title,
    locality: project.locality,
    areaSqft: project.builtUpArea,
    year: project.completionYear,
    scope: project.scope,
    image: { src: project.heroImage.url, alt: project.heroImage.alt },
  };
}
