import { cn } from "@/lib/utils";

/* design.md §2.5 — the system is hairline-first.
 *
 * "1px solid var(--border-hairline) is the default separator." Elevation comes
 * from borders, background steps and space rather than shadows, so this
 * component does a disproportionate amount of the layout work in the system.
 *
 * The `hairline` utility (globals.css) drops to 0.5px on ≥2dppx screens for
 * genuine optical fineness (§2.5).
 */

export function Divider({
  orientation = "horizontal",
  className,
  ...rest
}: React.ComponentPropsWithoutRef<"div"> & {
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-hairline",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...rest}
    />
  );
}
