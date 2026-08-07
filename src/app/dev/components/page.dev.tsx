import type { Metadata } from "next";
import { Hammer, PaintRoller, Ruler } from "lucide-react";

import { GalleryShell } from "./gallery-shell";
import {
  ButtonStates,
  ChipSpecimen,
  DisclosureSpecimen,
  FormSpecimen,
  LoadMoreSpecimen,
  OverlaySpecimen,
  ShortlistSpecimen,
  ToastSpecimen,
} from "./specimen";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Badge } from "@/components/ui/chip";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Divider } from "@/components/ui/divider";
import { Card, CardBody, CardMedia } from "@/components/ui/card";
import {
  Skeleton,
  ProjectCardSkeleton,
  TableRowsSkeleton,
} from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { EmptyState, MonogramPlate } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableWrapper,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";

import { DatumLine } from "@/components/foundation/datum-line";
import {
  Body,
  Caption,
  Datum,
  Display,
  Heading,
  Label,
  Numeral,
} from "@/components/foundation/typography";

import { ProjectCard } from "@/components/domain/project-card";
import {
  ServiceCardDeep,
  ServiceCardOverview,
} from "@/components/domain/service-card";
import { TestimonialCard } from "@/components/domain/testimonial-card";
import { MaterialSwatch } from "@/components/domain/material-swatch";
import { StatBand } from "@/components/domain/stat-band";
import { BeforeAfter } from "@/components/domain/before-after";
import { ProcessTimeline } from "@/components/domain/process-step";
import { CostRangeBar } from "@/components/domain/cost-range-bar";
import { BehindTheWall } from "@/components/domain/behind-the-wall";
import { TeamCard } from "@/components/domain/team-card";
import { ArticleCard } from "@/components/domain/article-card";
import { FAQList } from "@/components/domain/faq-item";
import { TrustBar } from "@/components/domain/trust-bar";
import { GalleryMasonry } from "@/components/domain/gallery-masonry";

import { Hero } from "@/components/sections/hero";
import { Section, SectionHeader } from "@/components/sections/section-header";
import { SplitFeature } from "@/components/sections/split-feature";
import { MarqueeStrip } from "@/components/sections/marquee-strip";
import { CTABand } from "@/components/sections/cta-band";
import { FooterMega } from "@/components/sections/footer-mega";

/* design-process.md Step 6 — the component gallery.
 *
 * "Every variant, every state, side by side. This is your design review surface
 * and your regression check."
 *
 * All copy here is written to the §1.4 voice rules and passes the §10.1 banned
 * word list, because placeholder lorem in a gallery trains the eye wrong — you
 * end up designing for text that will never exist.
 */

export const metadata: Metadata = {
  title: "Component gallery — ZYVORA",
  // Dev surface: never indexed (NFR-SEO-06 applies the same logic to /admin).
  robots: { index: false, follow: false },
};

const rupees = (value: number) => `₹${(value / 100000).toFixed(1)} L`;

