import type { Metadata } from "next";
import NextLink from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Download,
  UserCheck,
  CreditCard,
} from "lucide-react";

import { Display, Heading, Body, Label } from "@/components/foundation/typography";
import { DatumLine } from "@/components/foundation/datum-line";
import { Icon } from "@/components/foundation/icon";
import { SectionHeader } from "@/components/sections/section-header";
import { CTABand } from "@/components/sections/cta-band";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our 38-Step Construction Process & 9 Payment Milestones",
  description:
    "Explore ZYVORA's 38-step construction journey in Bhopal. Published 9-stage payment milestones, named engineer accountability, and complete handover document checklist.",
};

const PHASES = [
  {
    id: "phase-1",
    number: "01",
    name: "Sanction & Soil",
    weeks: "Weeks 1 – 6",
    steps: [
      {
        step: 1,
        title: "Site Survey & Soil Strata Analysis",
        body: "Soil bore tests to determine bearing capacity and foundation footing depth.",
        role: "Geotechnical Engineer",
        duration: "1 week",
        deliverable: "Soil Test Lab Report & Bearing Capacity Chart",
        paymentPoint: false,
      },
      {
        step: 2,
        title: "Architectural & Structural Drawings",
        body: "Line-by-line BOQ, floor plans, 3D renders, and structural steel schedules.",
        role: "Lead Architect & Structural Engineer",
        duration: "3 weeks",
        deliverable: "Stamped Working Drawings & Line-Item BOQ",
        paymentPoint: true,
      },
      {
        step: 3,
        title: "Municipal Sanction & Mobilisation",
        body: "Filing for building permit, setting up temporary power, water, and material shed.",
        role: "Liaison Officer & Site Engineer",
        duration: "2 weeks",
        deliverable: "Commencement Certificate & Site Setup",
        paymentPoint: true,
      },
    ],
  },
  {
    id: "phase-2",
    number: "02",
    name: "Structural Frame",
    weeks: "Weeks 7 – 20",
    steps: [
      {
        step: 4,
        title: "Excavation & Footing Pour",
        body: "Excavation to hard strata, PCC bed, footing mesh tying, and concrete pour.",
        role: "Named Site Engineer",
        duration: "3 weeks",
        deliverable: "Cube Test Reports (7-day & 28-day)",
        paymentPoint: true,
      },
      {
        step: 5,
        title: "Plinth Beam & Backfilling",
        body: "Plinth beam casting, anti-termite soil treatment, and compacted backfilling.",
        role: "Quality Inspector",
        duration: "3 weeks",
        deliverable: "Anti-Termite 10-Year Warranty Card",
        paymentPoint: true,
      },
      {
        step: 6,
        title: "Columns & Slab Casting",
        body: "Fe550D rebar tying, shuttering inspection, transit mixer pour, and curing log.",
        role: "Structural Inspector",
        duration: "8 weeks",
        deliverable: "Slab Pour Photo Log & Steel Mill Test Certs",
        paymentPoint: true,
      },
    ],
  },
  {
    id: "phase-3",
    number: "03",
    name: "Concealed Works",
    weeks: "Weeks 21 – 30",
    steps: [
      {
        step: 7,
        title: "AAC Blockwork & Chasing",
        body: "External 200mm blockwork, internal 100mm walls, and electrical wall chasing.",
        role: "Mep Supervisor",
        duration: "4 weeks",
        deliverable: "Chasing Layout Approval & Wall Inspection",
        paymentPoint: false,
      },
      {
        step: 8,
        title: "Plumbing & Conduiting Rough-In",
        body: "CPVC/UPVC plumbing lines pressure tested at 10 bar, Polycab FR conduiting.",
        role: "Senior MEP Engineer",
        duration: "3 weeks",
        deliverable: "10-Bar Hydrostatic Pressure Test Log",
        paymentPoint: true,
      },
      {
        step: 9,
        title: "Wet Area Waterproofing",
        body: "Elastomeric 3-coat waterproofing in toilets and terraces, pond testing for 48h.",
        role: "Waterproofing Specialist",
        duration: "3 weeks",
        deliverable: "48-Hour Pond Test Video & 10-Yr Warranty",
        paymentPoint: true,
      },
    ],
  },
  {
    id: "phase-4",
    number: "04",
    name: "Finishes & Joinery",
    weeks: "Weeks 31 – 44",
    steps: [
      {
        step: 10,
        title: "Internal Plaster & Flooring",
        body: "Gypsum/sand-cement plastering, vitrified tile laying with 2mm spacer grouting.",
        role: "Finishing Foreman",
        duration: "6 weeks",
        deliverable: "Tile Batch Numbers & Level Verification",
        paymentPoint: true,
      },
      {
        step: 11,
        title: "Custom Joinery & Kitchens",
        body: "HDMR carcase installation, veneer/laminate press, hardware fitting.",
        role: "Interior Workshop Manager",
        duration: "5 weeks",
        deliverable: "Hardware Guarantee Cards & Joinery Sign-off",
        paymentPoint: true,
      },
      {
        step: 12,
        title: "12-Stage Painting System",
        body: "Surface sanding, primer coat, 2 coats acrylic putty, 2 coats luxury emulsion.",
        role: "Paint Supervisor",
        duration: "3 weeks",
        deliverable: "Moisture Test Meter Log & Shade Codes",
        paymentPoint: false,
      },
    ],
  },
  {
    id: "phase-5",
    number: "05",
    name: "Snagging & Handover",
    weeks: "Weeks 45 – 48",
    steps: [
      {
        step: 13,
        title: "Joint Snagging Walkthrough",
        body: "Client and engineer walk site with blue tape to flag minor defects or paint touches.",
        role: "Quality Assurance Lead",
        duration: "2 weeks",
        deliverable: "Signed Master Snag List & Remediation Log",
        paymentPoint: false,
      },
      {
        step: 14,
        title: "Deep Clean & Key Handover",
        body: "Professional site cleaning, appliance testing, 12-document folder handover.",
        role: "Project Manager",
        duration: "2 weeks",
        deliverable: "Handover Folder & Keys",
        paymentPoint: true,
      },
    ],
  },
];

