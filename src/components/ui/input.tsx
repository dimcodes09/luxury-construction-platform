import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.3 — Text input.
 *
 * §3.3 bans floating labels outright: "they fail for autofill, screen readers,
 * and older users, and this audience skews 30–60." The label is always visible
 * and above the field — that lives in <Field>, not here.
 *
 * The `suffix` prop implements the live-formatted unit that §3.3 specifies for
 * numeric inputs — "2,400 sq ft", "₹42.5 L" — right-aligned inside the field in
 * muted text. It is display-only and never part of the value.
 */

export const inputBaseClasses = [
  "w-full rounded-sm border bg-basalt-000 text-fg",
  "px-4 py-3.5 font-sans",
  "border-basalt-200 placeholder:text-ink-300",
  "transition-colors duration-fast ease-standard",
  // §3.3 focus: 1px ink border plus the 2px brass ring at offset 2.
  "focus-visible:border-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2",
  "disabled:opacity-38 disabled:cursor-not-allowed",
  "dark:bg-basalt-800 dark:border-basalt-700",
].join(" ");

export type InputProps = ComponentPropsWithoutRef<"input"> & {
  invalid?: boolean;
  /** §3.3 — live-formatted unit shown inside the field, right-aligned. */
  suffix?: ReactNode;
};

export function Input({
  className,
  invalid = false,
  suffix,
  type = "text",
  ...rest
}: InputProps) {
  /* §3.3: numeric inputs (area, budget, phone) use inputmode="numeric" and the
   * mono family so digits align — a column of proportional figures in a cost
   * tool reads amateur (§2.2.3). */
  const isNumeric = type === "number" || rest.inputMode === "numeric";

  const field = (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        inputBaseClasses,
        "h-input",
        isNumeric && "font-mono tabular",
        // §3.3 error: the border goes danger-600 and the helper text is
        // replaced by the error message (handled by <Field>).
        invalid && "border-danger-600 focus-visible:border-danger-600",
        suffix && "pr-20",
        className,
      )}
      {...rest}
    />
  );

  if (!suffix) return field;

  return (
    <div className="relative">
      {field}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center font-mono text-body-sm text-fg-muted"
      >
        {suffix}
      </span>
    </div>
  );
}

/* §3.3 — Textarea. Min-height 132px, vertical resize only (horizontal resize
 * breaks the measure), character counter surfaces at 80% of the limit. */
export function Textarea({
  className,
  invalid = false,
  ...rest
}: ComponentPropsWithoutRef<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        inputBaseClasses,
        "min-h-33 resize-y",
        invalid && "border-danger-600 focus-visible:border-danger-600",
        className,
      )}
      {...rest}
    />
  );
}

/* §3.3 — Select.
 *
 * A NATIVE <select> deliberately. §3.3: "Native <select> on mobile (system
 * pickers are better than anything we'd build)." The custom listbox is reserved
 * for ≥1024px; until a page actually needs it, shipping the native control is
 * both more accessible and zero bytes. */
export function Select({
  className,
  invalid = false,
  children,
  ...rest
}: ComponentPropsWithoutRef<"select"> & { invalid?: boolean }) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        inputBaseClasses,
        "h-input appearance-none pr-10",
        invalid && "border-danger-600 focus-visible:border-danger-600",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}
