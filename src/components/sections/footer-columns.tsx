"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Datum } from "@/components/foundation/typography";

/* design.md §9.2 — the footer link matrix is an ACCORDION below 768, 2-col to
 * 1023, and 4-col at ≥1024.
 *
 * This is the one client component in the footer, and the reason is specific:
 * <details> open/closed is an ATTRIBUTE, not a style, so there is no CSS way to
 * have it collapsed on mobile and expanded on desktop. The alternatives were
 * both worse — always-open gives mobile a 60-link wall, always-closed hides the
 * internal-linking surface (§10.5) on desktop where there is room for it.
 *
 * SEO is unaffected either way: <details> content is in the DOM whether open or
 * closed, so crawlers see every link regardless of state.
 */

export type FooterColumn = {
  title: string;
  links: { label: string; href: string; description?: string }[];
};

export function FooterColumns({ columns }: { columns: FooterColumn[] }) {
  // Starts false so server and first client render agree — flipping this in an
  // effect avoids a hydration mismatch on the attribute.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 48rem)");
    const sync = () => setExpanded(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <>
      {columns.map((column) => (
        <details
          key={column.title}
          open={expanded || undefined}
          className="group border-b border-basalt-700 md:border-b-0"
        >
          <summary
            className={cn(
              "no-marker flex min-h-16 cursor-pointer items-center justify-between py-5",
              // On desktop the row is decorative — the panel is already open,
              // so the summary must not be a focus stop or a click target.
              "md:pointer-events-none md:min-h-0 md:py-0",
            )}
            // Keyboard users on desktop would otherwise tab through four
            // no-op disclosure controls.
            tabIndex={expanded ? -1 : 0}
          >
            <Datum className="text-basalt-400">{column.title}</Datum>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="size-5 text-basalt-400 transition-transform duration-base ease-standard group-open:rotate-45 md:hidden"
            >
              <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="butt"
              />
            </svg>
          </summary>

          <ul className="flex flex-col gap-3 pb-6 md:pb-0 md:pt-4">
            {/* Keyed on label, not href: several links can legitimately share
             * a destination (a service and its hub, a phone and its WhatsApp
             * deep link), and href collisions silently drop rows. */}
            {column.links.map((link) => (
              <li key={link.label}>
                <NextLink
                  href={link.href}
                  className="underline-wipe font-sans text-body-sm text-basalt-300 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {link.label}
                </NextLink>
                {/* §3.8 — each service link carries a one-line descriptor. */}
                {link.description ? (
                  <p className="mt-0.5 font-sans text-caption text-basalt-500">
                    {link.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </>
  );
}
