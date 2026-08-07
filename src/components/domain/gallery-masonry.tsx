import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.0 domain / SRS FR-GAL-01 — the gallery masonry grid.
 *
 * Built on CSS `columns`, not a JS masonry library. §design-process.md §3 warns
 * that AI-assisted work "will reach for a carousel package, an animation
 * package, a form package. Every one blows the 130KB budget." A masonry library
 * is the same trap: CSS columns cost zero bytes and reflow natively.
 *
 * The trade-off is honest: CSS columns order items top-to-bottom within a
 * column rather than left-to-right across them. For a gallery with no inherent
 * sequence that is invisible; for anything ordered it would be wrong, which is
 * why this is gallery-only and not a general layout component.
 *
 * §3.22 — image hover is scale(1.02) plus a lightening scrim, lighter than the
 * 1.03 used on cards so a dense grid does not feel restless.
 */

export type GalleryImage = {
  src: string;
  alt: string;
  /** Room type drives the FR-GAL-01 filter; carried here for the data-attr. */
  roomType?: string;
  /** Per-image shortlisting (FR-GAL-01) is injected by the page. */
  actionSlot?: ReactNode;
};

export function GalleryMasonry({
  images,
  className,
}: {
  images: GalleryImage[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        // 1-up → 2-up → 3-up, matching §9.2's project-grid progression.
        "columns-1 gap-6 md:columns-2 lg:columns-3",
        className,
      )}
    >
      {images.map((image) => (
        <figure
          key={image.src}
          data-room-type={image.roomType}
          // break-inside prevents an image splitting across a column boundary,
          // which is the one thing CSS columns get wrong by default.
          className="group relative mb-6 break-inside-avoid overflow-hidden rounded-md bg-basalt-100"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={800}
            height={1000}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            quality={72}
            className="h-auto w-full object-cover transition-transform duration-base ease-standard group-hover:scale-102"
          />

          {/* The scrim lightens on hover rather than darkening — the images are
           * the product, and darkening them to show UI is backwards. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-basalt-950/10 opacity-0 transition-opacity duration-base ease-standard group-hover:opacity-100"
          />

          {image.actionSlot ? (
            <div className="absolute right-3 top-3">{image.actionSlot}</div>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
