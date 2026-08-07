import Image from "next/image";

import { Datum, Display, Body } from "@/components/foundation/typography";

/* The scroll showcase band.
 *
 * A dark, full-bleed section holding a single framed panel that scales and
 * settles as it enters the viewport (the `frame` pattern in motion-engine).
 * It is scrubbed to scroll position, so the movement is always under the
 * visitor's control and can never run at a speed they did not choose.
 *
 * Why it earns its place rather than being decoration (§7.1 rule 1: "every
 * animation either shows a relationship, communicates state, or directs
 * attention"): the panel is the same before/after evidence the whole
 * positioning rests on (§0.8), and arriving INTO a frame is what makes the
 * viewer stop and look at it rather than scroll past another image.
 *
 * Everything animated here is transform + opacity only (§7.3). Under reduced
 * motion the engine never runs and the panel renders at its final state, which
 * is the layout you see with JavaScript disabled.
 */

export function ShowcaseFrame({
  image,
  caption,
}: {
  image: { src: string; alt: string };
  caption: string;
}) {
  return (
    <section
      data-motion="frame"
      data-header-dark
      className="relative overflow-hidden bg-basalt-950 py-section-feature"
    >
      {/* A very low-contrast brass wash so the black band has depth without
       * breaking the §2.1.5 cap — this is a 4% overlay, not a gradient on UI. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brass-500/40"
      />

      <div className="container-base">
        <Datum className="block text-brass-300">03 — The evidence</Datum>

        <Display
          as="h2"
          size="lg"
          className="mt-6 text-basalt-050"
        >
          The same room, the same lens, the same crop.
        </Display>

        <Body size="lg" className="mt-6 text-basalt-300">
          Every before and after on this site is shot from one tripod position.
          No wide-angle on the after, no tidying that was not part of the work.
        </Body>
      </div>

      {/* The panel the `frame` pattern drives. `will-change` is deliberately
       * absent — §7.3 applies it only during an active tween, and this one is
       * scrubbed, so the browser promotes it on first scroll anyway. */}
      <div className="container-wide mt-16">
        <div
          data-motion-panel
          className="relative aspect-16/9 w-full overflow-hidden rounded-md bg-basalt-900"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 90vw, 100vw"
            quality={72}
            className="object-cover"
          />

          {/* §3.14 — the caption naming what changed and what it cost. A panel
           * this size without cost context is entertainment, not evidence. */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-basalt-950 to-transparent p-6 md:p-8">
            <p className="font-mono text-datum uppercase text-basalt-300">
              {caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
