import { redirect } from "next/navigation";
import NextLink from "next/link";

import { getAdminContext } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { connectToDatabase } from "@/lib/db/connect";
import { Lead } from "@/lib/db/models";
import { Heading, Body, Datum, Caption } from "@/components/foundation/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableWrapper,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";

/* /admin — the enquiries list.
 *
 * FR-ADM-03: leads as a table with filters and saved views. This is the reduced
 * version the owner actually needs today: every enquiry from /estimate and
 * /contact, newest first, with the fields you decide from at a glance.
 *
 * NFR-SEC-11 — the role is re-checked HERE, not inherited from the layout.
 * §3 gives Editor no lead access at all, because leads carry personal data
 * (NFR-PRIV-07) and content work never needs it.
 */

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  new: "bg-brass-100 text-brass-700",
  contacted: "bg-info-100 text-info-600",
  "visit-booked": "bg-info-100 text-info-600",
  "visit-done": "bg-info-100 text-info-600",
  quoted: "bg-warning-100 text-warning-600",
  won: "bg-success-100 text-success-600",
  lost: "bg-danger-100 text-danger-600",
};

type LeanLead = {
  _id: unknown;
  name?: string;
  phone?: string;
  email?: string;
  projectType?: string;
  locality?: string;
  area?: number;
  tier?: string;
  budgetBand?: string;
  timeline?: string;
  status?: string;
  createdAt?: Date;
  source?: { page?: string };
};

export default async function AdminHome() {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");

  // §3 permission matrix — Editor cannot see leads.
  if (!can(context.role, "leads.view")) {
    return (
      <EmptyState
        title="No access to enquiries"
        body={`Your role (${context.role}) covers content, not leads. Ask the owner if you need this.`}
        action={
          <Button asChild variant="secondary" size="lg">
            <NextLink href="/">View site</NextLink>
          </Button>
        }
      />
    );
  }

  await connectToDatabase();
  const leads = (await Lead.find({ deletedAt: null })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()) as unknown as LeanLead[];

  const newCount = leads.filter((lead) => lead.status === "new").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading as="h1" size="lg">
            Enquiries
          </Heading>
          <Body size="md" className="mt-2">
            Every brief from the cost-estimate form and the contact page. You
            reply by email or WhatsApp yourself — nothing is sent automatically.
          </Body>
        </div>
        <Datum className="tabular">
          {leads.length} total · {newCount} new
        </Datum>
      </div>

      <div className="mt-10">
        {leads.length === 0 ? (
          <EmptyState
            title="No enquiries yet."
            body="Briefs from the cost-estimate form land here the moment someone submits one."
            action={
              <Button asChild variant="secondary" size="lg">
                <NextLink href="/estimate">Open the form</NextLink>
              </Button>
            }
          />
        ) : (
          <TableWrapper className="hairline rounded-md bg-surface">
            <Table>
              <THead>
                <TR>
                  <TH>Received</TH>
                  <TH>Name</TH>
                  <TH>Phone</TH>
                  <TH>Project</TH>
                  <TH>Locality</TH>
                  <TH>Area</TH>
                  <TH>Budget</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {leads.map((lead) => {
                  const id = String(lead._id);
                  return (
                    <TR key={id}>
                      <TD>
                        <NextLink
                          href={`/admin/enquiries/${id}`}
                          className="underline-wipe text-fg focus-visible:outline-2"
                        >
                          {lead.createdAt
                            ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "—"}
                        </NextLink>
                      </TD>
                      <TD className="text-fg">{lead.name ?? "—"}</TD>
                      <TD>
                        <a
                          href={`tel:${lead.phone}`}
                          className="font-mono tabular text-fg-secondary underline-wipe"
                        >
                          {lead.phone ?? "—"}
                        </a>
                      </TD>
                      <TD>{formatType(lead.projectType)}</TD>
                      <TD>{lead.locality ?? "—"}</TD>
                      <TD numeric>
                        {lead.area ? lead.area.toLocaleString("en-IN") : "—"}
                      </TD>
                      <TD>{formatBudget(lead.budgetBand)}</TD>
                      <TD>
                        <span
                          className={`inline-flex rounded-sm px-2 py-1 font-sans text-label uppercase ${
                            STATUS_TONE[lead.status ?? "new"] ??
                            "bg-basalt-100 text-ink-700"
                          }`}
                        >
                          {lead.status ?? "new"}
                        </span>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableWrapper>
        )}
      </div>

      <Caption className="mt-6">
        Showing the 100 most recent. Personal data — do not export or forward
        outside the business (NFR-PRIV-07).
      </Caption>
    </div>
  );
}

export function formatType(value?: string): string {
  const labels: Record<string, string> = {
    "new-construction": "New construction",
    renovation: "Renovation",
    interiors: "Interiors",
    commercial: "Commercial",
    "single-service": "Single service",
  };
  return value ? (labels[value] ?? value) : "—";
}

export function formatBudget(value?: string): string {
  const labels: Record<string, string> = {
    "under-25L": "Under ₹25L",
    "25-50L": "₹25–50L",
    "50L-1Cr": "₹50L–1Cr",
    "1Cr+": "₹1Cr+",
    "not-sure": "Not sure yet",
  };
  return value ? (labels[value] ?? value) : "—";
}
