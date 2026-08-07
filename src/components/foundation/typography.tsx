import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* design.md §2.2 — typography primitives.
 *
 * These exist so that a size token and its FAMILY travel together. `text-display-xl`
 * only sets size/leading/tracking/weight; forgetting `font-display` next to it is
 * the single easiest way to quietly ship the wrong typeface, so the pairing is
 * encoded here rather than left to memory.
 */

type PolymorphicProps<E extends ElementType> = {
  as?: E;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, "as" | "className" | "children">;

/* §2.2.2 display roles — always Fraunces.
 *
 * §2.2.3: display headings beginning with a quote, A, V, W, T, Y or J take a
 * negative left inset so the block aligns to the grid optically rather than
 * mathematically. Pass `optical` at those call sites. */
const displaySizes = {
  xxl: "text-display-xxl",
  xl: "text-display-xl",
  lg: "text-display-lg",
} as const;

export function Display<E extends ElementType = "h1">({
  as,
  size = "xl",
  optical = false,
  className,
  children,
  ...rest
}: PolymorphicProps<E> & {
  size?: keyof typeof displaySizes;
  optical?: boolean;
}) {
  const Component = (as ?? "h1") as ElementType;
  return (
    <Component
      className={cn(
        "font-display text-fg",
        displaySizes[size],
        // §2.2.3 measure: display headings ≤16ch desktop, ≤20ch mobile.
        "measure-display",
        optical && "optical",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

/* §2.2.2 heading roles. xl/lg are Fraunces; md/sm switch to Inter 600 —
 * the serif stops working below roughly 24px in UI contexts. */
const headingSizes = {
  xl: "text-heading-xl font-display",
  lg: "text-heading-lg font-display",
  md: "text-heading-md font-sans",
  sm: "text-heading-sm font-sans",
} as const;

export function Heading<E extends ElementType = "h2">({
  as,
  size = "lg",
  className,
  children,
  ...rest
}: PolymorphicProps<E> & { size?: keyof typeof headingSizes }) {
  const Component = (as ?? "h2") as ElementType;
  return (
    <Component
      className={cn("text-fg", headingSizes[size], className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

const bodySizes = {
  lg: "text-body-lg",
  md: "text-body-md",
  sm: "text-body-sm",
} as const;

export function Body<E extends ElementType = "p">({
  as,
  size = "md",
  measure = true,
  className,
  children,
  ...rest
}: PolymorphicProps<E> & {
  size?: keyof typeof bodySizes;
  /** §2.2.3 — body is capped at 68ch. Never full-bleed. */
  measure?: boolean;
}) {
  const Component = (as ?? "p") as ElementType;
  return (
    <Component
      className={cn(
        "font-sans text-fg-secondary",
        bodySizes[size],
        measure && "measure-body",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Caption<E extends ElementType = "p">({
  as,
  className,
  children,
  ...rest
}: PolymorphicProps<E>) {
  const Component = (as ?? "p") as ElementType;
  return (
    <Component
      className={cn("font-sans text-caption text-fg-muted", className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

/* §2.2.2 label — Inter 500, uppercase, +0.08em tracking (baked into the token).
 * §2.2.3: all-caps roles are only ever `label` and `datum`. */
export function Label<E extends ElementType = "span">({
  as,
  className,
  children,
  ...rest
}: PolymorphicProps<E>) {
  const Component = (as ?? "span") as ElementType;
  return (
    <Component
      className={cn("font-sans text-label uppercase text-fg-muted", className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

/* §2.2.2 datum — JetBrains Mono, uppercase. §1.1.1: with a coined name,
 * materiality IS the brand, and monospace numerals are the cheapest available
 * signal of engineering precision. Used for dimensions, specs, dates, codes. */
export function Datum<E extends ElementType = "span">({
  as,
  className,
  children,
  ...rest
}: PolymorphicProps<E>) {
  const Component = (as ?? "span") as ElementType;
  return (
    <Component
      className={cn("font-mono text-datum uppercase text-fg-muted", className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

/* §2.2.3 — tabular figures are NON-NEGOTIABLE on every price, date, dimension
 * and stat. Proportional figures in a stat band look amateur, and a counter
 * animation with proportional figures visibly jitters as it counts. */
const numeralSizes = {
  xl: "text-numeral-xl",
  md: "text-numeral-md",
} as const;

export function Numeral<E extends ElementType = "span">({
  as,
  size = "md",
  className,
  children,
  ...rest
}: PolymorphicProps<E> & { size?: keyof typeof numeralSizes }) {
  const Component = (as ?? "span") as ElementType;
  return (
    <Component
      data-numeric=""
      className={cn("font-mono tabular", numeralSizes[size], className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
