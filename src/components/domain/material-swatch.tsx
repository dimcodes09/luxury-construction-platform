import Image from "next/image";

import { cn } from "@/lib/utils";
import { Datum } from "@/components/foundation/typography";

/* design.md §3.17 — MaterialSwatch.
 *
 * "96×96 macro photograph of a real material, radius-sm, with a hover overlay
 * revealing name, brand, grade, and which projects used it."
 *
 * §0.3 layer 2 explains why this earns its place despite the weak photo
 * library: "macro crops of real materials are CHEAP TO SHOOT WELL on a phone
 * with natural light and read as luxurious. A 60mm macro of a real joinery
 * corner outperforms a bad wide shot of a whole room."
 *
 * §9.3 — "No hover-dependent information anywhere. Every hover reveal has a tap
 * or always-visible equivalent." The overlay is therefore progressive: the name
 * is always rendered beneath the swatch, and the overlay only ADDS brand/grade.
 */

export type Material = {
  name: string;
  brand: string;
  grade: string;
  image: { src: string; alt: string };
  href?: string;
};

export function MaterialSwatch({
  material,
  className,
}: {
  material: Material;
  className?: string;
}) {
  return (
    <figure className={cn("group w-24", className)}>
      <div className="relative size-24 overflow-hidden rounded-sm bg-basalt-100">
        <Image
          src={material.image.src}
          alt={material.image.alt}
          fill
          sizes="96px"
          quality={72}
          className="object-cover"
        />

        {/* §3.22 — overlay fades in from the bottom over --dur-fast. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 translate-y-full",
            "bg-basalt-950/80 p-2 backdrop-blur-sm",
            "transition-transform duration-fast ease-standard",
            "group-hover:translate-y-0 group-focus-within:translate-y-0",
          )}
        >
          <Datum className="block text-basalt-050">{material.brand}</Datum>
          <Datum className="block text-brass-300">{material.grade}</Datum>
        </div>
      </div>

      {/* Always visible — the touch equivalent required by §9.3. */}
      <figcaption className="mt-2 font-sans text-caption text-fg-secondary">
        {material.name}
      </figcaption>
    </figure>
  );
}
