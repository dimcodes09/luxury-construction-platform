import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.4 — Card.
 *
 * "No shadow at rest." Separation comes from a hairline border and a background
 * step (§2.5). --shadow-lift exists for card hover and for nothing else.
 *
 * §3.4: on hover the inner media scales 1.0 → 1.03 with the parent clipping,
 * and CONTENT NEVER MOVES. Text that shifts under the cursor reads cheap and
 * makes the card feel unstable; only the image is allowed to respond.
 */

const cardVariants = cva(
  [
    "relative overflow-hidden bg-raised",
    "transition-shadow duration-base ease-standard",
  ],
  {
    variants: {
      variant: {
        default: "hairline rounded-md",
        // For dense grids: no fill, hairline only.
        bordered: "hairline rounded-md bg-transparent",
        elevated: "hairline rounded-md shadow-sheet",
        media: "hairline overflow-hidden rounded-md",
        flush: "rounded-md",
      },
      /* §3.4 hover is pointer-only (§3.22). The `group` class must be present on
       * the same element for the media scale to reach its child. */
      interactive: {
        true: "group hover:shadow-lift hover:border-basalt-300",
        false: "",
      },
      padding: {
        none: "",
        // §2.3 component spacing: 24px mobile / 32px desktop.
        default: "p-6 md:p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
      padding: "none",
    },
  },
);

export function Card({
  className,
  variant,
  interactive,
  padding,
  ...rest
}: ComponentPropsWithoutRef<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      className={cn(cardVariants({ variant, interactive, padding }), className)}
      {...rest}
    />
  );
}

/* The media well. Clips its child so the 1.03 scale never escapes the card. */
export function CardMedia({
  className,
  ratio = "16/10",
  ...rest
}: ComponentPropsWithoutRef<"div"> & {
  ratio?: "16/10" | "16/9" | "4/3" | "1/1";
}) {
  const ratioClass = {
    "16/10": "aspect-16/10",
    "16/9": "aspect-video",
    "4/3": "aspect-4/3",
    "1/1": "aspect-square",
  }[ratio];

  return (
    <div
      className={cn("relative w-full overflow-hidden", ratioClass, className)}
      {...rest}
    />
  );
}

/* Applied to the <img>/<Image> inside CardMedia. §3.4: 1.0 → 1.03 on parent
 * hover. Transform only — never width/height (§7.3). */
export const cardMediaImageClasses =
  "size-full object-cover transition-transform duration-base ease-standard group-hover:scale-103";

export function CardBody({
  className,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("p-6 md:p-8", className)} {...rest} />;
}

export { cardVariants };
