import Image from "next/image";
import NextLink from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/foundation/icon";
import { Heading, Body, Numeral, Label } from "@/components/foundation/typography";

/* design.md §3.11 — ServiceCard. Two variants.
 *
 * `overview` — hub pages, 3-up: craft icon → title → 2-line plain-English
 * description → price-from range → "Explore →".
 *
 * `deep` — services index, alternating full-width rows on the §2.4.3
 * asymmetric editorial grid, flipping side every row.
 *
 * §10.3 note: the §3.11 spec labels the overview link "Explore →", but §10.3
 * BANS `Explore` from the nav lexicon. The two rules collide. Resolved in
 * favour of the lexicon — the CTA text is a required prop with an approved
 * default, since §10.3 is the stricter, more recently-reasoned rule (R-04:
 * vague CTAs are the top conversion killer on contractor sites).
 */

export function ServiceCardOverview({
  href,
  icon,
  title,
  description,
  priceFrom,
  ctaLabel = "See the range",
  className,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  /** §3.11 — two lines, plain English. Not marketing copy. */
  description: string;
  /** e.g. "₹1,850" — rendered as "From ₹1,850/sq ft". */
  priceFrom: string;
  ctaLabel?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-md bg-transparent p-6 hairline",
        "transition-colors duration-base ease-standard",
        "hover:bg-basalt-100 dark:hover:bg-basalt-800",
        className,
      )}
    >
      {/* §2.8 — brass icons are accent moments only; a service card is one. */}
      <Icon icon={icon} size={32} className="text-brass-500" />

      <Heading as="h3" size="md" className="mt-6">
        <NextLink
          href={href}
          className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {title}
        </NextLink>
      </Heading>

      <Body size="md" className="mt-3 flex-1" measure={false}>
        {description}
      </Body>

      <p className="mt-6">
        <Label className="block">From</Label>
        <Numeral size="md" className="mt-1 block text-fg">
          {priceFrom}
          <span className="ml-1 font-sans text-body-sm text-fg-muted">
            / sq ft
          </span>
        </Numeral>
      </p>

      <span className="mt-4 inline-flex items-center gap-2 font-sans text-body-md text-brass-600 dark:text-brass-300">
        {ctaLabel}
        <Icon
          icon={ArrowRight}
          size={16}
          className="transition-transform duration-base ease-standard group-hover:translate-x-1"
        />
      </span>
    </article>
  );
}

/* §3.11 `deep` — the asymmetric editorial row (§2.4.3).
 *
 * §2.4.3 rule: "any page using the asymmetric grid must return to symmetry for
 * its conversion section. Asymmetry creates interest; symmetry creates trust."
 * That is the page's job, not this component's — noted so it is not forgotten.
 */
export function ServiceCardDeep({
  href,
  title,
  body,
  outcomes,
  media,
  ctaLabel = "See the range",
  flip = false,
  className,
}: {
  href: string;
  title: string;
  body: string;
  /** §3.11 — exactly 3 bullet outcomes. */
  outcomes: [string, string, string];
  /** A material macro or a technical drawing (§0.3 layers 2 and 3). */
  media: { src: string; alt: string };
  ctaLabel?: string;
  /** Alternates side every row. */
  flip?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "grid grid-cols-1 items-center gap-8 py-12 lg:grid-cols-12 lg:gap-12",
        className,
      )}
    >
      <div
        className={cn(
          "lg:col-span-5",
          flip ? "lg:order-2 lg:col-start-8" : "lg:col-start-1",
        )}
      >
        <Heading as="h3" size="lg">
          {title}
        </Heading>
        <Body size="md" className="mt-4">
          {body}
        </Body>

        <ul className="mt-6 flex flex-col gap-3">
          {outcomes.map((outcome) => (
            <li key={outcome} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-2.5 h-px w-4 shrink-0 bg-accent"
              />
              <span className="font-sans text-body-md text-fg-secondary">
                {outcome}
              </span>
            </li>
          ))}
        </ul>

        <NextLink
          href={href}
          className="mt-6 inline-flex items-center gap-2 font-sans text-body-md text-brass-600 underline-wipe focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-brass-300"
        >
          {ctaLabel}
          <Icon icon={ArrowRight} size={16} />
        </NextLink>
      </div>

      <div
        className={cn(
          "lg:col-span-6",
          flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-7",
        )}
      >
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-basalt-100">
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={72}
            className="object-cover"
          />
        </div>
      </div>
    </article>
  );
}
