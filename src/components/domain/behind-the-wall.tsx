import Image from "next/image";

import { cn } from "@/lib/utils";
import { DatumLine } from "@/components/foundation/datum-line";
import { Datum } from "@/components/foundation/typography";

/* design.md §3.15 — BehindTheWall. The differentiator component.
 *
 * §0.8 ranks this the single most defensible thing on the site: "publishing
 * concealed-works photography (waterproofing membranes, conduit runs, plumbing
 * pressure tests) before closure. No competitor does this. It converts the
 * industry's biggest fear into our biggest proof."
 *
 * §0.7 names the fear it answers: "Quality will be hidden behind paint."
 *
 * Each image carries a DATE STAMP and GEOTAG CHIP (§3.15) — those chips are the
 * proof that these are real site records rather than stock, and they are why
 * the module works. A caption without a date is just another photo.
 *
 * §3.15 / §9.2: native scroll-snap on mobile, GSAP horizontal on desktop. The
 * snap carousel is built here; §7.3 adds the pinned desktop version at the
 * motion pass (Step 8), enhancing this rather than replacing it. Per §9.3,
 * "carousels use native scroll-snap, not JS carousels."
 */

export type BehindTheWallItem = {
  image: { src: string; alt: string };
  /** e.g. "Bathroom membrane" */
  title: string;
  /** §3.15 — the real specification, in mono. e.g. "2-coat polyurethane" */
  specification: string;
  /** ISO date; rendered as the date stamp. */
  capturedAt: string;
  /** Optional geotag chip, e.g. "18.5204° N, 73.8567° E" or a locality name. */
  geo?: string;
};

export function BehindTheWall({
  index = "03",
  label = "What you won't see again",
  items,
  className,
}: {
  index?: string;
  label?: string;
  items: BehindTheWallItem[];
  className?: string;
}) {
  return (
    <section className={cn("w-full", className)}>
      <div className="container-base">
        <DatumLine index={index} label={label} />
      </div>

      {/* Scroll-snap strip. Bleeds to the viewport edge on mobile so the next
       * card peeks — the cheapest possible affordance that more exists. */}
      <ul
        className={cn(
          "mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4",
          "px-5 md:px-8 lg:px-12",
        )}
      >
        {items.map((item) => (
          <li
            key={item.title}
            className="w-72 shrink-0 snap-start md:w-80"
          >
            <figure>
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-basalt-100">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(min-width: 768px) 320px, 288px"
                  quality={72}
                  className="object-cover"
                />

                {/* §3.15 — dated and geotagged on each image. */}
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-2">
                  <time
                    dateTime={item.capturedAt}
                    className="rounded-sm bg-basalt-950/70 px-2 py-1 font-mono text-datum uppercase text-basalt-050 backdrop-blur-sm"
                  >
                    {item.capturedAt}
                  </time>
                  {item.geo ? (
                    <span className="rounded-sm bg-basalt-950/70 px-2 py-1 font-mono text-datum uppercase text-brass-300 backdrop-blur-sm">
                      {item.geo}
                    </span>
                  ) : null}
                </div>
              </div>

              <figcaption className="mt-3">
                <p className="font-sans text-body-md text-fg">{item.title}</p>
                <div className="datum-rule mt-2 w-8" />
                {/* §3.15 — captions in datum with REAL specifications. */}
                <Datum className="mt-2 block whitespace-normal">
                  {item.specification}
                </Datum>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
