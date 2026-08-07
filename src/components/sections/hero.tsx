import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Display, Body } from "@/components/foundation/typography";
import { DatumLine } from "@/components/foundation/datum-line";

/* design.md §4.1 / R-01 — Hero.
 *
 * §R-01: "The hero section's job is NOT TO LOOK BEAUTIFUL. Its job is to answer
 * 'can I trust these people with ₹40 lakh and 14 months of my life?' within 5
 * seconds. Beauty is the delivery mechanism, not the message."
 *
 * Three constraints are structural here, not stylistic:
 *
 * 1. LCP. SRS NFR-PERF-01 sets LCP < 2.0s on a mid-range Android over 4G, and
 *    implementationplan.md Phase 5 names the hero video "the most likely cause
 *    of an LCP failure. THE POSTER IMAGE MUST BE THE LCP ELEMENT." So this
 *    component takes a poster image with `priority`, and video is a separate
 *    opt-in that loads after and only at ≥768px (FR-HOME-02).
 *
 * 2. NO ENTRANCE ANIMATION ON THE LCP TEXT. §7.1 principle 5: "Never animate
 *    opacity from 0 on content required for the initial render." The headline
 *    renders server-side and unanimated; the §7.7 word-split entrance is a
 *    first-visit-only enhancement applied after document.fonts.ready.
 *
 * 3. §1.1.1 consequence 3: a coined name carries no meaning, so the hero must
 *    state what we do in the first line of copy. `subtitle` is required.
 */

export function Hero({
  datumLabel = "Construction • Interiors • Renovation",
  headline,
  subtitle,
  actions,
  poster,
  /** §9.2 — 100svh mobile, 90svh tablet, 100svh desktop. */
  fullHeight = true,
  children,
  className,
}: {
  datumLabel?: string;
  headline: ReactNode;
  /** §1.1.1 — states the category. Never decorative. */
  subtitle: ReactNode;
  actions?: ReactNode;
  poster: { src: string; alt: string };
  fullHeight?: boolean;
  /** Slot for the §7.4 3D-02 spatial mark, which is a static SVG by default. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex w-full flex-col justify-end overflow-hidden bg-basalt-950",
        // svh, not vh — vh is wrong on mobile the moment the address bar moves.
        fullHeight && "h-hero md:h-hero-md lg:h-hero",
        className,
      )}
    >
      {/* The LCP element. `priority` preloads it; nothing above it competes.
       * §7.7 S01 "Hero media": M3 at -6%, reduced from the §7.2 cap of 8%
       * because the headline sits over it and more movement makes the type
       * hard to read as it passes. */}
      <div
        data-motion="M3"
        data-motion-parallax="6"
        className="absolute inset-0 -z-10"
      >
        <Image
          src={poster.src}
          alt={poster.alt}
          fill
          sizes="100vw"
          quality={72}
          priority
          fetchPriority="high"
          className="object-cover"
        />
        {/* §1.5: the wordmark is never placed on a busy photograph without a
         * scrim. This is that scrim, and it is also what makes mediocre
         * photography read as intentional (§2.1.1). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-basalt-950/62"
        />
      </div>

      {/* The §7.4 3D-02 slot sits behind the text, never over the CTAs. */}
      {children}

      <div className="container-base pb-section pt-section-feature">
        <DatumLine label={datumLabel} className="max-w-prose" />

        {/* Unanimated on purpose — see constraint 2 above. */}
        <Display
          as="h1"
          size="xxl"
          optical
          className="mt-8 text-basalt-050"
        >
          {headline}
        </Display>

        {/* §7.7 S01 "Hero sub + CTAs": M1, stagger 80ms, delay 400ms, on load.
         * The headline above is deliberately excluded — §7.1 rule 5 forbids
         * animating opacity from 0 on content required for the initial render,
         * and it is the LCP text. */}
        <div
          data-motion="M1"
          data-motion-onload=""
          data-motion-children=":scope > *"
          data-motion-stagger="80"
          data-motion-delay="400"
        >
          <Body size="lg" className="mt-6 text-basalt-300">
            {subtitle}
          </Body>

          {actions ? (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
