import type { Metadata } from "next";
import NextLink from "next/link";
import { Suspense } from "react";

import { SiteShell } from "@/components/shell/site-shell";
import { Section, SectionHeader } from "@/components/sections/section-header";
import { ProjectCard } from "@/components/domain/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/work/filter-bar";
import {
  getFilterOptions,
  getProjects,
  getProjectCount,
  getSiteSettings,
  type WorkFilters,
} from "@/lib/db/queries";

/* design.md §4.3 — PORTFOLIO INDEX.
 *
 * "Objective: let a visitor find a project like theirs in UNDER 20 SECONDS."
 *
 * FR-PORT-02: filter state lives in the URL and the page is FULLY SERVER-RENDERED
 * for any combination. That is what makes results shareable, back-button-safe
 * and indexable (FR-PORT-05).
 *
 * FR-PORT-03: pagination is an explicit `Load more`. "INFINITE SCROLL IS
 * PROHIBITED" — §4.3 gives the reason: it "breaks the footer (which carries our
 * trust band and local SEO links) and destroys the back button. Non-negotiable."
 * Here that is implemented as a link to the next page, so it works without JS.
 */

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Work — ZYVORA",
  description:
    "Every home, office and renovation we have completed in Bhopal, with built-up area, budget band, and planned against actual duration published on each one.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const filters: WorkFilters = {
    type: first(params.type),
    locality: first(params.locality),
    budget: first(params.budget),
    year: first(params.year),
    style: first(params.style),
  };

  const page = Math.max(1, Number(first(params.page) ?? 1) || 1);

  const [settings, filterOptions, result, totalPublished] = await Promise.all([
    getSiteSettings(),
    getFilterOptions(),
    // `Load more` accumulates: page 2 shows 24, not items 13–24. Without this a
    // shared link to page 2 would drop the first twelve results.
    getProjects(filters, { limit: PAGE_SIZE * page, skip: 0 }),
    getProjectCount(),
  ]);

  const { projects, total } = result;
  const hasMore = projects.length < total;

  const nextPageHref = (() => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) next.set(key, value);
    }
    next.set("page", String(page + 1));
    return `/work?${next.toString()}`;
  })();

  return (
    <SiteShell
      phoneE164={settings?.phoneE164 ?? "+919399817681"}
      dockPerson={{
        firstName: "Ghanshyam",
        role: "Founder",
        responseNote: "usually replies in 20 minutes",
      }}
    >
      <Section rhythm="standard" container="wide">
        <SectionHeader
          index="02"
          label="Work"
          title={`${totalPublished} homes, offices and renovations across ${settings?.city ?? "Bhopal"}.`}
        />

        <div className="mt-10">
          {/* useSearchParams needs a Suspense boundary during prerender. */}
          <Suspense fallback={<div className="h-32" />}>
            <FilterBar options={filterOptions} resultCount={total} />
          </Suspense>
        </div>

        {projects.length === 0 ? (
          /* §3.20 — the empty state carries an explanation and ONE action.
           * The copy is §3.20's, verbatim in intent: it states how many
           * projects exist so the visitor knows the filters are the problem. */
          <EmptyState
            title="No projects match those filters yet."
            body={`We've built ${totalPublished} homes — try widening the area range or clearing a filter.`}
            action={
              <Button asChild variant="secondary" size="lg">
                <NextLink href="/work">Clear filters</NextLink>
              </Button>
            }
          />
        ) : (
          <>
            {/* §4.3 — 3-up desktop, 2-up tablet, 1-up mobile (§4.17). */}
            {/* §7.7 portfolio "Card grid, initial": M1 batch, stagger 60ms,
             * once. The Flip-on-filter entry is not wired: filtering is a full
             * server round-trip here (FR-PORT-02), so there is no shared DOM
             * for Flip.from() to interpolate between. */}
            <div
              data-motion="M1"
              data-motion-batch=""
              data-motion-children=":scope > article"
              data-motion-stagger="60"
              className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  href={`/work/${project.slug}`}
                  index={String(index + 1).padStart(2, "0")}
                  category={project.scope.toUpperCase()}
                  title={project.title}
                  locality={project.locality}
                  areaSqft={project.builtUpArea}
                  year={project.completionYear}
                  scope={project.scope}
                  image={{
                    src: project.heroImage.url,
                    alt: project.heroImage.alt,
                  }}
                  // Only the first row is above the fold on any viewport.
                  priority={index < 3}
                />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-16 flex flex-col items-center gap-3">
                {/* A real link, so it works without JavaScript and the URL
                 * stays shareable — FR-PORT-02 and FR-GBL-01. */}
                <Button asChild variant="secondary" size="lg">
                  <NextLink href={nextPageHref} scroll={false}>
                    Load more
                  </NextLink>
                </Button>
                <p className="font-mono text-datum uppercase tabular text-fg-muted">
                  {total - projects.length} more
                </p>
              </div>
            ) : null}
          </>
        )}
      </Section>
    </SiteShell>
  );
}