function Bench({
  id,
  section,
  title,
  note,
  children,
}: {
  id: string;
  /** The design.md section this implements, e.g. "§3.1". */
  section: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-12">
      <DatumLine index={section} label={title} />
      {note ? (
        <Caption className="mt-3 measure-body">{note}</Caption>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function ComponentGalleryPage() {
  return (
    <GalleryShell>
      <div className="container-base pb-24">
        {/* ── FOUNDATION ─────────────────────────────────────────────── */}
        <Bench
          id="type"
          section="§2.2"
          title="Type scale"
          note="Fluid via clamp() — drag the window and every size interpolates. Only type and space are fluid; layout snaps at breakpoints."
        >
          <div className="flex flex-col gap-6">
            <Display size="xxl" optical>
              We show you what&rsquo;s behind the wall.
            </Display>
            <Display size="xl">Display XL</Display>
            <Display size="lg">Display LG</Display>
            <Heading size="xl">Heading XL — Fraunces 400</Heading>
            <Heading size="lg">Heading LG — Fraunces 400</Heading>
            <Heading size="md">Heading MD — Inter 600</Heading>
            <Heading size="sm">Heading SM — Inter 600</Heading>
            <Body size="lg">
              Body LG at 68ch. Handover in 11 months. That&rsquo;s one monsoon,
              not three. Every claim on this site carries a number or a link to
              proof.
            </Body>
            <Body size="md">
              Body MD. Sentences stay under 20 words. Indian-English throughout:
              lakh, crore, sq ft, carpet area.
            </Body>
            <Body size="sm">Body SM for dense supporting copy.</Body>
            <Caption>Caption — 13px, used for metadata and captions.</Caption>
            <Label>Label — 12px, uppercase, +0.08em</Label>
            <Datum>Datum — JetBrains Mono, the engineering signal</Datum>
            <div className="flex flex-wrap items-baseline gap-8">
              <Numeral size="xl">₹50.5 L — ₹62.2 L</Numeral>
              <Numeral size="md">2,400 sq ft</Numeral>
            </div>
          </div>
        </Bench>

        <Bench
          id="colour"
          section="§2.1"
          title="Colour ramps"
          note="Brass may occupy no more than 5% of any viewport. Blueprint is reserved for the technical layer — estimator, specs, drawings."
        >
          <div className="flex flex-col gap-6">
            {[
              {
                name: "Basalt (warm neutral)",
                swatches: [
                  "bg-basalt-950",
                  "bg-basalt-900",
                  "bg-basalt-800",
                  "bg-basalt-700",
                  "bg-basalt-600",
                  "bg-basalt-500",
                  "bg-basalt-400",
                  "bg-basalt-300",
                  "bg-basalt-200",
                  "bg-basalt-100",
                  "bg-basalt-050",
                  "bg-basalt-000",
                ],
              },
              {
                name: "Brass (accent, ≤5%)",
                swatches: [
                  "bg-brass-700",
                  "bg-brass-600",
                  "bg-brass-500",
                  "bg-brass-400",
                  "bg-brass-300",
                  "bg-brass-100",
                ],
              },
              {
                name: "Blueprint (technical only)",
                swatches: [
                  "bg-blueprint-700",
                  "bg-blueprint-500",
                  "bg-blueprint-300",
                  "bg-blueprint-100",
                ],
              },
              {
                name: "Kota (secondary surface)",
                swatches: [
                  "bg-kota-800",
                  "bg-kota-600",
                  "bg-kota-400",
                  "bg-kota-200",
                ],
              },
              {
                name: "Semantic",
                swatches: [
                  "bg-success-600",
                  "bg-warning-600",
                  "bg-danger-600",
                  "bg-info-600",
                ],
              },
            ].map((ramp) => (
              <div key={ramp.name}>
                <Datum className="block">{ramp.name}</Datum>
                <div className="mt-2 flex flex-wrap gap-1">
                  {ramp.swatches.map((swatch) => (
                    <div
                      key={swatch}
                      className={`size-12 rounded-sm hairline ${swatch}`}
                      title={swatch}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Bench>

        <Bench
          id="datum"
          section="§1.5"
          title="Datum line"
          note="The signature graphic device — a 1px rule, a tick, and a monospace label, borrowed from architectural drawings. Appears on every page."
        >
          <div className="flex flex-col gap-8">
            <DatumLine index="01" label="Selected work" />
            <DatumLine label="No index" />
            <DatumLine index="03" label="Right aligned" align="right" />
          </div>
        </Bench>

        {/* ── PRIMITIVES ─────────────────────────────────────────────── */}
        <Bench
          id="button"
          section="§3.1"
          title="Button — variants"
          note="A primary and an accent button never appear in the same viewport: it creates a two-headed CTA and measurably reduces clicks on both."
        >
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Book a site visit</Button>
            <Button variant="secondary">See our work</Button>
            <Button variant="accent">Get a cost estimate</Button>
            <Button variant="ghost">Read the process</Button>
            <Button variant="link">Inline action</Button>
            <Button variant="whatsapp">WhatsApp it to me</Button>
            <Button variant="danger">Delete</Button>
          </div>
        </Bench>

        <Bench id="button-sizes" section="§3.1" title="Button — sizes">
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small (36px)</Button>
            <Button size="md">Medium (44px)</Button>
            <Button size="lg">Large (54px)</Button>
            <Button size="xl">Extra large (64px)</Button>
          </div>
        </Bench>

        <Bench
          id="button-states"
          section="§3.1"
          title="Button — all seven states"
          note="Hover, focus and active are force-applied here so they can be reviewed side by side. Disabled uses opacity, never pointer-events:none, so its tooltip stays reachable."
        >
          <ButtonStates />
        </Bench>

        <Bench
          id="link"
          section="§3.2"
          title="Link"
          note="Animated underline wiping in from the left at 88% of the line box."
        >
          <Body size="md">
            The estimator publishes{" "}
            <Link href="/dev/components">its rate assumptions</Link> and every
            exclusion, because{" "}
            <Link href="/dev/components">concealing the range</Link> signals
            something to hide.
          </Body>
        </Bench>

        <Bench
          id="form"
          section="§3.3"
          title="Inputs, fields and controls"
          note="Labels are always visible and above the field. Floating labels are banned — they fail for autofill, screen readers, and this audience skews 30–60. Sliders always carry a paired numeric input."
        >
          <FormSpecimen />
        </Bench>

        <Bench id="chip" section="§3.0" title="Chip and Badge">
          <div className="flex flex-col gap-6">
            <ChipSpecimen />
            <div className="flex flex-wrap gap-3">
              <Badge tone="neutral">Draft</Badge>
              <Badge tone="technical">Rate card v4</Badge>
              <Badge tone="accent">Signature</Badge>
              <Badge tone="success">Published</Badge>
              <Badge tone="warning">Needs response</Badge>
              <Badge tone="danger">Lost</Badge>
            </div>
          </div>
        </Bench>

        <Bench id="misc-primitives" section="§3.0" title="Avatar, Spinner, Divider">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <Avatar name="Priya Kulkarni" size="sm" />
              <Avatar name="Anjali Deshpande" size="md" />
              <Avatar name="Rohit Deshpande" size="lg" />
            </div>
            <div className="flex items-center gap-4 text-fg-muted">
              <Spinner size={16} />
              <Spinner size={20} />
              <Spinner size={24} />
            </div>
            <div className="flex h-12 items-center gap-4">
              <Divider orientation="vertical" />
              <Datum>vertical</Datum>
            </div>
          </div>
          <Divider className="mt-6" />
        </Bench>

        <Bench id="shortlist" section="§0.5" title="ShortlistButton (rung 2)">
          <ShortlistSpecimen />
        </Bench>

        {/* ── COMPOSITES ─────────────────────────────────────────────── */}
        <Bench
          id="card"
          section="§3.4"
          title="Card — variants"
          note="No shadow at rest. On hover the media scales 1.03 and the content never moves."
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(["default", "bordered", "elevated"] as const).map((variant) => (
              <Card key={variant} variant={variant} interactive>
                <CardMedia ratio="16/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/photos/project-1.jpg"
                    alt=""
                    className="size-full object-cover transition-transform duration-base ease-standard group-hover:scale-103"
                  />
                </CardMedia>
                <CardBody>
                  <Heading size="sm">Card / {variant}</Heading>
                  <Body size="sm" className="mt-2" measure={false}>
                    Separation comes from a hairline and a background step, not
                    a drop shadow.
                  </Body>
                </CardBody>
              </Card>
            ))}
          </div>
        </Bench>

        <Bench id="overlays" section="§3.0" title="Tooltip, Modal, Sheet, Dropdown, Popover">
          <OverlaySpecimen />
        </Bench>

        <Bench id="disclosure" section="§3.19" title="Accordion and Tabs">
          <DisclosureSpecimen />
        </Bench>

        <Bench id="stepper" section="§3.3" title="Stepper">
          <Stepper
            current={2}
            steps={[
              { label: "Project" },
              { label: "Area" },
              { label: "Tier" },
              { label: "Locality" },
              { label: "Result" },
            ]}
          />
        </Bench>

        <Bench id="toast" section="§3.21" title="Toast">
          <ToastSpecimen />
        </Bench>

        <Bench id="table" section="§3.0" title="Table">
          <TableWrapper>
            <Table>
              <THead>
                <TR>
                  <TH>Milestone</TH>
                  <TH>Release condition</TH>
                  <TH>Share</TH>
                </TR>
              </THead>
              <TBody>
                {[
                  ["Booking", "Signed agreement", "10%"],
                  ["Foundation", "Plinth beam cast and cured", "15%"],
                  ["Superstructure", "Slab poured, verified on site", "25%"],
                  ["Finishing", "Plaster and waterproofing signed off", "30%"],
                ].map(([milestone, condition, share]) => (
                  <TR key={milestone}>
                    <TD>{milestone}</TD>
                    <TD>{condition}</TD>
                    <TD numeric>{share}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrapper>
        </Bench>

        <Bench id="nav-composites" section="§3.0" title="Breadcrumb and Pagination">
          <div className="flex flex-col gap-8">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Work", href: "/work" },
                { label: "Ridgeline House", href: "/work/ridgeline-house" },
              ]}
            />
            <Pagination
              currentPage={2}
              totalPages={5}
              hrefForPage={(page) => `/dev/components?page=${page}`}
            />
            <LoadMoreSpecimen />
          </div>
        </Bench>

        <Bench
          id="skeleton"
          section="§3.20"
          title="Skeletons"
          note="Skeletons match final layout exactly, so nothing shifts. A skeleton whose dimensions differ from its content guarantees the CLS it was meant to prevent."
        >
          <div className="grid gap-8 lg:grid-cols-3">
            <ProjectCardSkeleton />
            <div className="lg:col-span-2">
              <TableRowsSkeleton rows={4} />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="size-12 rounded-full" />
          </div>
        </Bench>

        <Bench
          id="empty"
          section="§3.20"
          title="Empty state"
          note="Three parts, always: a technical line drawing, a plain sentence explaining why it is empty, and exactly one action."
        >
          <Card variant="bordered">
            <EmptyState
              title="No projects match those filters yet"
              body="We've built 61 homes — try widening the area range."
              action={<Button variant="secondary">Clear filters</Button>}
            />
          </Card>
          <div className="mt-8 flex items-center gap-6 text-brass-700">
            <MonogramPlate />
            <Caption>
              §1.1.3 — the Z drawn as a braced frame: chord, brace, chord, with
              node dots at the joints.
            </Caption>
          </div>
        </Bench>

        {/* ── DOMAIN ─────────────────────────────────────────────────── */}
        <Bench
          id="project-card"
          section="§3.10"
          title="ProjectCard"
          note="Metadata is the point. Locality, area, year and scope answer 'is this like my project?' — the only question a portfolio visitor is actually asking."
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                index: "04",
                title: "Ridgeline House",
                locality: "Arera Colony",
                areaSqft: 3850,
                year: 2025,
                image: "/photos/project-1.jpg",
              },
              {
                index: "05",
                title: "Shahpura Terrace Flat",
                locality: "Shahpura",
                areaSqft: 1240,
                year: 2024,
                image: "/photos/project-2.jpg",
              },
              {
                index: "06",
                title: "Kolar Row House",
                locality: "Kolar Road",
                areaSqft: 2410,
                year: 2024,
                image: "/photos/project-3.jpg",
              },
            ].map((project) => (
              <ProjectCard
                key={project.index}
                href="/dev/components"
                index={project.index}
                category="Residential"
                title={project.title}
                locality={project.locality}
                areaSqft={project.areaSqft}
                year={project.year}
                scope="Construction + Interiors"
                image={{ src: project.image, alt: "" }}
              />
            ))}
          </div>
        </Bench>

        <Bench
          id="before-after"
          section="§3.14"
          title="BeforeAfter — the signature component"
          note="Drag it, or focus the handle and use ← → (2%), Shift+← → (10%), Home/End. The idle hint fires once on first viewport entry. With JS disabled the two images stack with captions."
        >
          <div className="max-w-wide">
            <BeforeAfter
              before={{ src: "/photos/before.jpg", alt: "Kitchen before work" }}
              after={{ src: "/photos/after.jpg", alt: "Kitchen after work" }}
              caption="Kitchen re-planned, 128 sq ft · ₹4.6 L · 5 weeks"
            />
          </div>
        </Bench>

        <Bench
          id="stat-band"
          section="§3.12"
          title="StatBand — M4 Counter"
          note="Counts once on first view, never repeats, and shows final values immediately under prefers-reduced-motion. Every stat must be true and specific."
        >
          <div className="-mx-gutter">
            <StatBand
              stats={[
                { value: 61, label: "homes", sublabel: "delivered" },
                {
                  value: 11.4,
                  precision: 1,
                  suffix: "mo",
                  label: "median",
                  sublabel: "handover",
                },
                {
                  value: 4.9,
                  precision: 1,
                  suffix: "/ 5",
                  label: "Google",
                  sublabel: "61 reviews",
                },
                { value: 0, label: "disputes", sublabel: "in 8 years" },
              ]}
            />
          </div>
        </Bench>

        <Bench
          id="cost-range"
          section="§3.16"
          title="CostRangeBar"
          note="A range with a confidence band, never a point value. Rendered in Blueprint because this is engineering output, not marketing."
        >
          <div className="max-w-narrow rounded-md bg-technical p-6 md:p-10">
            <CostRangeBar
              min={3840000}
              max={4720000}
              mostLikely={4280000}
              confidenceMin={4050000}
              confidenceMax={4500000}
              formatValue={rupees}
              breakdown={[
                { label: "Structure", share: 0.37 },
                { label: "Finishes", share: 0.33 },
                { label: "MEP", share: 0.15 },
                { label: "Design & PM", share: 0.08 },
                { label: "Contingency", share: 0.07 },
              ]}
            />
          </div>
        </Bench>

        <Bench
          id="service-card"
          section="§3.11"
          title="ServiceCard — overview and deep"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <ServiceCardOverview
              href="/dev/components"
              icon={Hammer}
              title="House Construction"
              description="Plot to handover, with one accountable party for structure, finishing and MEP."
              priceFrom="₹1,850"
            />
            <ServiceCardOverview
              href="/dev/components"
              icon={PaintRoller}
              title="Home Renovation"
              description="Phased so you can keep living in the house, with a written occupancy timeline."
              priceFrom="₹1,200"
            />
            <ServiceCardOverview
              href="/dev/components"
              icon={Ruler}
              title="Interior Design"
              description="Drawings, materials and joinery detailed before a single sheet is cut."
              priceFrom="₹1,400"
            />
          </div>

          <ServiceCardDeep
            className="mt-8"
            href="/dev/components"
            title="Waterproofing"
            body="The work that decides whether your ceiling stains in year three. We photograph every membrane before it is tiled over."
            outcomes={[
              "Two-coat polyurethane on all wet areas",
              "24-hour pressure test, documented and dated",
              "10-year written warranty on the membrane",
            ]}
            media={{ src: "/photos/service-1.jpg", alt: "" }}
          />
        </Bench>

        <Bench
          id="behind-the-wall"
          section="§3.15"
          title="BehindTheWall — the differentiator"
          note="Concealed-works photography with real specifications, dated and geotagged. No competitor publishes this. It converts the industry's biggest fear into proof."
        >
          <div className="-mx-gutter">
            <BehindTheWall
              items={[
                {
                  image: { src: "/photos/btw-1.jpg", alt: "" },
                  title: "Bathroom membrane",
                  specification: "2-coat polyurethane",
                  capturedAt: "2025-03-14",
                  geo: "Arera Colony",
                },
                {
                  image: { src: "/photos/btw-2.jpg", alt: "" },
                  title: "Conduit routing",
                  specification: "25mm FR PVC concealed",
                  capturedAt: "2025-03-02",
                  geo: "Arera Colony",
                },
                {
                  image: { src: "/photos/btw-3.jpg", alt: "" },
                  title: "Slab reinforcement",
                  specification: "Fe550 8mm @150 c/c",
                  capturedAt: "2025-01-28",
                },
                {
                  image: { src: "/photos/btw-4.jpg", alt: "" },
                  title: "Plumbing pressure test",
                  specification: "3 bar / 24 hr",
                  capturedAt: "2025-02-19",
                },
                {
                  image: { src: "/photos/btw-5.jpg", alt: "" },
                  title: "Chajja waterproofing",
                  specification: "APP membrane 4mm",
                  capturedAt: "2025-04-08",
                },
              ]}
            />
          </div>
        </Bench>

        <Bench
          id="testimonial"
          section="§3.13"
          title="TestimonialCard — verified and demoted"
          note="A testimonial without a linked project or verifiable source renders demoted: no photo, dashed border. That creates internal pressure to only collect verifiable ones."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <TestimonialCard
              testimonial={{
                quote:
                  "They sent photos of the waterproofing before they tiled over it. Nobody does that.",
                clientName: "Anjali & Rohit Deshpande",
                projectLabel: "Ridgeline House, Arera Colony",
                projectHref: "/dev/components",
                date: "Mar 2025",
                rating: 5,
                verified: true,
                sourceUrl: "https://example.com",
              }}
            />
            <TestimonialCard
              testimonial={{
                quote:
                  "Good work, finished close to the date they gave us at the start.",
                clientName: "A. Sharma",
                date: "Jan 2025",
                rating: 4,
                verified: false,
              }}
            />
          </div>
        </Bench>

        <Bench id="process" section="§3.18" title="ProcessStep">
          <div className="max-w-narrow">
            <ProcessTimeline
              steps={[
                {
                  number: "01",
                  title: "Site visit and measurement",
                  body: "We walk the plot, check soil and access, and photograph everything.",
                  durationDays: 3,
                  deliverables: ["Measured site plan", "Access and soil notes"],
                },
                {
                  number: "02",
                  title: "Drawings and BOQ",
                  body: "Plans, elevations and a line-by-line bill of quantities you keep.",
                  durationDays: 21,
                  paymentPoint: true,
                  paymentNote: "10% on signed agreement",
                  deliverables: ["Floor plans", "Sample BOQ", "Material schedule"],
                },
                {
                  number: "03",
                  title: "Foundation",
                  body: "Excavation, footings and plinth beam, cast and cured.",
                  durationDays: 35,
                  paymentPoint: true,
                  paymentNote: "15% on plinth completion",
                },
              ]}
            />
          </div>
        </Bench>

        <Bench id="material" section="§3.17" title="MaterialSwatch">
          <div className="flex flex-wrap gap-6">
            {[
              { name: "Teak", brand: "Burma", grade: "First quality" },
              { name: "Terrazzo", brand: "Bharat", grade: "16mm" },
              { name: "Brushed brass", brand: "Jaquar", grade: "PVD" },
              { name: "Lime plaster", brand: "Local", grade: "3-coat" },
            ].map((material, index) => (
              <MaterialSwatch
                key={material.name}
                material={{
                  name: material.name,
                  brand: material.brand,
                  grade: material.grade,
                  image: { src: `/dev/material-${index + 1}.png`, alt: "" },
                }}
              />
            ))}
          </div>
        </Bench>

        <Bench id="team-article" section="§3.0" title="TeamCard and ArticleCard">
          <div className="grid gap-8 lg:grid-cols-3">
            <TeamCard
              member={{
                name: "Priya Kulkarni",
                role: "Client Relations",
                photo: { src: "/photos/team-1.jpg", alt: "" },
                tenureFrom: 2019,
                bio: "Answers the WhatsApp dock, usually within 20 minutes.",
              }}
            />
            <div className="lg:col-span-2">
              <ArticleCard
                article={{
                  href: "/dev/components",
                  title: "House construction cost per sq ft in Bhopal, 2026",
                  excerpt:
                    "What the per-sq-ft number covers, what it never covers, and the four things that move it most.",
                  category: "Cost guide",
                  publishedAt: "2026-02-11",
                  readTimeMinutes: 9,
                  image: { src: "/photos/article-1.jpg", alt: "" },
                }}
              />
            </div>
          </div>
        </Bench>

        <Bench id="faq" section="§3.19" title="FAQItem — native details/summary">
          <div className="max-w-narrow">
            <FAQList
              openFirst
              emitStructuredData={false}
              faqs={[
                {
                  question: "Do you publish your rates?",
                  answer:
                    "Yes. Every tier carries a per-sq-ft range and a worked example, and the estimator shows the assumptions behind it.",
                },
                {
                  question: "What is not included in the per-sq-ft rate?",
                  answer:
                    "Interiors, furnishing, landscaping and statutory deposits. The exclusions list is published alongside every estimate.",
                },
                {
                  question: "Can I live in the house during a renovation?",
                  answer:
                    "Usually yes, in phases. The renovation page carries an occupancy timeline showing which rooms are unusable and when.",
                },
              ]}
            />
          </div>
        </Bench>

        <Bench id="gallery-masonry" section="§3.0" title="GalleryMasonry">
          <GalleryMasonry
            images={Array.from({ length: 6 }, (_, index) => ({
              src: `/dev/gallery-${index + 1}.png`,
              alt: "",
              roomType: index % 2 ? "kitchen" : "living",
            }))}
          />
        </Bench>

        {/* ── SECTIONS ───────────────────────────────────────────────── */}
        <Bench id="section-header" section="§1.5" title="SectionHeader">
          <SectionHeader
            index="02"
            label="Selected work"
            title="Sixty-one homes, and the four we'd do differently."
            body="Every project below carries its planned and actual duration, side by side."
            action={<Button variant="secondary">See our work</Button>}
          />
        </Bench>

        <Bench
          id="split"
          section="§2.4.3"
          title="SplitFeature — asymmetric editorial grid"
          note="A 7/5 split with a 1-column bleed, echoing plan drawings. Any page using this must return to symmetry for its conversion section."
        >
          <SplitFeature
            eyebrow={<DatumLine index="03" label="Materials" />}
            media={{ src: "/photos/service-1.jpg", alt: "" }}
          >
            <Heading size="lg">Every material, with its grade and its brand.</Heading>
            <Body size="md" className="mt-4">
              A browsable catalogue of what actually goes into the house, down to
              the membrane thickness and the conduit rating.
            </Body>
          </SplitFeature>
        </Bench>

        <Bench id="marquee" section="§0.2" title="MarqueeStrip">
          <div className="-mx-gutter">
            <MarqueeStrip
              items={[
                { primary: "Ridgeline House", secondary: "Arera Colony · 2025" },
                { primary: "Shahpura Terrace Flat", secondary: "Shahpura · 2024" },
                { primary: "Kolar Row House", secondary: "Kolar Road · 2024" },
                { primary: "Trilanga Duplex", secondary: "Trilanga · 2023" },
              ]}
            />
          </div>
        </Bench>

        <Bench id="trust" section="§3.8" title="TrustBar">
          <div className="rounded-md bg-basalt-950 px-6">
            <TrustBar
              credentials={[
                { label: "GSTIN", value: "23AABCZ1234M1Z5" },
                { label: "Registration", value: "U45200MP2018PTC" },
                { label: "Insurance", value: "CAR policy, active" },
                { label: "Google", value: "4.9 / 5 · 61 reviews" },
              ]}
              localities={[
                "Arera Colony",
                "Kolar Road",
                "Shahpura",
                "Trilanga",
                "Bawadiya Kalan",
                "Ayodhya Bypass",
              ]}
              localityHref={() => "/dev/components"}
            />
          </div>
        </Bench>
      </div>

      {/* Full-bleed sections render outside the gallery container. */}
      <Bench id="hero" section="§4.1" title="Hero">
        <span className="sr-only">Hero specimen</span>
      </Bench>

      <Hero
        headline="We show you what's behind the wall."
        subtitle="Turnkey construction, interiors and renovation in Bhopal. We publish our rates, our payment milestones, and photographs of the concealed work before we close it up."
        poster={{ src: "/photos/hero.jpg", alt: "" }}
        fullHeight={false}
        actions={
          <>
            <Button variant="accent" size="lg">
              Get a cost estimate
            </Button>
            <Button variant="secondary" size="lg" className="border-basalt-050 text-basalt-050">
              See our work
            </Button>
          </>
        }
      />

      <Section rhythm="standard">
        <SectionHeader
          index="09"
          label="CTA band"
          title="CTABand asks for a specific rung on the commitment ladder."
        />
      </Section>

      <CTABand
        rung={3}
        headline="Find out what your build actually costs."
        body="A range, not a quote — with every exclusion and assumption published alongside it."
        actions={
          <>
            <Button variant="accent" size="lg">
              Get a cost estimate
            </Button>
            <Button variant="whatsapp" size="lg">
              WhatsApp it to me
            </Button>
          </>
        }
      />

      <FooterMega
        brandName="ZYVORA"
        foundedYear={2018}
        conversionHeadline="Building in Bhopal? Let's talk about your site."
        conversionActions={
          <>
            <Button variant="primary" size="lg">
              Book a site visit
            </Button>
            <Button variant="whatsapp" size="lg">
              WhatsApp us
            </Button>
          </>
        }
        columns={[
          {
            title: "Services",
            links: [
              {
                label: "House Construction",
                href: "/dev/components",
                description: "Plot to handover",
              },
              {
                label: "Home Renovation",
                href: "/dev/components",
                description: "Phased, so you can stay",
              },
              {
                label: "Interior Design",
                href: "/dev/components",
                description: "Detailed before it is cut",
              },
              { label: "Waterproofing", href: "/dev/components" },
              { label: "Modular Kitchen", href: "/dev/components" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "/dev/components" },
              { label: "Process", href: "/dev/components" },
              { label: "Team", href: "/dev/components" },
              { label: "Reviews", href: "/dev/components" },
              { label: "Contact", href: "/dev/components" },
            ],
          },
          {
            title: "Resources",
            links: [
              { label: "The Zyvora Journal", href: "/dev/components" },
              { label: "Cost guides", href: "/dev/components" },
              { label: "FAQ", href: "/dev/components" },
              { label: "Materials", href: "/dev/components" },
              { label: "Downloads", href: "/dev/components" },
            ],
          },
          {
            title: "Contact",
            links: [
              { label: "+91 93998 17681", href: "tel:+919399817681" },
              { label: "WhatsApp", href: "/dev/components" },
              { label: "dhoteghanshyam9@gmail.com", href: "mailto:dhoteghanshyam9@gmail.com" },
            ],
          },
        ]}
        credentials={[
          { label: "GSTIN", value: "23AABCZ1234M1Z5" },
          { label: "Registration", value: "U45200MP2018PTC" },
          { label: "Insurance", value: "CAR policy, active" },
        ]}
        localities={["Arera Colony", "Kolar Road", "Shahpura", "Trilanga", "Bawadiya Kalan", "Ayodhya Bypass"]}
        localityHref={() => "/dev/components"}
        legalLinks={[
          { label: "Privacy", href: "/dev/components" },
          { label: "Terms", href: "/dev/components" },
        ]}
      />
    </GalleryShell>
  );
}
