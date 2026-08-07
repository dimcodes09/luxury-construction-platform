import NextLink from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Display } from "@/components/foundation/typography";
import { TrustBar, type TrustCredential } from "@/components/domain/trust-bar";
import { FooterColumns, type FooterColumn } from "./footer-columns";

/* design.md §3.8 — Footer (mega). Four zones.
 *
 * ZONE 1 conversion band · ZONE 2 link matrix · ZONE 3 trust band · ZONE 4 legal
 *
 * §9.2: the link matrix is an ACCORDION below 768, 2-col to 1023, 4-col at
 * ≥1024. Implemented with native <details> so it costs no JavaScript and stays
 * crawlable — the footer is a significant internal-linking surface (§10.5:
 * "every service links to projects and journal; the materials library is a
 * hub"), and hiding those links behind hydration would waste them.
 *
 * §3.8: the Admin link in zone 4 is plain text-muted with no emphasis, and is
 * noindex/nofollow (NFR-SEO-06). It is the only entry point to the admin panel;
 * there is no public login anywhere on the site.
 */

export type { FooterColumn };

export function FooterMega({
  conversionHeadline,
  conversionActions,
  columns,
  credentials,
  localities,
  localityHref,
  contactSlot,
  legalLinks,
  brandName,
  foundedYear,
  className,
}: {
  conversionHeadline: ReactNode;
  conversionActions: ReactNode;
  /** §3.8 zone 2 — Services (9) / Company (6) / Resources (6) / Contact. */
  columns: FooterColumn[];
  credentials: TrustCredential[];
  localities?: string[];
  localityHref?: (locality: string) => string;
  /** The address / phone / hours block that closes the matrix. */
  contactSlot?: ReactNode;
  legalLinks: { label: string; href: string }[];
  brandName: string;
  foundedYear: number;
  className?: string;
}) {
  return (
    <footer
      className={cn("w-full bg-basalt-950 text-basalt-300", className)}
    >
      {/* ── ZONE 1 · Conversion band ────────────────────────────────── */}
      <div className="container-base py-section-feature">
        <Display as="h2" size="lg" className="text-basalt-050">
          {conversionHeadline}
        </Display>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {conversionActions}
        </div>
      </div>

      {/* ── ZONE 2 · Link matrix ────────────────────────────────────── */}
      <div className="container-base">
        <div className="grid grid-cols-1 gap-0 border-t border-basalt-700 md:grid-cols-2 md:gap-8 md:py-12 lg:grid-cols-4">
          <FooterColumns columns={columns} />

          {contactSlot ? (
            <div className="py-6 md:py-0">{contactSlot}</div>
          ) : null}
        </div>
      </div>

      {/* ── ZONE 3 · Trust band ─────────────────────────────────────── */}
      <div className="container-base">
        <TrustBar
          credentials={credentials}
          localities={localities}
          localityHref={localityHref}
        />
      </div>

      {/* ── ZONE 4 · Legal ──────────────────────────────────────────── */}
      <div className="container-base py-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="font-sans text-caption text-basalt-500">
            © <span className="font-mono tabular">{foundedYear}</span>–
            <span className="font-mono tabular">
              {new Date().getFullYear()}
            </span>{" "}
            {brandName}
          </p>

          {legalLinks.map((link) => (
            <NextLink
              key={link.label}
              href={link.href}
              className="underline-wipe font-sans text-caption text-basalt-500 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {link.label}
            </NextLink>
          ))}

          {/* §3.8 — plain, unemphasised, and excluded from indexing. */}
          <NextLink
            href="/admin"
            rel="nofollow"
            className="font-sans text-caption text-basalt-500 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Admin
          </NextLink>
        </div>
      </div>
    </footer>
  );
}
