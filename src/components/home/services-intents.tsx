import NextLink from "next/link";
import { ArrowRight } from "lucide-react";

import { Section, SectionHeader } from "@/components/sections/section-header";
import { SERVICE_GROUPS } from "@/lib/navigation";
import { Icon } from "@/components/foundation/icon";
import { Heading, Body, Numeral, Datum } from "@/components/foundation/typography";

/* design.md §4.1 S06 — "Services, as intents."
 *
 * "Grouping by intent rather than listing nine services is THE SINGLE BIGGEST IA
 * IMPROVEMENT OVER COMPETITORS. A first-time builder does not know whether they
 * need 'turnkey' or 'construction' — but they knows they have a plot."
 *
 * Hence the plain-language question sits ABOVE the group name, and the service
 * links sit under it. The oversized numeral behind each column is §4.1's
 * specified treatment: display-lg in basalt-200, decorative and aria-hidden.
 */

const FROM_RATES: Record<string, string> = {
  build: "₹1,850",
  transform: "₹1,100",
  finish: "₹1,400",
};

export function ServicesAsIntents() {
  return (
    <Section rhythm="standard">
      <SectionHeader
        index="04"
        label="Services"
        title="Start from what you have, not from what it's called."
      />

      {/* §7.7 S06 "Service columns": M1, stagger 80ms, top 85%.
        * The oversized numerals are listed as M3 at -4%, but they sit inside
        * the same column as the text; parallaxing them would drag the copy.
        * They stay static — §7.2 caps M3 at 2 elements per page and the hero
        * already claims one. */}
      <div
        data-motion="M1"
        data-motion-children=":scope > *"
        data-motion-stagger="80"
        className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8"
      >
        {SERVICE_GROUPS.map((group, index) => (
          <div key={group.key} className="relative">
            {/* The oversized numeral, sitting behind the content. */}
            <Numeral
              aria-hidden="true"
              size="xl"
              className="pointer-events-none absolute -top-6 right-0 select-none text-basalt-200 dark:text-basalt-800"
            >
              {String(index + 1).padStart(2, "0")}
            </Numeral>

            <div className="relative">
              {/* The visitor's own words come first. */}
              <Datum className="block normal-case text-brass-700 dark:text-brass-300">
                &ldquo;{group.intent}&rdquo;
              </Datum>

              <Heading as="h3" size="lg" className="mt-3">
                {group.label}
              </Heading>

              <div className="datum-rule mt-6" />

              <ul className="mt-6 flex flex-col gap-4">
                {group.services.map((service) => (
                  <li key={service.href}>
                    <NextLink
                      href={service.href}
                      className="group flex min-h-target items-start justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <span className="min-w-0">
                        <span className="block font-sans text-body-md text-fg transition-colors duration-fast group-hover:text-brass-700 dark:group-hover:text-brass-300">
                          {service.label}
                        </span>
                        <span className="mt-0.5 block font-sans text-caption text-fg-muted">
                          {service.description}
                        </span>
                      </span>
                      <Icon
                        icon={ArrowRight}
                        size={16}
                        className="mt-1 shrink-0 text-fg-muted transition-transform duration-fast group-hover:translate-x-0.5"
                      />
                    </NextLink>
                  </li>
                ))}
              </ul>

              {/* §4.1 — "From ₹x/sq ft" per group. A number, not an adjective. */}
              <Body size="sm" measure={false} className="mt-6 font-mono tabular">
                From {FROM_RATES[group.key]}/sq ft
              </Body>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
