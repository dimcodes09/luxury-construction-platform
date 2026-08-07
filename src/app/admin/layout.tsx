import type { Metadata } from "next";
import NextLink from "next/link";

import { getAdminContext } from "@/lib/auth/guard";
import { Datum } from "@/components/foundation/typography";
import { SignOutButton } from "./sign-out-button";

/* SRS §6 / NFR-SEO-11 — /admin/* is noindex, nofollow.
 *
 * The shell renders whether or not there is a session: the login page lives
 * inside this layout, and every protected page runs its own requireCapability()
 * check. NFR-SEC-11: "EVERY SERVER ACTION INDEPENDENTLY RE-CHECKS ROLE — never
 * trust the client." A layout is not a security boundary and is not used as one.
 */

export const metadata: Metadata = {
  title: "Admin — ZYVORA",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getAdminContext();

  return (
    <div className="min-h-svh bg-canvas">
      <header className="border-b border-hairline bg-surface">
        <div className="container-base flex h-header items-center justify-between gap-6">
          <NextLink
            href="/admin"
            className="focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <span className="block font-display text-heading-sm uppercase tracking-widest text-fg">
              ZYVORA
            </span>
            <Datum className="block">Admin</Datum>
          </NextLink>

          {context ? (
            <div className="flex items-center gap-6">
              <nav aria-label="Admin">
                <ul className="flex items-center gap-6">
                  <li>
                    <NextLink
                      href="/admin"
                      className="font-sans text-body-sm text-fg-secondary underline-wipe focus-visible:outline-2"
                    >
                      Enquiries
                    </NextLink>
                  </li>
                  <li>
                    <NextLink
                      href="/"
                      className="font-sans text-body-sm text-fg-secondary underline-wipe focus-visible:outline-2"
                    >
                      View site
                    </NextLink>
                  </li>
                </ul>
              </nav>

              <div className="flex items-center gap-3">
                <Datum className="hidden sm:block">
                  {context.email} · {context.role}
                </Datum>
                <SignOutButton />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className="container-base py-12">{children}</main>
    </div>
  );
}