const PAYMENT_MILESTONES = [
  { percent: 10, label: "Booking & Mobilisation", trigger: "Contract signing & site setup" },
  { percent: 15, label: "Plinth Completion", trigger: "Footings & plinth beam cast" },
  { percent: 15, label: "First Slab Cast", trigger: "Ground floor slab pour & cure" },
  { percent: 15, label: "Final Slab Cast", trigger: "Terrace slab pour & cure" },
  { percent: 10, label: "Brickwork & Conduiting", trigger: "Blockwork & MEP rough-in" },
  { percent: 10, label: "Plaster & Waterproofing", trigger: "Internal plaster & pond test clearance" },
  { percent: 10, label: "Flooring & Tiling", trigger: "Tiles & door frames installed" },
  { percent: 10, label: "Painting & Joinery", trigger: "First coat paint & modular joinery" },
  { percent: 5, label: "Snag Clearance & Handover", trigger: "All snags cleared & keys handed over" },
];

const HANDOVER_DOCUMENTS = [
  "As-built architectural plans & floor layouts",
  "As-built electrical wiring & circuit load schedule",
  "As-built plumbing line & valve location map",
  "10-Bar plumbing hydrostatic pressure test certificate",
  "48-Hour toilet & terrace waterproofing warranty card (10-Yr)",
  "Concrete cube strength test lab reports (7-day & 28-day)",
  "Steel mill test certs (Tata Tiscon / Jindal Fe550D)",
  "Structural engineer stability & safety certificate",
  "Anti-termite chemical treatment warranty (10-Yr)",
  "Paint shade codes, brand details & batch numbers",
  "Hardware & appliance guarantee cards",
  "Comprehensive home care & maintenance manual",
];

const DELAY_REASONS = [
  {
    cause: "Municipal Approval Delays",
    handling: "We file early with complete documents. If sanction exceeds 45 days, baseline schedule shifts in writing without financial penalty.",
  },
  {
    cause: "Monsoon Weather Windows",
    handling: "Heavy rain halts concrete pours. We plan slab schedules around monsoon forecasts and use concrete waterproofing accelerants.",
  },
  {
    cause: "Client Material Selection Delays",
    handling: "We provide a 30-day lookahead calendar for selection deadlines. Delays trigger written schedule extensions.",
  },
  {
    cause: "Mid-Build Design Revisions",
    handling: "Changes are priced via formal Change Order forms before work begins. No verbal instructions are executed on site.",
  },
];

