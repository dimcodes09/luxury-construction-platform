import { ExternalLink, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/foundation/icon";

/* design.md §3.13 — TestimonialCard.
 *
 * §3.13 / R-02: "The provenance chip is MANDATORY. A testimonial without a
 * linked project or verifiable source renders in a visually DEMOTED style (no
 * photo, muted border) — this creates internal pressure to only collect
 * verifiable ones."
 *
 * That demotion is implemented literally below: `verified={false}` drops the
 * photo and mutes the card. It is a design mechanism aimed at our own content
 * process, not at the visitor — which is unusual and worth preserving.
 *
 * §3.13: the quote is set in Fraunces REGULAR, not italic. §2.2.3 restricts
 * italics to pull-quotes and image captions.
 */

export type Testimonial = {
  quote: string;
  clientName: string;
  clientPhoto?: string;
  /** e.g. "Ridgeline House, Baner" — the linked project. */
  projectLabel?: string;
  projectHref?: string;
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** SRS DM-07: sourceUrl is REQUIRED when verified is true. */
  verified: boolean;
  sourceUrl?: string;
};

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  const {
    quote,
    clientName,
    clientPhoto,
    projectLabel,
    projectHref,
    date,
    rating,
    verified,
    sourceUrl,
  } = testimonial;

  return (
    <figure
      className={cn(
        "flex h-full flex-col rounded-md bg-raised p-6 md:p-8",
        // The demotion: unverified testimonials get a muted border and read as
        // visually secondary (R-02).
        verified ? "hairline" : "border border-dashed border-basalt-300 opacity-90",
        className,
      )}
    >
      {/* §3.13 — body-lg Fraunces regular, NOT italic. */}
      <blockquote className="font-display text-body-lg text-fg measure-body">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <div className="datum-rule mt-6" />

      <figcaption className="mt-4 flex items-start gap-3">
        {/* No photo on unverified — part of the demotion. */}
        {verified ? (
          <Avatar name={clientName} src={clientPhoto} size="md" />
        ) : null}

        <div className="min-w-0">
          <p className="font-sans text-heading-sm text-fg">{clientName}</p>

          <p className="mt-0.5 font-sans text-caption text-fg-muted">
            {projectLabel && projectHref ? (
              <a
                href={projectHref}
                className="underline-wipe text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {projectLabel}
              </a>
            ) : (
              projectLabel
            )}
            {projectLabel ? " · " : null}
            <time dateTime={date}>{date}</time>
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className="flex items-center gap-0.5"
              aria-label={`${rating} out of 5`}
            >
              {Array.from({ length: 5 }, (_, index) => (
                <Icon
                  key={index}
                  icon={Star}
                  size={16}
                  className={cn(
                    index < rating
                      ? "fill-brass-500 text-brass-500"
                      : "text-basalt-300",
                  )}
                />
              ))}
            </span>

            {/* The provenance chip — the whole point of the component. */}
            {verified && sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-sans text-caption text-brass-600 underline-wipe focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-brass-300"
              >
                Verified Google review
                <Icon icon={ExternalLink} size={16} />
              </a>
            ) : null}
          </div>
        </div>
      </figcaption>
    </figure>
  );
}
