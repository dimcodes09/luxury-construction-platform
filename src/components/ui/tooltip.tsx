"use client";

import { Tooltip as RadixTooltip } from "radix-ui";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.1 — the tooltip on a disabled button must stay reachable, which
 * is why Button uses opacity rather than pointer-events-none.
 *
 * §10.1 also uses this for the dotted-underline term glossary: "Define
 * technical terms inline on first use via a dotted-underline tooltip."
 *
 * §9.3 warning: no hover-dependent INFORMATION anywhere. A tooltip may only
 * ever repeat or elaborate something already available — never be the sole
 * carrier of meaning, because touch users will not get it.
 */

export const TooltipProvider = RadixTooltip.Provider;

export function Tooltip({
  content,
  children,
  side = "top",
  className,
  ...rest
}: Omit<ComponentPropsWithoutRef<typeof RadixTooltip.Root>, "children"> & {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  return (
    <RadixTooltip.Root {...rest}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={8}
          className={cn(
            "z-modal max-w-70 rounded-sm bg-ink-900 px-3 py-2",
            "font-sans text-body-sm text-basalt-050 shadow-sheet",
            "dark:bg-basalt-100 dark:text-ink-900",
            className,
          )}
        >
          {content}
          <RadixTooltip.Arrow className="fill-ink-900 dark:fill-basalt-100" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

/* §10.1 — the inline glossary term. Dotted underline signals "there is more
 * here" without the visual noise of a link. */
export function GlossaryTerm({
  term,
  definition,
}: {
  term: string;
  definition: ReactNode;
}) {
  return (
    <Tooltip content={definition}>
      <button
        type="button"
        className="cursor-help underline decoration-dotted underline-offset-4"
      >
        {term}
      </button>
    </Tooltip>
  );
}