export default function ProcessPage() {
  return (
    <div className="flex flex-col">
      {/* 1. HERO */}
      <section className="border-b border-border bg-bg-surface py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-3xl">
            <DatumLine label="OUR METHODOLOGY" className="mb-4" />
            <Display as="h1" size="xxl" className="tracking-tight">
              Thirty-eight steps. Nine payments. No surprises.
            </Display>
            <Body size="lg" className="mt-6 text-fg-secondary">
              Eliminating the first-time builder’s core fear. Every phase has a named responsible engineer, documented deliverables, and published payment milestones linked to physical site progress.
            </Body>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild variant="primary" size="lg">
                <NextLink href="/contact">
                  <Icon icon={Download} size={20} className="mr-2" />
                  Download full process guide (PDF)
                </NextLink>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <NextLink href="/estimate">Estimate your timeline</NextLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PAYMENT MILESTONE MAP (Interactive Bar) */}
      <section className="border-b border-border bg-basalt-900 py-16 text-basalt-050 dark:bg-basalt-950">
        <div className="container-main">
          <SectionHeader
            label="FINANCIAL TRANSPARENCY"
            title="9 Payment Milestones — Paid Against Progress"
            body="You never pay in advance for uncompleted work. Each payment is released only after physical site clearance."
          />

          <div className="mt-12 flex flex-col gap-6">
            {/* Horizontal Percentage Bar */}
            <div className="flex h-6 w-full overflow-hidden rounded-full bg-basalt-800 p-1 hairline">
              {PAYMENT_MILESTONES.map((m, i) => (
                <div
                  key={m.label}
                  style={{ width: `${m.percent}%` }}
                  className={`h-full border-r border-basalt-900 transition-opacity hover:opacity-80 ${
                    i % 2 === 0 ? "bg-brass-500" : "bg-brass-400"
                  }`}
                  title={`${m.percent}% — ${m.label}`}
                />
              ))}
            </div>

            {/* Milestones Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-9 mt-4">
              {PAYMENT_MILESTONES.map((m, i) => (
                <div
                  key={m.label}
                  className="flex flex-col rounded-md bg-basalt-800 p-4 hairline border-t-2 border-t-brass-500"
                >
                  <span className="font-mono text-caption text-brass-400">
                    STAGE 0{i + 1} ({m.percent}%)
                  </span>
                  <Heading as="h4" size="sm" className="mt-2 text-basalt-100">
                    {m.label}
                  </Heading>
                  <Body size="sm" className="mt-2 text-basalt-400">
                    {m.trigger}
                  </Body>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROCESS TIMELINE & PHASES */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <SectionHeader
            label="WORKFLOW DEEP DIVE"
            title="The 5 Construction Phases"
            body="Detailed breakdown of activities, responsible roles, and handover deliverables at every step."
          />

          <div className="mt-12 flex flex-col gap-16">
            {PHASES.map((phase) => (
              <div key={phase.id} id={phase.id} className="flex flex-col gap-6">
                <div className="flex flex-wrap items-baseline justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-heading-md text-brass-700 dark:text-brass-400">
                      PHASE {phase.number}
                    </span>
                    <Heading as="h2" size="lg">
                      {phase.name}
                    </Heading>
                  </div>
                  <span className="font-mono text-body-md text-fg-muted">
                    {phase.weeks}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {phase.steps.map((step) => (
                    <div
                      key={step.step}
                      className="flex flex-col rounded-md bg-bg p-6 hairline md:flex-row md:items-center md:justify-between gap-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-basalt-100 font-mono font-medium text-fg dark:bg-basalt-800">
                          {step.step}
                        </div>
                        <div>
                          <Heading as="h3" size="sm">
                            {step.title}
                          </Heading>
                          <Body size="sm" className="mt-1 text-fg-secondary">
                            {step.body}
                          </Body>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-caption text-fg-muted font-mono">
                            <span className="flex items-center gap-1">
                              <Icon icon={UserCheck} size={16} className="text-brass-700" />
                              {step.role}
                            </span>
                            <span>•</span>
                            <span>Duration: {step.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start md:items-end border-t md:border-t-0 border-border pt-4 md:pt-0">
                        <Label className="text-fg-muted">DELIVERABLE RECEIVED</Label>
                        <span className="mt-1 font-sans text-body-sm font-medium text-brass-700 dark:text-brass-400">
                          {step.deliverable}
                        </span>
                        {step.paymentPoint && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded bg-brass-500/10 px-2 py-0.5 font-mono text-caption text-brass-700 dark:text-brass-400">
                            <Icon icon={CreditCard} size={16} />
                            Payment Milestone
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CHANGE ORDERS & SCOPE CONTROL */}
      <section className="border-t border-border bg-basalt-100/50 py-16 md:py-24 dark:bg-basalt-900/50">
        <div className="container-main max-w-4xl">
          <SectionHeader
            label="SCOPE CONTROL"
            title="Change Orders & Scope Governance"
            body="How revisions are priced, approved, and tracked. Verbal instructions are never executed."
          />

          <div className="mt-12 rounded-md bg-bg p-8 hairline flex flex-col gap-6">
            <Heading as="h3" size="md">
              The Written Change-Order Protocol
            </Heading>
            <Body size="md" className="text-fg-secondary">
              Mid-project changes happen. Whether you upgrade a tile specification or reconfigure a wall, we evaluate every request via a formal written Change Order.
            </Body>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-2">
              <div className="p-4 rounded bg-basalt-050 dark:bg-basalt-800 hairline">
                <Label className="text-brass-700">1. IMPACT ANALYSIS</Label>
                <p className="mt-2 font-sans text-body-sm text-fg">
                  We calculate exact material cost differences and schedule impacts before taking action.
                </p>
              </div>
              <div className="p-4 rounded bg-basalt-050 dark:bg-basalt-800 hairline">
                <Label className="text-brass-700">2. WRITTEN APPROVAL</Label>
                <p className="mt-2 font-sans text-body-sm text-fg">
                  Both client and project engineer sign the Change Order document. Verbal requests are invalid.
                </p>
              </div>
              <div className="p-4 rounded bg-basalt-050 dark:bg-basalt-800 hairline">
                <Label className="text-brass-700">3. ADDUCE TO BOQ</Label>
                <p className="mt-2 font-sans text-body-sm text-fg">
                  The variation is added to the master payment schedule as an explicit line item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHAT CAN GO WRONG (Honest Disclosures) */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container-main max-w-4xl">
          <SectionHeader
            label="RISK MITIGATION"
            title="What Can Go Wrong — Pre-empting Objections"
            body="Four common construction delay causes and how each is contractually resolved."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {DELAY_REASONS.map((item) => (
              <div key={item.cause} className="rounded-md bg-bg p-6 hairline flex flex-col gap-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <Icon icon={AlertTriangle} size={20} />
                  <Heading as="h4" size="sm">
                    {item.cause}
                  </Heading>
                </div>
                <Body size="sm" className="text-fg-secondary">
                  {item.handling}
                </Body>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HANDOVER DOCUMENTS CHECKLIST */}
      <section className="border-t border-border bg-basalt-900 py-16 text-basalt-050 dark:bg-basalt-950">
        <div className="container-main max-w-4xl">
          <SectionHeader
            label="HANDOVER FOLDER"
            title="12 Handover Documents You Receive"
            body="Complete technical documentation folder delivered at final keys handover."
          />

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HANDOVER_DOCUMENTS.map((doc, idx) => (
              <div key={doc} className="flex items-start gap-3 rounded bg-basalt-800 p-4 hairline">
                <Icon icon={CheckCircle2} size={20} className="mt-0.5 shrink-0 text-brass-400" />
                <span className="font-sans text-body-sm text-basalt-200">
                  {/* §2.1.4 — dark surfaces take brass-300; brass-700 is 3.36:1 here. */}
                  <span className="font-mono text-caption text-brass-300 mr-2">#{idx + 1}</span>
                  {doc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA BAND */}
      <CTABand
        rung={5}
        headline="Ready to build with complete process clarity?"
        body="Schedule a free site visit and architectural brief review."
        actions={
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="accent" size="lg">
              <NextLink href="/contact">Book a site visit</NextLink>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <NextLink href="/estimate">Get a cost estimate</NextLink>
            </Button>
          </div>
        }
      />
    </div>
  );
}
