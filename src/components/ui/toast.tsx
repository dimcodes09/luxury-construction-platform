"use client";

import { Toast as RadixToast } from "radix-ui";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/foundation/icon";

/* design.md §3.21 — Toast.
 *
 * "Bottom-centre mobile / bottom-right desktop, radius-md, --shadow-sheet, 4px
 * leading semantic bar, auto-dismiss 5s (NEVER for errors), aria-live polite
 * (assertive for errors), max 3 stacked."
 *
 * The never-auto-dismiss-errors rule matters commercially: §3.20 pairs a
 * network failure with "the form retains all values + a Retry button + a
 * WhatsApp fallback." A toast that vanishes takes the retry affordance with it.
 */

export const ToastProvider = RadixToast.Provider;

const toastVariants = cva(
  [
    "relative flex w-full items-start gap-3 overflow-hidden rounded-md",
    "bg-raised p-4 pl-5 hairline shadow-sheet",
    // The 4px leading semantic bar.
    "before:absolute before:inset-y-0 before:left-0 before:w-1",
    "data-[state=open]:animate-slide-in-bottom data-[state=closed]:animate-fade-out",
  ],
  {
    variants: {
      tone: {
        neutral: "before:bg-basalt-300",
        success: "before:bg-success-600",
        warning: "before:bg-warning-600",
        danger: "before:bg-danger-600",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Toast({
  tone = "neutral",
  title,
  description,
  action,
  className,
  ...rest
}: Omit<ComponentPropsWithoutRef<typeof RadixToast.Root>, "title"> &
  VariantProps<typeof toastVariants> & {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
  }) {
  const isError = tone === "danger";

  return (
    <RadixToast.Root
      // §3.21 — errors never auto-dismiss.
      duration={isError ? Infinity : 5000}
      type={isError ? "foreground" : "background"}
      className={cn(toastVariants({ tone }), className)}
      {...rest}
    >
      <div className="min-w-0 flex-1">
        <RadixToast.Title className="font-sans text-body-md font-medium text-fg">
          {title}
        </RadixToast.Title>
        {description ? (
          <RadixToast.Description className="mt-1 text-body-sm text-fg-secondary">
            {description}
          </RadixToast.Description>
        ) : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>

      <RadixToast.Close
        aria-label="Dismiss"
        className="grid size-8 shrink-0 place-items-center rounded-full text-fg-muted transition-colors duration-fast hover:bg-basalt-100 focus-visible:outline-2 dark:hover:bg-basalt-800"
      >
        <Icon icon={X} size={16} />
      </RadixToast.Close>
    </RadixToast.Root>
  );
}

/* §3.21 — the viewport. Bottom-centre on mobile, bottom-right from `md`.
 * Max 3 stacked is enforced by the caller's queue, not here. */
export function ToastViewport({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixToast.Viewport>) {
  return (
    <RadixToast.Viewport
      className={cn(
        "fixed inset-x-0 bottom-0 z-toast flex max-h-screen w-full flex-col gap-3 p-4",
        "pb-safe",
        "md:inset-x-auto md:bottom-6 md:right-6 md:max-w-96",
        className,
      )}
      {...rest}
    />
  );
}

export { toastVariants };
