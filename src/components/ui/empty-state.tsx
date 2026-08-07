import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Heading, Body } from "@/components/foundation/typography";

/* design.md §3.20 — Empty states.
 *
 * "Every empty state has THREE parts: an illustration (a technical line drawing
 * from our craft set), a plain sentence explaining WHY it's empty, and ONE
 * action." The prop signature enforces all three — `title`, `body` and `action`
 * are required, so an empty state cannot ship as a bare "No results".
 *
 * The §3.20 copy table is deliberately not hard-coded here: each surface has
 * its own sentence ("We've built 61 homes — try widening the area range"), and
 * a generic default would get shipped everywhere.
 */

export function EmptyState({
  illustration,
  title,
  body,
  action,
  className,
}: {
  /** A technical line drawing from the §2.8 craft set. Defaults to the plate. */
  illustration?: ReactNode;
  title: ReactNode;
  /** §3.20 — explain WHY it is empty, in a plain sentence. */
  body: ReactNode;
  /** §3.20 — exactly one. Two actions is a decision the user did not ask for. */
  action: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 px-6 py-20 text-center",
        className,
      )}
    >
      <div aria-hidden="true" className="text-brass-500">
        {illustration ?? <MonogramPlate />}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Heading as="p" size="md">
          {title}
        </Heading>
        <Body size="md" className="text-balance">
          {body}
        </Body>
      </div>

      {action}
    </div>
  );
}

/* design.md §1.1.3 — the Z monogram, drawn as a STRUCTURAL DIAGRAM rather than
 * a typographic letter: distinct chord and brace weights, and node dots at the
 * two joints exactly as a truss diagram renders them.
 *
 * §1.1.3: "The letter Z is the most structurally expressive letter in the Latin
 * alphabet: two horizontals joined by a diagonal. That is, precisely, a braced
 * frame." It is also the §3.20 fallback for a failed image, so it lives here
 * rather than in a page.
 */
export function MonogramPlate({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("size-16", className)}
    >
      <rect
        x="0.5"
        y="0.5"
        width="63"
        height="63"
        rx="2"
        stroke="currentColor"
        strokeWidth="1"
        className="opacity-40"
      />
      {/* Top chord — 1.5px hairline */}
      <path d="M16 20h32" stroke="currentColor" strokeWidth="1.5" />
      {/* Diagonal brace — 2.5px, the member that stops the frame racking */}
      <path d="M48 20 16 44" stroke="currentColor" strokeWidth="2.5" />
      {/* Bottom chord — 1.5px hairline */}
      <path d="M16 44h32" stroke="currentColor" strokeWidth="1.5" />
      {/* Node dots at the joints, as a truss diagram would render them */}
      <circle cx="48" cy="20" r="1.75" fill="currentColor" />
      <circle cx="16" cy="44" r="1.75" fill="currentColor" />
    </svg>
  );
}
