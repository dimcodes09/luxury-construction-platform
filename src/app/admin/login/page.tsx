import { redirect } from "next/navigation";

import { getAdminContext } from "@/lib/auth/guard";
import { Heading, Body, Caption } from "@/components/foundation/typography";
import { LoginForm } from "./login-form";

/* SRS §3 — the ONLY login surface on the site, and it is back-office only.
 * Visitors are always anonymous: the shortlist is localStorage (FR-GBL-07) and
 * the enquiry form asks for no account. */

export default async function AdminLoginPage() {
  const context = await getAdminContext();
  if (context) redirect("/admin");

  return (
    <div className="mx-auto max-w-prose">
      <Heading as="h1" size="lg">
        Sign in
      </Heading>
      <Body size="md" className="mt-3">
        Back office only. Accounts are created with{" "}
        <code className="font-mono text-body-sm">npm run admin:create</code>.
      </Body>

      <div className="mt-10">
        <LoginForm />
      </div>

      <Caption className="mt-8">
        Five attempts every fifteen minutes, then this locks (NFR-SEC-05).
      </Caption>
    </div>
  );
}
