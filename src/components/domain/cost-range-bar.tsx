import { cn } from "@/lib/utils";
import { Datum, Numeral } from "@/components/foundation/typography";

/* design.md §3.16 — CostRangeBar, used by the estimator.
 *
 * "A horizontal bar showing the estimate as a RANGE WITH A CONFIDENCE BAND,
 * NEVER a point value." SRS FR-EST-03 makes this a P0 requirement: "a single
 * point value must never be displayed alone."
 *
 * §0.2 explains why — a calculator that outputs one big number "feels like a
 * sales trick; sets up disappointment."
 *
 * §3.16: numerals are blueprint-500, the technical layer. §2.1.1: "when the
 * user sees Blueprint, they are looking at engineering truth, not marketing."
 * §2.1.5 permits full-bleed Blueprint here because this surface IS engineering
 * output.
 */

export type CostBreakdownSegment = {
  label: string;
  /** Share of the total, 0–1. §4.9.1 splits must sum to 1.00. */
  share: number;
};

export function CostRangeBar({
  min,
  max,
  mostLikely,
  /** The 60% confidence region (§3.16 shaded band). */
  confidenceMin,
  confidenceMax,
  breakdown,
  formatValue,
  className,
}: {
  min: number;
  max: number;
  mostLikely: number;
  confidenceMin: number;
  confidenceMax: number;
  breakdown?: CostBreakdownSegment[];
  /** e.g. (n) => `₹${(n / 100000).toFixed(1)} L` — §1.4: lakh, not million. */
  formatValue: (value: number) => string;
  className?: string;
}) {
  const span = max - min || 1;
  const toPercent = (value: number) => ((value - min) / span) * 100;

  const bandLeft = toPercent(confidenceMin);
  const bandWidth = toPercent(confidenceMax) - bandLeft;
  const likelyLeft = toPercent(mostLikely);

  return (
    <div className={cn("w-full", className)}>
      {/* Endpoints. Tabular so the two ends align optically. */}
      <div className="flex items-baseline justify-between gap-4">
        <Numeral size="xl" className="text-blueprint-500">
          {formatValue(min)}
        </Numeral>
        <Numeral size="xl" className="text-blueprint-500">
          {formatValue(max)}
        </Numeral>
      </div>

      {/* The bar: whiskers to the full range, shaded band across the middle
       * 60%, and a marker at the most-likely value. */}
      <div className="relative mt-6 h-6">
        {/* Whisker rule */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-blueprint-300" />
        {/* End caps */}
        <div className="absolute left-0 top-1/2 h-4 w-px -translate-y-1/2 bg-blueprint-500" />
        <div className="absolute right-0 top-1/2 h-4 w-px -translate-y-1/2 bg-blueprint-500" />
        {/* Confidence band */}
        <div
          className="absolute top-1/2 h-3 -translate-y-1/2 bg-blueprint-300/40"
          style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
        />
        {/* Most-likely marker */}
        <div
          className="absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-blueprint-700"
          style={{ left: `${likelyLeft}%` }}
        />
      </div>

      <p
        className="mt-3 font-mono text-datum uppercase text-blueprint-700"
        style={{ marginLeft: `${Math.min(likelyLeft, 70)}%` }}
      >
        ▲ Most likely {formatValue(mostLikely)}
      </p>

      {/* §3.16 — the segmented stacked bar breaking the number into
       * Structure / Finishes / MEP / Design & PM / Contingency. */}
      {breakdown?.length ? (
        <div className="mt-8">
          <div className="flex h-2 w-full overflow-hidden rounded-sm">
            {breakdown.map((segment, index) => (
              <div
                key={segment.label}
                className={cn(
                  "h-full",
                  index % 2 === 0 ? "bg-blueprint-500" : "bg-blueprint-300",
                )}
                style={{ width: `${segment.share * 100}%` }}
              />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {breakdown.map((segment) => (
              <li key={segment.label}>
                <Datum className="text-blueprint-700">
                  {segment.label} {Math.round(segment.share * 100)}%
                </Datum>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
