import NextLink from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./button";

/* design.md / SRS FR-PORT-03 — "Pagination via an explicit `Load more` control;
 * INFINITE SCROLL IS PROHIBITED."
 *
 * That prohibition is load-bearing, not stylistic: infinite scroll makes the
 * footer unreachable (which holds the trust band, GSTIN and registration number
 * — §3.8 zone 3), breaks the back button, and makes results unshareable.
 *
 * Numbered pagination is provided alongside because §NFR-SEO-05 needs crawlable
 * links to deep result pages; `Load more` alone leaves them undiscoverable.
 */

export function LoadMore({
  onClick,
  loading = false,
  remaining,
  className,
}: {
  onClick?: () => void;
  loading?: boolean;
  /** Shown so the user can judge whether another click is worth it. */
  remaining?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Button variant="secondary" size="lg" onClick={onClick} loading={loading}>
        Load more
      </Button>
      {typeof remaining === "number" ? (
        <p className="font-mono text-datum uppercase text-fg-muted">
          {remaining} more
        </p>
      ) : null}
    </div>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  hrefForPage,
  className,
}: {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              <NextLink
                href={hrefForPage(page)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  // §9.3 — 44px target minimum, even for a single digit.
                  "grid size-target place-items-center rounded-sm font-mono text-body-sm tabular",
                  "transition-colors duration-fast ease-standard",
                  "focus-visible:outline-2 focus-visible:outline-offset-2",
                  isCurrent
                    ? "bg-ink-900 text-basalt-050 dark:bg-basalt-050 dark:text-ink-900"
                    : "text-fg-secondary hover:bg-basalt-100 dark:hover:bg-basalt-800",
                )}
              >
                {page}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
