import { cn } from "@/lib/utils";

import { Datum } from "./typography";

/* design.md §1.5 — "the datum line", the signature graphic device.
 *
 *   ────────────┬──────────────────────────────
 *               │ 01 — SELECTED WORK
 *
 * A 1px rule with a small tick and a monospace label, borrowed from
 * architectural drawings. §1.5 calls this "the connective tissue of the whole
 * identity" — it appears on every page, and it is the element that carries the
 * technical-drawing visual language (§0.3 layer 3) into ordinary UI.
 *
 * Motion: this is the anchor for M2 Rule draw (§7.2) — scaleX 0→1 from the
 * left over --dur-slow. The rule is marked so the motion pass can find it
 * without every section re-declaring the pattern.
 */

export function DatumLine({
  index,
  label,
  className,
  align = "left",
}: {
  /** The drawing-sheet number, e.g. "01". Rendered before the label. */
  index?: string;
  label: string;
  className?: string;
  /** `right` mirrors the tick for right-aligned section headers. */
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-4",
        align === "right" && "flex-row-reverse",
        className,
      )}
    >
      {/* The rule. data-motion marks it for the M2 pass (§7.7). */}
      <div
        data-motion="rule-draw"
        className="datum-rule min-w-0 flex-1 origin-left"
      />

      {/* The tick — the vertical stroke where a dimension line meets its
       * witness line on a real drawing. */}
      <div className="h-3 w-px shrink-0 bg-accent" aria-hidden="true" />

      <Datum className="shrink-0 whitespace-nowrap">
        {index ? `${index} — ${label}` : label}
      </Datum>
    </div>
  );
}
