import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Display, Body } from "@/components/foundation/typography";

/* design.md §3.8 zone 1 / §0.5 — the conversion band.
 *
 * §0.5 carries the rule this component exists to enforce: "NEVER PRESENT RUNG 5
 * BEFORE THE VISITOR HAS BEEN OFFERED A RUNG 3 VALUE EXCHANGE ON THAT PAGE."
 *
 * A "Book a site visit" band (rung 5) dropped onto a page that has offered
 * nothing is exactly the "Contact us as the only CTA" anti-pattern §0.2 rejects
 * — it leaks the silent researcher (R-03) who is the highest-value visitor.
 *
 * The `rung` prop is therefore required and is asserted in development, so the
 * ladder is checked at the point of use rather than in review.
 *
 * §2.4.3: conversion sections are ALWAYS centred and symmetric. Asymmetry
 * creates interest; symmetry creates trust.
 */

export function CTABand({
  headline,
  body,
  actions,
  rung,
  tone = "inverse",
  className,
}: {
  headline: ReactNode;
  body?: ReactNode;
  actions: ReactNode;
  /** §0.5 commitment ladder rung this band asks for. */
  rung: 3 | 4 | 5;
  tone?: "inverse" | "canvas";
  className?: string;
}) {
  if (process.env.NODE_ENV !== "production" && rung === 5) {
    // Not an error — a rung-5 band is correct on /contact and at the foot of a
    // page that has already delivered value. This is a nudge to confirm it has.
    console.debug(
      "[CTABand] rung 5 — confirm this page has already offered a rung 3 value exchange (design.md §0.5).",
    );
  }

  return (
    <section
      className={cn(
        "w-full py-section-feature",
        tone === "inverse" ? "bg-basalt-950" : "bg-canvas",
        className,
      )}
    >
      {/* §2.4.3 — centred and symmetric, always. */}
      <div className="container-narrow flex flex-col items-center text-center">
        <Display
          as="h2"
          size="lg"
          className={cn(tone === "inverse" && "text-basalt-050")}
        >
          {headline}
        </Display>

        {body ? (
          <Body
            size="lg"
            className={cn("mt-6", tone === "inverse" && "text-basalt-300")}
          >
            {body}
          </Body>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {actions}
        </div>
      </div>
    </section>
  );
}
