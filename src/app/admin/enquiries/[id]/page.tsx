import { notFound, redirect } from "next/navigation";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";

import { getAdminContext } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { connectToDatabase } from "@/lib/db/connect";
import { Lead } from "@/lib/db/models";
import { Icon } from "@/components/foundation/icon";
import { Heading, Body, Datum, Caption } from "@/components/foundation/typography";
import { Button } from "@/components/ui/button";
import { StatusControl } from "./status-control";

/* FR-ADM-05 — the lead detail. "Shows the complete journey", so whoever picks
 * up the phone already knows what this person looked at.
 *
 * The reply actions are deliberately manual: tel:, WhatsApp and mailto: links
 * that open your own client with the context prefilled. Nothing is sent from
 * the server.
 */

export const dynamic = "force-dynamic";

type LeanLead = Record<string, unknown> & { _id: unknown };

export default async function EnquiryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");
  if (!can(context.role, "leads.view")) redirect("/admin");

  const { id } = await params;

  await connectToDatabase();
  const lead = (await Lead.findById(id).lean().catch(() => null)) as LeanLead | null;
  if (!lead) notFound();

  const str = (key: string) => (lead[key] ? String(lead[key]) : undefined);
  const phone = str("phone") ?? "";
  const digits = phone.replace(/[^\d]/g, "");
  const name = str("name") ?? "there";
  const firstName = name.split(" ")[0];

  /* The prefilled message. It states what we received so the reply reads as a
   * continuation of their brief rather than a cold response. */
  const context_ = [
    str("projectType") && formatType(str("projectType")),
    str("locality"),
    lead.area ? `${Number(lead.area).toLocaleString("en-IN")} sq ft` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const reply = `Hi ${firstName}, thanks for your enquiry about ${context_ || "your project"}. Here is the costed range and what it excludes:`;

  const facts: [string, string | undefined][] = [
    ["Project", formatType(str("projectType"))],
    ["Locality", str("locality")],
    ["City", str("city")],
    ["Built-up area", lead.area ? `${Number(lead.area).toLocaleString("en-IN")} sq ft` : undefined],
    ["Floors", lead.floors ? String(lead.floors) : undefined],
    ["Specification", str("tier")],
    ["Plot condition", str("siteCondition")],
    ["Timeline", str("timeline")],
    ["Budget", formatBudget(str("budgetBand"))],
    ["WhatsApp", lead.whatsappOptIn ? "Yes" : "No"],
    ["Came from", (lead.source as { page?: string } | undefined)?.page],
  ];

  const addons = Array.isArray(lead.addons) ? (lead.addons as string[]) : [];

  return (
    <div>
      <NextLink
        href="/admin"
        className="inline-flex items-center gap-2 font-sans text-body-sm text-fg-secondary underline-wipe focus-visible:outline-2"
      >
        <Icon icon={ArrowLeft} size={16} />
        All enquiries
      </NextLink>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading as="h1" size="lg">{name}</Heading>
          <Datum className="mt-2 block">
            {lead.createdAt
              ? new Date(lead.createdAt as Date).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </Datum>
        </div>
        <StatusControl id={String(lead._id)} current={str("status") ?? "new"} />
      </div>

      {/* Reply actions — all manual, all opening your own client. */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="primary" size="md">
          <a href={`tel:${phone}`}>Call {phone}</a>
        </Button>
        <Button asChild variant="whatsapp" size="md">
          <a
            href={`https://wa.me/${digits}?text=${encodeURIComponent(reply)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp with brief
          </a>
        </Button>
        {str("email") ? (
          <Button asChild variant="secondary" size="md">
            <a
              href={`mailto:${str("email")}?subject=${encodeURIComponent(
                "Your cost estimate — ZYVORA",
              )}&body=${encodeURIComponent(reply)}`}
            >
              Email {str("email")}
            </a>
          </Button>
        ) : null}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Datum className="block">The brief</Datum>
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {facts
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2"
                >
                  <dt className="font-sans text-label uppercase text-fg-muted">
                    {label}
                  </dt>
                  <dd className="text-right font-sans text-body-sm text-fg">
                    {value}
                  </dd>
                </div>
              ))}
          </dl>

          {addons.length > 0 ? (
            <div className="mt-8">
              <Datum className="block">Add-ons requested</Datum>
              <div className="mt-3 flex flex-wrap gap-2">
                {addons.map((addon) => (
                  <span
                    key={addon}
                    className="inline-flex rounded-sm bg-basalt-100 px-3 py-1 font-sans text-body-sm text-ink-700"
                  >
                    {addon}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {str("message") ? (
            <div className="mt-8">
              <Datum className="block">In their words</Datum>
              <Body size="md" className="mt-3 whitespace-pre-line">
                {str("message")}
              </Body>
            </div>
          ) : null}
        </div>

        <aside className="hairline rounded-md bg-surface p-6">
          <Datum className="block">Contact</Datum>
          <dl className="mt-4 flex flex-col gap-3">
            <div>
              <dt className="font-sans text-label uppercase text-fg-muted">Phone</dt>
              <dd className="mt-1 font-mono tabular text-body-md text-fg">{phone}</dd>
            </div>
            {str("email") ? (
              <div>
                <dt className="font-sans text-label uppercase text-fg-muted">Email</dt>
                <dd className="mt-1 break-all font-sans text-body-sm text-fg">
                  {str("email")}
                </dd>
              </div>
            ) : null}
          </dl>

          <Caption className="mt-6">
            Personal data. Do not forward outside the business (NFR-PRIV-07).
          </Caption>
        </aside>
      </div>
    </div>
  );
}

function formatType(value?: string): string | undefined {
  if (!value) return undefined;
  const labels: Record<string, string> = {
    "new-construction": "New construction",
    renovation: "Renovation",
    interiors: "Interiors",
    commercial: "Commercial",
    "single-service": "Single service",
  };
  return labels[value] ?? value;
}

function formatBudget(value?: string): string | undefined {
  if (!value) return undefined;
  const labels: Record<string, string> = {
    "under-25L": "Under ₹25L",
    "25-50L": "₹25–50L",
    "50L-1Cr": "₹50L–1Cr",
    "1Cr+": "₹1Cr+",
    "not-sure": "Not sure yet",
  };
  return labels[value] ?? value;
}
