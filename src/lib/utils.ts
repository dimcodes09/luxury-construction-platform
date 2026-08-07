import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* tailwind-merge, taught our theme.
 *
 * THE BUG THIS FIXES
 * ------------------
 * tailwind-merge resolves conflicts by putting each class into a group and
 * keeping only the last class per group. It infers groups from Tailwind's
 * DEFAULT scales. Our scales are custom (design.md §2.1.2 colours, §2.2.2 type),
 * so out of the box it could not tell a text COLOUR from a text SIZE — both are
 * `text-*` — and silently dropped one:
 *
 *   twMerge("text-basalt-000 text-body-md")  →  "text-body-md"     colour lost
 *   twMerge("text-fg text-heading-md")       →  "text-heading-md"  colour lost
 *   twMerge("text-brass-700 text-datum")     →  "text-datum"       colour lost
 *
 * Every text colour that shared a cn() call with a size class was being
 * stripped site-wide, which is why the palette did not render as specified.
 *
 * Declaring both scales below means each class lands in exactly one group, so
 * nothing collides and nothing is dropped. The same applies to `border-control`
 * (a WIDTH, §3.3) which was being read as a border COLOUR.
 *
 * These lists must track styles/tokens/*.css. If a token is added there and not
 * here, its utility starts getting silently dropped again.
 */

/** §2.2.2 — the type scale. Every one of these is a FONT SIZE, not a colour. */
const FONT_SIZES = [
  "display-xxl",
  "display-xl",
  "display-lg",
  "heading-xl",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "caption",
  "label",
  "datum",
  "numeral-xl",
  "numeral-md",
] as const;

/** §2.1.2 ramps + §2.1.3 semantic aliases. Every one of these is a COLOUR. */
const COLORS = [
  // Neutral ramp
  "basalt-950", "basalt-900", "basalt-800", "basalt-700", "basalt-600",
  "basalt-500", "basalt-400", "basalt-300", "basalt-200", "basalt-100",
  "basalt-050", "basalt-000",
  // Ink
  "ink-900", "ink-700", "ink-500", "ink-300",
  // Brass
  "brass-700", "brass-600", "brass-500", "brass-400", "brass-300", "brass-100",
  // Kota
  "kota-800", "kota-600", "kota-400", "kota-200",
  // Blueprint — the technical layer (§2.1.1)
  "blueprint-700", "blueprint-500", "blueprint-300", "blueprint-100",
  // Semantic status
  "success-600", "success-100", "warning-600", "warning-100",
  "danger-600", "danger-100", "info-600", "info-100",
  // §2.1.3 aliases — what components actually reach for
  "canvas", "surface", "raised", "inverse", "technical",
  "fg", "fg-secondary", "fg-muted", "fg-accent", "fg-inverse",
  "hairline", "strong", "accent", "focus", "scrim", "skeleton",
  // Third-party brand (§3.1, §3.7)
  "whatsapp",
  // shadcn/ui compatibility names
  "background", "foreground", "card", "card-foreground",
  "popover", "popover-foreground", "primary", "primary-foreground",
  "secondary", "secondary-foreground", "muted", "muted-foreground",
  "accent-foreground", "destructive", "border", "input", "ring",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // §2.2.2 — sizes, so they stop being mistaken for colours.
      "font-size": [{ text: [...FONT_SIZES] }],
      // §2.1 — colours, so they stop being mistaken for sizes.
      "text-color": [{ text: [...COLORS] }],
      // §3.3 — `border-control` is a 1.5px WIDTH, not a colour.
      "border-w": ["border-control"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
