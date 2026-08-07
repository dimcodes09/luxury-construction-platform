import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.0 primitives — Chip and Badge.
 *
 * Chip = an interactive, removable or selectable token (filters, addons).
 * Badge = a static status marker (verified, tier, draft/published).
 * They look similar and behave differently; keeping them separate stops filter
 * chips acquiring status colours and vice versa.
 */

const chipVariants = cva(
  [
    "inline-flex items-center gap-2 rounded-sm border font-sans text-body-sm",
    "px-3 py-1.5 transition-colors duration-fast ease-standard",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:opacity-38 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      selected: {
        true: "border-ink-900 bg-ink-900 text-basalt-050 dark:border-basalt-050 dark:bg-basalt-050 dark:text-ink-900",
        false:
          "border-hairline bg-transparent text-fg-secondary hover:bg-basalt-100 dark:hover:bg-basalt-800",
      },
    },
    defaultVariants: { selected: false },
  },
);

export function Chip({
  className,
  selected,
  ...rest
}: ComponentPropsWithoutRef<"button"> & VariantProps<typeof chipVariants>) {
  return (
    <button
      type="button"
      aria-pressed={selected ?? false}
      className={cn(chipVariants({ selected }), className)}
      {...rest}
    />
  );
}

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-sans text-label uppercase",
  {
    variants: {
      tone: {
        neutral: "bg-basalt-100 text-ink-700 dark:bg-basalt-800 dark:text-basalt-300",
        // §2.1.1 — Blueprint is reserved for the technical layer. A badge using
        // it is asserting "this is engineering output", not decoration.
        technical: "bg-blueprint-100 text-blueprint-700",
        accent: "bg-brass-100 text-brass-700",
        success: "bg-success-100 text-success-600",
        warning: "bg-warning-100 text-warning-600",
        danger: "bg-danger-100 text-danger-600",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...rest
}: ComponentPropsWithoutRef<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...rest} />;
}

export { chipVariants, badgeVariants };
