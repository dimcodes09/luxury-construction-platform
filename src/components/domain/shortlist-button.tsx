"use client";

import { Heart } from "lucide-react";
import type { MouseEvent } from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/foundation/icon";

/* design.md §0.5 rung 2 — the micro-commitment.
 *
 * "Save a project to a Shortlist (local, no login). Local intent signal, no
 * PII." SRS FR-GBL-07: device-local, capped at 50, schema-versioned. There is
 * no account and never will be one on the public site.
 *
 * §10.3 CTA lexicon: the accessible name is "Save to shortlist". `Like` and
 * `Favourite` are banned — they describe a feeling, not an outcome.
 *
 * §9.3: the heart is hover-revealed on pointer devices but ALWAYS VISIBLE on
 * touch, because "no hover-dependent information anywhere."
 */

export function ShortlistButton({
  saved,
  onToggle,
  projectTitle,
  className,
}: {
  saved: boolean;
  onToggle: () => void;
  /** Named in the accessible label so a screen reader knows WHICH project. */
  projectTitle: string;
  className?: string;
}) {
  /* §3.10: "the entire card is one link; the shortlist heart is a nested button
   * with stopPropagation." Without this, saving navigates. */
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={
        saved
          ? `Remove ${projectTitle} from shortlist`
          : `Save ${projectTitle} to shortlist`
      }
      className={cn(
        "grid size-target place-items-center rounded-full",
        "bg-basalt-950/40 text-basalt-050 backdrop-blur-sm",
        "transition-all duration-fast ease-standard",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "hover:bg-basalt-950/60",
        // Always visible on touch; fades in with the card on pointer devices.
        "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
        saved && "md:opacity-100",
        className,
      )}
    >
      <Icon
        icon={Heart}
        size={20}
        className={cn(saved && "fill-brass-400 text-brass-400")}
      />
    </button>
  );
}
