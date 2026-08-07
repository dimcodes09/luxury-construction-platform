import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/* design.md §2.8 — Iconography.
 *
 * Lucide is the base library, but its default 2px stroke is too heavy for this
 * system: §2.8 specifies 1.25px, because a finer stroke reads more precise and
 * pairs with our hairline borders. This wrapper is the only place icons should
 * be rendered, so that stroke weight cannot drift icon by icon.
 *
 * §2.8 also bans: filled icons, duotone, emoji, sizes below 16px, and icons
 * without an adjacent text label in navigation or CTAs.
 */

const iconSizes = {
  16: "size-4",
  20: "size-5",
  24: "size-6",
  32: "size-8",
} as const;

export type IconSize = keyof typeof iconSizes;

export function Icon({
  icon: LucideGlyph,
  size = 20,
  className,
  label,
}: {
  icon: LucideIcon;
  /** §2.8 — 16/20/24/32 only. Below 16px icons are banned; use a label. */
  size?: IconSize;
  className?: string;
  /**
   * Omit for decorative icons sitting next to text (the common case) — they
   * are then correctly hidden from assistive tech. Supply only when the icon
   * is the sole carrier of meaning, e.g. an icon-only button.
   */
  label?: string;
}) {
  return (
    <LucideGlyph
      // §2.8: 24×24 grid, 1.25px stroke (not Lucide's default 2), butt caps,
      // miter joins, no fills.
      strokeWidth={1.25}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      // §2.8: icons inherit currentColor. Brass icons are accent moments only,
      // never dense UI.
      className={cn("shrink-0", iconSizes[size], className)}
    />
  );
}
