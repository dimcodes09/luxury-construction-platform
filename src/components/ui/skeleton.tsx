import { cn } from "@/lib/utils";

/* design.md §3.20 — Loading philosophy.
 *
 * "No full-page spinners. No preloaders. Loading is communicated by skeletons
 * that match final layout EXACTLY, so nothing shifts." A skeleton whose
 * dimensions differ from the content it stands in for is worse than no
 * skeleton — it guarantees the CLS it was meant to prevent (budget: <0.05).
 *
 * The shimmer is a 12% white gradient sweeping left→right over 1600ms. Under
 * prefers-reduced-motion the sweep is suppressed and a static block remains,
 * which is why the sheen is a child element rather than a background animation.
 */

export function Skeleton({
  className,
  ...rest
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-sm bg-skeleton",
        className,
      )}
      {...rest}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/12 to-transparent motion-reduce:hidden" />
    </div>
  );
}

/* §3.20 — "Project grid: 6 skeleton cards, exact 16:10 ratio."
 * The ratio is hard-coded to match ProjectCard (§3.10) precisely. */
export function ProjectCardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-16/10 w-full rounded-md" />
      <div className="p-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </div>
    </div>
  );
}

/* §3.20 — "Admin table: 8 skeleton rows." */
export function TableRowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-hairline px-4 py-3"
        >
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}
