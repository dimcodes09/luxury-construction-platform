import NextLink from "next/link";
import { Fragment } from "react";

/* design.md §3.0 composites — Breadcrumb.
 *
 * SRS FR-PROJ-11 / FR-JRN-06 require BreadcrumbList structured data on project
 * and article pages. The JSON-LD is emitted from the same `items` array that
 * renders the visual trail, so the two cannot disagree — a mismatch between
 * visible breadcrumbs and their markup is a common Rich Results failure.
 */

export type Crumb = { label: string; href: string };

export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 font-mono text-datum uppercase text-fg-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.href}>
              <li>
                {isLast ? (
                  <span aria-current="page" className="text-fg-secondary">
                    {item.label}
                  </span>
                ) : (
                  <NextLink
                    href={item.href}
                    className="transition-colors duration-fast hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {item.label}
                  </NextLink>
                )}
              </li>
              {!isLast ? (
                <li aria-hidden="true" className="text-brass-500">
                  /
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>

      <script
        type="application/ld+json"
        // Values come from our own CMS, not user input; JSON.stringify escapes
        // the payload and the type is fixed.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
