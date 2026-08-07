import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.0 composites — Table.
 *
 * §9.2 responsive behaviour: card list below 768, horizontal scroll to 1023,
 * full table at ≥1024. The wrapper below handles the scroll case; the card-list
 * transform is a per-page decision because which columns survive is
 * content-specific.
 *
 * §2.3 — table cell padding is 12px 16px.
 * §2.2.3 — every numeric cell carries tabular figures, so a column of costs
 * aligns on the decimal rather than drifting.
 */

export function TableWrapper({
  className,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      // Horizontal scroll is contained here so the PAGE never scrolls
      // sideways — §9.4 requires no horizontal scroll at 320px or 200% zoom.
      className={cn("w-full overflow-x-auto", className)}
      {...rest}
    />
  );
}

export function Table({ className, ...rest }: ComponentPropsWithoutRef<"table">) {
  return (
    <table
      className={cn("w-full border-collapse text-left font-sans", className)}
      {...rest}
    />
  );
}

export function THead({ className, ...rest }: ComponentPropsWithoutRef<"thead">) {
  return <thead className={cn("border-b border-hairline", className)} {...rest} />;
}

export function TH({ className, ...rest }: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-4 py-3 font-sans text-label uppercase text-fg-muted",
        className,
      )}
      {...rest}
    />
  );
}

export function TBody({ className, ...rest }: ComponentPropsWithoutRef<"tbody">) {
  return <tbody className={className} {...rest} />;
}

export function TR({ className, ...rest }: ComponentPropsWithoutRef<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-hairline transition-colors duration-fast ease-standard",
        // §3.22 — admin table row hover.
        "hover:bg-basalt-100 dark:hover:bg-basalt-800",
        className,
      )}
      {...rest}
    />
  );
}

export function TD({
  className,
  numeric = false,
  ...rest
}: ComponentPropsWithoutRef<"td"> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-body-sm text-fg-secondary",
        // §2.2.3 — non-negotiable on prices, dates, dimensions and stats.
        numeric && "font-mono tabular text-right",
        className,
      )}
      {...rest}
    />
  );
}
