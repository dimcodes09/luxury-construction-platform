import Image from "next/image";
import NextLink from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Datum } from "@/components/foundation/typography";

/* design.md §3.10 — ProjectCard.
 *
 * "METADATA IS THE POINT. Locality, area, year and scope answer 'is this like
 * my project?' — the only question a portfolio visitor is actually asking.
 * Competitor cards show a title and nothing else."
 *
 * So the metadata line is required, not decorative. §2.2.3 puts tabular figures
 * on the area and year so a grid of cards aligns down the column.
 *
 * Sizes are container-query driven, not breakpoint driven — design-process.md
 * §1.4: this card appears in a 3-up grid, a sticky rail and a related strip,
 * and it must respond to ITS OWN width, not the viewport's.
 */

export type ProjectCardProps = {
  href: string;
  /** §3.10 — the drawing-sheet index, e.g. "04". */
  index: string;
  /** e.g. "RESIDENTIAL" — rendered in the datum line beside the index. */
  category: string;
  title: string;
  locality: string;
  areaSqft: number;
  year: number;
  /** e.g. "Construction + Interiors" */
  scope: string;
  image: { src: string; alt: string };
  /** The ShortlistButton, injected so this stays a Server Component. */
  shortlistSlot?: ReactNode;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  className?: string;
};

export function ProjectCard({
  href,
  index,
  category,
  title,
  locality,
  areaSqft,
  year,
  scope,
  image,
  shortlistSlot,
  size = "md",
  priority = false,
  className,
}: ProjectCardProps) {
  const titleSize = {
    sm: "text-heading-sm",
    md: "text-heading-md",
    lg: "text-heading-lg font-display",
  }[size];

  return (
    <article
      className={cn(
        "group relative isolate w-full overflow-hidden rounded-md bg-raised hairline",
        "transition-shadow duration-base ease-standard hover:shadow-lift",
        className,
      )}
    >
      {/* §3.10 — 16:10, object-cover. The ratio is reserved so the skeleton
       * matches exactly and CLS stays at zero (§3.20). */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-basalt-100">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          quality={72}
          priority={priority}
          // §3.4 — media scales, content never moves. Transform only (§7.3).
          className="object-cover transition-transform duration-base ease-standard group-hover:scale-103"
        />
        {shortlistSlot ? (
          <div className="absolute right-3 top-3 z-raised">{shortlistSlot}</div>
        ) : null}
      </div>

      <div className="p-6">
        {/* The datum line: index, category, and the brass tick. */}
        <div className="flex items-center gap-3">
          <Datum className="shrink-0">
            {index} — {category}
          </Datum>
          <div className="datum-rule min-w-0 flex-1" />
          <div className="h-2.5 w-px shrink-0 bg-accent" aria-hidden="true" />
        </div>

        {/* §3.10 hover: a brass hairline draws left→right beneath the datum
         * line, and the title shifts 2px right. */}
        <div className="rule-wipe mt-4 inline-block pb-1">
          <h3
            className={cn(
              "font-sans text-fg transition-transform duration-base ease-standard",
              "group-hover:translate-x-0.5",
              titleSize,
            )}
          >
            {/* The whole card is one link. `after:inset-0` makes the title's
             * anchor cover the card without nesting interactive elements —
             * which is what keeps the shortlist button legal inside it. */}
            <NextLink
              href={href}
              className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {title}
            </NextLink>
          </h3>
        </div>

        {/* §3.10 — the metadata that answers "is this like my project?" */}
        <p className="mt-2 font-sans text-caption text-fg-muted">
          {locality} ·{" "}
          <span className="font-mono tabular">
            {areaSqft.toLocaleString("en-IN")}
          </span>{" "}
          sq ft · <span className="font-mono tabular">{year}</span>
        </p>

        <p className="mt-2 font-sans text-label uppercase text-brass-600 dark:text-brass-300">
          {scope}
        </p>
      </div>
    </article>
  );
}
