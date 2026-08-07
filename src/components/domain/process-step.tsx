import { IndianRupee } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/foundation/icon";
import { Badge } from "@/components/ui/chip";
import { Heading, Body, Datum } from "@/components/foundation/typography";

/* design.md §3.18 — ProcessStep.
 *
 * "Numbered vertical timeline with a persistent brass rule. Each step: datum
 * number → heading-md title → body → DURATION CHIP → PAYMENT CHIP → optional
 * 'what you receive' list. The duration and payment chips are THE TRUST
 * PAYLOAD (§0.7)."
 *
 * §0.7 maps this directly to two of the eight hesitations: "The price will
 * balloon" (payment milestone map) and "I don't know what I'm signing"
 * (deliverables per step). §0.6: the first-time home builder's deciding
 * question is "What actually happens, in what order, and when do I pay?"
 */

export type ProcessStepData = {
  /** Zero-padded, e.g. "04". */
  number: string;
  title: string;
  body: string;
  durationDays: number;
  /** §3.18 / SRS FR-PRC-01 — flags a payment milestone on the timeline. */
  paymentPoint?: boolean;
  /** e.g. "15% on foundation completion" */
  paymentNote?: string;
  /** §3.18 "what you receive" — the deliverables for this step. */
  deliverables?: string[];
};

export function ProcessStep({
  step,
  isLast = false,
  className,
}: {
  step: ProcessStepData;
  isLast?: boolean;
  className?: string;
}) {
  const weeks = Math.round((step.durationDays / 7) * 10) / 10;

  return (
    <li className={cn("relative flex gap-6 pb-12", className)}>
      {/* The persistent brass rule running the length of the timeline. */}
      <div className="relative flex flex-col items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-accent bg-canvas">
          <Datum className="text-brass-600 dark:text-brass-300">
            {step.number}
          </Datum>
        </span>
        {!isLast ? (
          <span
            aria-hidden="true"
            className="mt-2 w-px flex-1 bg-brass-500/40"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pb-2">
        <Heading as="h3" size="md">
          {step.title}
        </Heading>

        <Body size="md" className="mt-2">
          {step.body}
        </Body>

        {/* The trust payload. */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="neutral">
            <span className="font-mono tabular">{weeks}</span>
            <span>&nbsp;weeks</span>
          </Badge>

          {step.paymentPoint ? (
            // Brass marks money. §2.1.5 keeps that scarce enough to mean
            // something when it appears.
            <Badge tone="accent" className="inline-flex items-center gap-1.5">
              <Icon icon={IndianRupee} size={16} />
              {step.paymentNote ?? "Payment milestone"}
            </Badge>
          ) : null}
        </div>

        {step.deliverables?.length ? (
          <div className="mt-4">
            <Datum className="block">What you receive</Datum>
            <ul className="mt-2 flex flex-col gap-2">
              {step.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-px w-3 shrink-0 bg-accent"
                  />
                  <span className="font-sans text-body-sm text-fg-secondary">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function ProcessTimeline({
  steps,
  className,
}: {
  steps: ProcessStepData[];
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((step, index) => (
        <ProcessStep
          key={step.number}
          step={step}
          isLast={index === steps.length - 1}
        />
      ))}
    </ol>
  );
}
