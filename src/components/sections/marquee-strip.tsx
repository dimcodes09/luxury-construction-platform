import { cn } from "@/lib/utils";
import { Datum } from "@/components/foundation/typography";

/* design.md §3.0 sections — MarqueeStrip.
 *
 * §0.2 bans the obvious use of this pattern outright: "Rotating client-logo
 * strip — meaningless for residential clients. Our replacement: NAMED PROJECTS
 * WITH LOCATIONS AND DATES."
 *
 * So this strip carries facts, not logos: project names, localities, years,
 * specifications. It is a datum rail, not decoration.
 *
 * It does NOT auto-scroll. §7.2 permits exactly four motion patterns and a
 * marquee is not among them; §0.2 also bans "endless parallax on every section"
 * for the same reason — motion sickness and jank on mid-range Android. Overflow
 * is user-driven via scroll-snap (§9.3: native scroll-snap, not JS carousels).
 */

export type MarqueeItem = {
  /** e.g. "Ridgeline House" */
  primary: string;
  /** e.g. "Arera Colony · 2025" */
  secondary: string;
};

export function MarqueeStrip({
  items,
  className,
}: {
  items: MarqueeItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full border-y border-hairline py-4",
        className,
      )}
    >
      <ul className="flex snap-x gap-8 overflow-x-auto px-5 md:px-8 lg:px-12">
        {items.map((item) => (
          <li
            key={item.primary}
            className="flex shrink-0 snap-start items-center gap-3"
          >
            <span className="font-sans text-body-sm text-fg">
              {item.primary}
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-accent" />
            <Datum>{item.secondary}</Datum>
          </li>
        ))}
      </ul>
    </div>
  );
}
