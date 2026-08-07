import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/foundation/icon";
import { Datum } from "@/components/foundation/typography";

/* design.md §3.3 form rule 2 — "Progressive disclosure. Never show more than 6
 * fields at once; use the Stepper."
 *
 * Used by the 4-step contact form (FR-LEAD-01) and the 5-step estimator
 * (FR-EST-01). Both persist their step in the URL, so this component is a pure
 * display of position — it owns no state.
 *
 * A11y: rendered as an ordered list with aria-current on the active step, so a
 * screen reader announces "step 2 of 5" without a visual-only cue.
 */

export type Step = {
  label: string;
  /** Completed steps are navigable backwards; future steps are not. */
  href?: string;
};

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: Step[];
  /** Zero-based index of the active step. */
  current: number;
  className?: string;
}) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isComplete = index < current;
          const isCurrent = index === current;

          return (
            <li key={step.label} className="flex flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {/* The rail. Brass marks progress; hairline marks what remains. */}
                <div
                  className={cn(
                    "h-0.5 w-full transition-colors duration-base ease-standard",
                    isComplete || isCurrent ? "bg-brass-500" : "bg-hairline",
                  )}
                />
                <div className="flex items-center gap-1.5">
                  {isComplete ? (
                    <Icon icon={Check} size={16} className="text-brass-700" />
                  ) : null}
                  <Datum
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "truncate",
                      isCurrent && "text-fg",
                      isComplete && "text-fg-secondary",
                    )}
                  >
                    {step.label}
                  </Datum>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {/* Announced, not shown — the visual rail already carries this. */}
      <p className="sr-only">
        Step {current + 1} of {steps.length}
      </p>
    </nav>
  );
}
