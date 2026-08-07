import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* design.md §2.4.3 — the asymmetric editorial grid, as a section.
 *
 * "Standard 12-column symmetry reads corporate. Our signature layout offsets
 * content into a 7/5 or 5/7 split with a 1-column bleed, echoing architectural
 * plan drawings."
 *
 * §2.4.3 carries a rule that is easy to lose and worth stating at the component
 * boundary: "ANY PAGE USING THE ASYMMETRIC GRID MUST RETURN TO SYMMETRY FOR ITS
 * CONVERSION SECTION. Asymmetry creates interest; symmetry creates trust. Forms
 * and CTAs are always centred and symmetric." So this component is for
 * editorial content only — never wrap a form in it.
 *
 * §7.7 / §7.2 M3: media parallax is capped at 8% and at TWO ELEMENTS PER PAGE.
 * `parallax` marks the element for the Step 8 pass; the page owns the budget.
 */

export function SplitFeature({
  eyebrow,
  children,
  media,
  /** `media-left` bleeds the image off the left edge; `media-right` mirrors. */
  mediaSide = "right",
  bleed = true,
  parallax = false,
  className,
}: {
  eyebrow?: ReactNode;
  children: ReactNode;
  media: { src: string; alt: string };
  mediaSide?: "left" | "right";
  /** §2.4.3 — the 1-column bleed past the container edge. */
  bleed?: boolean;
  parallax?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12",
        className,
      )}
    >
      {/* Text: 5 columns. */}
      <div
        className={cn(
          "lg:col-span-5",
          mediaSide === "right" ? "lg:col-start-1" : "lg:col-start-8 lg:order-2",
        )}
      >
        {eyebrow ? <div className="mb-6">{eyebrow}</div> : null}
        {children}
      </div>

      {/* Media: 7 columns, optionally bleeding past the container gutter. */}
      <div
        className={cn(
          "lg:col-span-7",
          mediaSide === "right"
            ? "lg:col-start-6"
            : "lg:col-start-1 lg:order-1",
          bleed && mediaSide === "right" && "lg:-mr-gutter",
          bleed && mediaSide === "left" && "lg:-ml-gutter",
        )}
      >
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-basalt-100 lg:aspect-video">
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            quality={72}
            data-motion={parallax ? "parallax" : undefined}
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
