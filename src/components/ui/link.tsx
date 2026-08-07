import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.2 — Link.
 *
 * The animated underline is `underline-wipe` (globals.css): a background-image
 * gradient scaled 0% → 100% from the left. §3.2 specifies this technique rather
 * than text-decoration because only background-size animates cleanly and can be
 * positioned off the baseline.
 *
 * §3.2: visited state is deliberately NOT styled on marketing pages — it
 * fragments the palette. It IS styled in the journal index, hence the prop
 * rather than a blanket rule.
 */

type LinkProps = ComponentPropsWithoutRef<typeof NextLink> & {
  /** §3.2 — only the journal index styles visited links. */
  visited?: boolean;
  /** For inverted contexts: dark hero, footer. brass-300 is AAA on basalt-900. */
  inverse?: boolean;
};

export function Link({
  className,
  visited = false,
  inverse = false,
  children,
  ...rest
}: LinkProps) {
  return (
    <NextLink
      className={cn(
        "underline-wipe",
        // §2.1.4 hard rule: brass-500 is a graphic colour only. Text on light
        // is always brass-600 or darker; on dark it is brass-300.
        inverse ? "text-brass-300" : "text-brass-700",
        visited && "visited:text-brass-700",
        className,
      )}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
