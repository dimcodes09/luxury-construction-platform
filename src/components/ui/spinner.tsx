import { cn } from "@/lib/utils";

/* design.md §3.20 — "No full-page spinners. No preloaders."
 *
 * This spinner exists ONLY for in-control loading (§3.1 button loading state).
 * Page and section loading is communicated by skeletons that match the final
 * layout exactly, so nothing shifts. Reaching for this at page level is a
 * design error, not a shortcut.
 *
 * §1.1.3 note: the branded loading indicator is the Z monogram drawing itself
 * as a structure — that belongs to route progress, not to a button.
 */

const spinnerSizes = {
  16: "size-4",
  20: "size-5",
  24: "size-6",
} as const;

export function Spinner({
  size = 20,
  className,
  label = "Loading",
}: {
  size?: keyof typeof spinnerSizes;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-block", spinnerSizes[size], className)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        // Under prefers-reduced-motion the global rule in motion.css collapses
        // this to a static ring rather than a stuttering one.
        className="size-full animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.25"
          className="opacity-25"
        />
        {/* A 90° arc. §2.8 stroke discipline applies here too: 1.25px, butt cap. */}
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="butt"
        />
      </svg>
    </span>
  );
}
