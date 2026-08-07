import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { DatumLine } from "@/components/foundation/datum-line";
import { Heading, Body } from "@/components/foundation/typography";

/* design.md §1.5 / §7.7 — SectionHeader.
 *
 * Every section on the site opens with a datum line, which is what makes the
 * §1.5 device "the connective tissue of the whole identity" rather than a
 * decoration used twice.
 *
 * Motion (§7.7, home S04): "M2 then M1 — rule first, header +150ms." The
 * data-motion hooks are placed here so the Step 8 motion pass can target every
 * section header at once instead of re-declaring the pattern per page.
 */

export function SectionHeader({
  index,
  label,
  title,
  body,
  action,
  align = "left",
  className,
}: {
  /** Drawing-sheet number, e.g. "02". */
  index?: string;
  /** The datum label, e.g. "SELECTED WORK". */
  label: string;
  title: ReactNode;
  body?: ReactNode;
  /** A single CTA, right-aligned from `md` up. */
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "w-full",
        align === "center" && "flex flex-col items-center text-center",
        className,
      )}
    >
      <DatumLine index={index} label={label} />

      <div
        className={cn(
          "mt-6 flex flex-col gap-6",
          action && "md:flex-row md:items-end md:justify-between",
        )}
      >
        <div className={cn(align === "center" && "flex flex-col items-center")}>
          <Heading as="h2" size="xl" data-motion="M1">
            {title}
          </Heading>

          {body ? (
            <Body size="lg" className="mt-4" data-motion="M1">
              {body}
            </Body>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

/* The standard section wrapper. §2.3 vertical rhythm lives here so no page has
 * to remember whether a section is `standard`, `feature` or `editorial`. */
export function Section({
  rhythm = "standard",
  container = "base",
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"section"> & {
  rhythm?: "standard" | "feature" | "editorial";
  container?: "base" | "wide" | "narrow" | "prose" | "full";
}) {
  const rhythmClass = {
    standard: "py-section",
    feature: "py-section-feature",
    editorial: "py-section-editorial",
  }[rhythm];

  const containerClass = {
    base: "container-base",
    wide: "container-wide",
    narrow: "container-narrow",
    prose: "container-prose",
    full: "container-full",
  }[container];

  return (
    <section className={cn(rhythmClass, className)} {...rest}>
      <div className={containerClass}>{children}</div>
    </section>
  );
}
