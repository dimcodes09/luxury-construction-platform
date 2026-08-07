"use client";

import { Slot } from "radix-ui";
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/foundation/icon";
import { Spinner } from "./spinner";

/* design.md §3.1 — Button.
 *
 * Seven variants, four sizes, and all seven states. The states are the point:
 * design-process.md §6 failure mode 2 is "skipping states — it demos
 * beautifully and feels broken in use." Every state below is built here, not
 * deferred.
 *
 * The signature detail is the hover treatment. §3.1: buttons do NOT lift or
 * scale on hover — that reads consumer-app. Instead an inset 1px brass hairline
 * wipes in from the left. It is implemented as an ::after pseudo-element with a
 * scaleX transform so it composites on the GPU and animates nothing that
 * triggers layout (§7.3: never animate top/left/width/height).
 */

const buttonVariants = cva(
  [
    // Layout. `relative` anchors the hairline wipe; `isolate` keeps it from
    // escaping a stacking context set by a parent card.
    "relative isolate inline-flex items-center justify-center gap-2",
    "font-sans whitespace-nowrap select-none",
    "rounded-sm border transition-colors duration-fast ease-standard",

    // §3.1 hover: the inset brass hairline, wiping from the left.
    // Tailwind supplies content:"" automatically for after: variants.
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-sm",
    "after:border after:border-brass-500",
    "after:origin-left after:scale-x-0 after:transition-transform",
    "after:duration-fast after:ease-standard",
    "hover:after:scale-x-100",

    // §3.1 active: a barely perceptible press. Not a bounce.
    "active:translate-y-px",

    // §9.4 focus is never removed. globals.css sets the ring; this guarantees
    // the offset clears the hairline.
    "focus-visible:outline-2 focus-visible:outline-offset-3",

    // §3.1 disabled: 38% opacity and NEVER pointer-events-none — the tooltip
    // explaining why must stay reachable.
    "disabled:opacity-38 disabled:cursor-not-allowed disabled:after:scale-x-0",
    "aria-disabled:opacity-38 aria-disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        // §3.1: max ONE primary per viewport.
        primary:
          "border-transparent bg-ink-900 text-basalt-050 hover:bg-basalt-800 dark:bg-basalt-050 dark:text-ink-900 dark:hover:bg-basalt-100",
        secondary:
          "border-ink-900 bg-transparent text-ink-900 hover:bg-basalt-100 dark:border-basalt-050 dark:text-basalt-050 dark:hover:bg-basalt-800",
        // §3.1: conversion actions only. Never in the same viewport as primary.
        accent:
          "border-transparent bg-brass-600 text-basalt-000 hover:bg-brass-700 dark:bg-brass-500 dark:text-basalt-950 dark:hover:bg-brass-400",
        ghost:
          "border-transparent bg-transparent text-ink-700 hover:bg-basalt-100 dark:text-basalt-300 dark:hover:bg-basalt-800",
        // §3.2 link styling; the underline wipe lives on the Link primitive.
        link: "border-transparent bg-transparent text-brass-700 underline-offset-4 hover:underline dark:text-brass-300 after:hidden",
        // §3.1: the WhatsApp channel only. Colour is locked by the third party.
        whatsapp:
          "border-transparent bg-whatsapp text-basalt-000 hover:brightness-110",
        danger:
          "border-transparent bg-danger-600 text-basalt-000 hover:brightness-110",
      },
      size: {
        // §3.1 sizes. Heights come from named control tokens so 54px never
        // becomes an arbitrary value.
        sm: "h-control-sm px-4 py-2 text-body-sm font-medium",
        md: "h-control-md px-6 py-3 text-body-md font-medium",
        lg: "h-control-lg px-8 py-4 text-body-lg font-medium",
        xl: "h-control-xl px-10 py-5 text-heading-sm",
      },
      /* §3.1: "All interactive targets are ≥44×44px including on desktop.
       * `sm` buttons get an invisible expanded hit area via ::after." Ours is
       * ::before, since ::after is spoken for by the hairline wipe. */
      expandHit: {
        // Tailwind supplies content:"" for before:/after: variants automatically.
        true: "before:absolute before:left-0 before:top-1/2 before:h-target before:w-full before:-translate-y-1/2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      expandHit: false,
    },
  },
);

export type ButtonProps = ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** §3.1 loading: width locks, label holds at 40%, spinner cross-fades in. */
    loading?: boolean;
    /** §3.1 success: label swaps to a check + confirmation word for 1600ms. */
    success?: boolean;
    successLabel?: string;
    iconLeading?: ReactNode;
    iconTrailing?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  expandHit,
  asChild = false,
  loading = false,
  success = false,
  successLabel = "Saved",
  iconLeading,
  iconTrailing,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  // §3.1: sm buttons must still clear the 44px target (§9.3).
  const needsExpandedHit = expandHit ?? size === "sm";

  const classes = cn(
    buttonVariants({ variant, size, expandHit: needsExpandedHit }),
    className,
  );

  /* asChild renders the caller's own element (usually a NextLink) with our
   * styling merged onto it. Radix Slot requires EXACTLY ONE child, so the
   * label/loading/success structure below cannot be used here — and should not
   * be: `loading` and `success` describe an async action a link does not have.
   * Anything needing those states is a real <button>. */
  if (asChild) {
    return (
      <Slot.Root className={classes} {...rest}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      className={classes}
      // §3.1 disabled uses aria-disabled rather than the native attribute where
      // possible so the control stays focusable and its tooltip reachable.
      disabled={disabled}
      aria-busy={loading || undefined}
      data-state={success ? "success" : loading ? "loading" : "default"}
      {...rest}
    >
      {/* The label. It stays mounted in every state so the button's intrinsic
       * width never changes — §3.1: "Width is locked to prevent layout shift." */}
      <span
        className={cn(
          "inline-flex items-center gap-2 transition-opacity duration-fast",
          loading && "opacity-40",
          success && "opacity-0",
        )}
      >
        {iconLeading}
        {children}
        {iconTrailing}
      </span>

      {loading ? (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner size={16} />
        </span>
      ) : null}

      {success ? (
        <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
          <Icon icon={Check} size={16} />
          {successLabel}
        </span>
      ) : null}
    </button>
  );
}

/* §3.1 success state: "…for 1600ms, then reverts."
 *
 * Exported as a hook rather than baked into the button so the timer belongs to
 * whoever owns the async action, and so it is cancelled correctly on unmount
 * instead of setting state on a dead component. */
export function useSuccessFlash(durationMs = 1600) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flash = useCallback(() => {
    setActive(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(false), durationMs);
  }, [durationMs]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { active, flash };
}

export { buttonVariants };
