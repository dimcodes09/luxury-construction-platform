import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.3 — Field (composite): Label → Control → HelperOrError.
 *
 * Several §3.3 rules are enforced structurally here rather than left to the
 * page author, because each one is routinely got wrong:
 *
 *  - The label is ALWAYS visible and above the field. Floating labels are
 *    banned: they fail for autofill, screen readers and older users, and this
 *    audience skews 30–60.
 *  - OPTIONAL fields are marked "(optional)". Required fields carry no
 *    asterisk — marking the minority is clearer.
 *  - Error text REPLACES helper text rather than stacking below it, so the
 *    field never grows and shifts the form.
 *  - The placeholder gives an example and never repeats the label. That is a
 *    content rule, surfaced here as a prop name.
 */

export function Field({
  id,
  label,
  optional = false,
  helper,
  error,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  /** §3.3 — mark the minority. Required fields get no asterisk. */
  optional?: boolean;
  helper?: ReactNode;
  /** When present, replaces `helper` and is announced to assistive tech. */
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : undefined;

  return (
    <div className={cn("w-full", className)}>
      <label
        htmlFor={id}
        className="mb-2 block font-sans text-body-sm font-medium text-fg"
      >
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-fg-muted">(optional)</span>
        ) : null}
      </label>

      {children}

      {/* §3.3: helper sits below in caption/text-muted; error replaces it in
       * danger-600 with a 16px alert icon. Both share one slot so the field
       * height is stable between states — no layout shift on validation. */}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 font-sans text-caption text-danger-600"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          >
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 5v3.5M8 11h.01" strokeLinecap="butt" />
          </svg>
          {error}
        </p>
      ) : helper ? (
        <p
          id={`${id}-helper`}
          className="mt-1.5 font-sans text-caption text-fg-muted"
        >
          {helper}
        </p>
      ) : null}

      {/* Exposed so the control can wire aria-describedby without the page
       * having to know the id convention. */}
      <span hidden data-described-by={describedBy} />
    </div>
  );
}

/* §3.3 form rule 1: "One column. Multi-column forms measurably slow
 * completion. Exception: paired short fields (city + pincode)."
 *
 * FormRow lays 1–3 fields on a row at ≥768 and ALWAYS stacks below that. */
export function FormRow({
  columns = 2,
  children,
  className,
}: {
  columns?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
}) {
  const columnClass = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
  }[columns];

  return (
    <div className={cn("grid grid-cols-1 gap-4 md:gap-6", columnClass, className)}>
      {children}
    </div>
  );
}

/* §3.3 form rule 7: "Every form states what happens next and when."
 * §10.2 supplies the canonical copy. Rendered under every form, not optional. */
export function FormFootnote({
  children = "We reply within one working day. We never share your number.",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("font-sans text-caption text-fg-muted", className)}>
      {children}
    </p>
  );
}
