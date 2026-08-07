"use client";

import { Slider as RadixSlider } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Numeral } from "@/components/foundation/typography";

/* design.md §3.3 — Slider, used by the estimator.
 *
 * §3.3 carries a hard rule that is easy to skip and expensive to get wrong:
 * "A numeric input is ALWAYS paired with every slider — sliders alone are
 * imprecise and frustrating on a cost tool where the user often knows their
 * exact area." <SliderField> is therefore the exported unit; the bare track is
 * not meant to ship on its own.
 */

export function Slider({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixSlider.Root>) {
  return (
    <RadixSlider.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        // §9.3 — the 8px track alone is nowhere near a 44px target, so the root
        // carries the height and the track sits centred inside it.
        "h-target",
        className,
      )}
      {...rest}
    >
      {/* §3.3: track 2px basalt-200, filled portion brass-500. */}
      <RadixSlider.Track className="relative h-0.5 w-full grow bg-basalt-200 dark:bg-basalt-700">
        <RadixSlider.Range className="absolute h-full bg-brass-500" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className={cn(
          "block size-6 rounded-full bg-basalt-000 shadow-sheet",
          "border-control border-ink-900",
          "transition-colors duration-fast ease-standard",
          "focus-visible:outline-2 focus-visible:outline-offset-3",
          "disabled:opacity-38",
          "dark:bg-basalt-100",
        )}
        aria-label="Value"
      />
    </RadixSlider.Root>
  );
}

/* The shipping unit: slider + paired numeric input + value readout. */
export function SliderField({
  id,
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit,
  formatValue,
  className,
}: {
  id: string;
  label: string;
  value: number;
  onValueChange: (next: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** e.g. (n) => n.toLocaleString("en-IN") — §1.4: Indian-English throughout. */
  formatValue?: (value: number) => string;
  className?: string;
}) {
  const display = formatValue ? formatValue(value) : String(value);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={id} className="text-body-md text-fg">
          {label}
        </label>
        {/* §2.2.3 — tabular figures so the readout does not jitter as it changes. */}
        <Numeral size="md" className="text-fg">
          {display}
          {unit ? (
            <span className="ml-1 text-body-sm text-fg-muted">{unit}</span>
          ) : null}
        </Numeral>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(next) => onValueChange(next[0] ?? min)}
          className="flex-1"
        />
        {/* §3.3 — the mandatory paired numeric entry. */}
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isNaN(next)) onValueChange(next);
          }}
          className="w-28"
        />
      </div>
    </div>
  );
}
