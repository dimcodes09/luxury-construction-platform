"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.12 — StatBand.
 *
 * §3.12 carries the most important content rule in the component library:
 * "EVERY STAT MUST BE TRUE AND SPECIFIC. '0 disputes in 8 years' is powerful;
 * '100+ happy customers' is noise. Where a number is unflattering, we publish
 * it anyway with context — this is the transparency positioning made concrete
 * and it is disproportionately persuasive (R-01)."
 *
 * SRS FR-HOME-03: values are read from SiteSettings, never hard-coded, and
 * every published statistic is verified in writing by the owner before launch
 * (SRS §10 gate 11). The `value` prop is therefore a number from the CMS.
 *
 * Motion is M4 Counter (§7.2 / §7.7): 0 → value over 900ms --ease-out, ONCE,
 * tabular numerals so the width never changes as it counts.
 */

export type Stat = {
  value: number;
  /** Rendered after the number, e.g. "mo", "/ 5". Not animated. */
  suffix?: string;
  /** Decimal places — 11.4 months needs 1, 61 homes needs 0. */
  precision?: number;
  /** Two lines beneath the numeral, e.g. "homes" / "delivered". */
  label: string;
  sublabel?: string;
};

export function StatBand({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full bg-basalt-900 py-12 md:py-16",
        // §3.12 — stats separated by vertical hairlines.
        className,
      )}
    >
      <div className="container-base">
        <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:gap-y-0">
          {stats.map((stat, index) => (
            <div
              key={stat.label + index}
              className={cn(
                "flex flex-col gap-2 px-4 lg:px-8",
                // Hairlines between, never before the first in a row.
                index % 2 !== 0 && "border-l border-basalt-700 lg:border-l",
                index % 2 === 0 && "lg:border-l lg:border-basalt-700",
                index === 0 && "lg:border-l-0",
              )}
            >
              <dd className="font-mono text-numeral-xl tabular text-brass-300">
                <Counter
                  value={stat.value}
                  precision={stat.precision ?? 0}
                />
                {stat.suffix ? (
                  <span className="ml-1 text-heading-md">{stat.suffix}</span>
                ) : null}
              </dd>
              <dt className="font-sans text-label uppercase text-basalt-400">
                <span className="block text-basalt-300">{stat.label}</span>
                {stat.sublabel ? (
                  <span className="mt-1 block">{stat.sublabel}</span>
                ) : null}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* M4 Counter (§7.2).
 *
 * §7.1 principle 4: "Nothing animates twice. Scroll reveals fire once
 * (once: true). Re-triggering on scroll-back is the most irritating pattern on
 * modern sites." The observer disconnects on first intersection.
 *
 * §7.1 principle 7 / §7.7: under reduced motion the FINAL VALUE is shown
 * immediately — not zero, not a fade. The number is the content. */
function Counter({ value, precision }: { value: number; precision: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        const duration = 900;
        const start = performance.now();
        // --ease-out, matching cubic-bezier(0.16, 1, 0.3, 1) closely enough
        // that the two are indistinguishable at 900ms.
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          setDisplay(value * easeOut(t));
          if (t < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  /* Server renders the real value so it is present without JS and correct for
   * crawlers; the client swaps to 0 only once the animation actually starts. */
  const shown = display ?? value;

  return (
    <span ref={ref}>
      {shown.toLocaleString("en-IN", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })}
    </span>
  );
}
