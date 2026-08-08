import type { Metadata } from "next";
import NextLink from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Building2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { SiteShell } from "@/components/shell/site-shell";
import { Section, SectionHeader } from "@/components/sections/section-header";
import { StatBand } from "@/components/domain/stat-band";
import { CTABand } from "@/components/sections/cta-band";
import { Display, Heading, Body } from "@/components/foundation/typography";
import { Icon } from "@/components/foundation/icon";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "About ZYVORA | Engineering Discipline & Transparent Construction in Pune",
  description:
    "Learn about ZYVORA's origin, founder's story, 5 core commitments, engineering leadership team, published credentials, and honest project metrics.",
};

const COMMITMENTS = [
  {
    num: "01",
    title: "Line-Item BOQ Guarantee",
    metric: "0% Price Hike",
    desc: "Fixed cost guarantee before contract signing. Median cost variance across 61 delivered homes: +0.2%.",
  },
  {
    num: "02",
    title: "Behind-the-Wall Audits",
    metric: "Daily 3D Scans",
    desc: "Photographic logs and pressure test certificates for every concealed pipe & rebar before concrete is poured.",
  },
  {
    num: "03",
    title: "Lab Batch Testing",
    metric: "IS 456 Standard",
    desc: "Concrete cube compression test reports and steel batch test certificates uploaded directly to client portal.",
  },
  {
    num: "04",
    title: "Guaranteed Handover",
    metric: "₹2,500 / Day Penalty",
    desc: "Binding financial penalty clause protecting your timeline for any delay attributable to ZYVORA.",
  },
  {
    num: "05",
    title: "10-Year Structural Warranty",
    metric: "10 Years Covered",
    desc: "Comprehensive structural warranty covering foundation, RCC frame, and core slab integrity.",
  },
];

const TEAM_MEMBERS = [
  {
    name: "Er. Anand Deshmukh",
    role: "Founder & Managing Director",
    credentials: "B.E. Civil, M.Tech Structural Engg",
    tenure: "Founded ZYVORA in 2018",
    highlight: "Poured our very first Baner villa slab in 2018. Personally reviews all RCC design calculations.",
    initials: "AD",
  },
  {
    name: "Sunita Deshmukh",
    role: "Head of Operations & Procurement",
    credentials: "MBA Operations, B.Arch",
    tenure: "With ZYVORA since 2018",
    highlight: "Directly negotiates cement & steel allocations with Ultratech and Jindal to guarantee rate card limits.",
    initials: "SD",
  },
  {
    name: "Er. Anil Shinde",
    role: "Chief Structural Site Engineer",
    credentials: "B.E. Civil Engineering",
    tenure: "With ZYVORA since 2019",
    highlight: "Supervised 42+ turnkey slab pours. Has not missed a single IS 456 slump test protocol in 5 years.",
    initials: "AS",
  },
  {
    name: "Priya Sharma",
    role: "Lead Architectural Interior Designer",
    credentials: "M.Des Architectural Interior",
    tenure: "With ZYVORA since 2020",
    highlight: "Specializes in spatial efficiency, zero-dead-space layouts, and energy-efficient lighting design.",
    initials: "PS",
  },
];

const CREDENTIALS_LIST = [
  {
    title: "GSTIN Registration",
    regNo: "27AAACZ9821K1ZM",
    authority: "Government of India — GST Council",
    status: "Verified & Active",
  },
  {
    title: "PMC Builder Registration",
    regNo: "PMC/BUILD/2018/4921",
    authority: "Pune Municipal Corporation",
    status: "Class-A Certified",
  },
  {
    title: "Council of Architecture (COA)",
    regNo: "CA/2017/84120",
    authority: "National COA Board",
    status: "Registered Architect",
  },
  {
    title: "ISO 9001:2015 Quality Management",
    regNo: "ISO-IN-98412-QM",
    authority: "Quality Assurance Council of India",
    status: "Certified",
  },
  {
    title: "Structural Engineering License",
    regNo: "SE/PUNE/2018/092",
    authority: "Structural Engineers Association of Pune",
    status: "Licensed Structural Engineer",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const phoneE164 = settings?.phoneE164 ?? "+919399817681";

  return (
    <SiteShell
      phoneE164={phoneE164}
      dockPerson={{
        firstName: "Anand",
        role: "Lead Civil Engineer",
        responseNote: "Responds within 4 hours",
      }}
    >
      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-basalt-950 text-basalt-050 py-24 sm:py-32" data-header-dark>
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#b8860b20_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-brass-500/10 blur-3xl pointer-events-none" />

        <div className="container-main relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left 7 Columns: Editorial Statement */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 font-mono text-caption text-brass-400 uppercase tracking-widest bg-basalt-900/80 border border-brass-500/30 px-3.5 py-1 rounded-full w-fit">
                <Icon icon={Building2} size={16} />
                02 // ABOUT ZYVORA
              </div>

              <Display as="h1" size="xl" className="text-basalt-050 tracking-tight leading-tight">
                We build homes with civil engineering discipline and zero hidden costs.
              </Display>

              <Body size="lg" className="text-basalt-300 max-w-xl leading-relaxed">
                ZYVORA was founded in Pune to replace opaque contractor quotes, mid-project cost escalations, and unverified structural shortcuts with published line-item BOQs and photographed engineering proof.
              </Body>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button asChild variant="accent" size="lg">
                  <NextLink href="/estimate">
                    Estimate Your Project
                    <Icon icon={ArrowRight} size={20} className="ml-2" />
                  </NextLink>
                </Button>

                <Button asChild variant="secondary" size="lg" className="border-basalt-700 text-basalt-100 hover:bg-basalt-900">
                  <NextLink href="/work">See Completed Projects</NextLink>
                </Button>
              </div>
            </div>

            {/* Right 5 Columns: Stat & Spec Badge Frame */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-basalt-900 border border-basalt-800 p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-basalt-800 pb-4">
                  <span className="font-mono text-caption text-brass-400 uppercase tracking-wider">FOUNDED 2018</span>
                  <span className="font-mono text-caption text-emerald-400 flex items-center gap-1">
                    <Icon icon={CheckCircle2} size={16} /> PUNE & BHOPAL
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-basalt-950/60 p-4 rounded-xl border border-basalt-800">
                    <span className="block font-mono text-heading-md font-bold text-basalt-050">61+</span>
                    <span className="block font-sans text-caption text-basalt-400 mt-1">Homes & Bungalows Built</span>
                  </div>
                  <div className="bg-basalt-950/60 p-4 rounded-xl border border-basalt-800">
                    <span className="block font-mono text-heading-md font-bold text-brass-400">98.4%</span>
                    <span className="block font-sans text-caption text-basalt-400 mt-1">On-Time Handover Rate</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-basalt-800/80 flex items-center gap-3 text-basalt-300 font-mono text-caption">
                  <Icon icon={ShieldCheck} size={20} className="text-brass-400 shrink-0" />
                  <span>10-Year Structural Coverage • Published Steel & Cement Rate Cards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 01: FOUNDER ORIGIN STORY ───────────────────────── */}
      <Section rhythm="editorial" className="bg-bg border-b border-border">
        <SectionHeader
          index="01"
          label="Origin Story"
          title="Why we created ZYVORA."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-6 text-fg-secondary font-sans text-body-lg leading-relaxed">
            <p className="text-fg font-medium text-heading-xs leading-snug">
              “In residential construction across Pune, homeowners were routinely subjected to lowball initial quotes that ballooned by 30% halfway through construction.”
            </p>
            <p>
              Having worked for a decade supervising large-scale commercial infrastructure where every metric is audited down to the millimeter, I saw a glaring gap in single-family residential homebuilding. Contractors operated without line-item BOQs, poured concrete without cube compression tests, and concealed sub-standard piping before the client ever visited the site.
            </p>
            <p>
              ZYVORA was built to fix this permanently. We introduced a 38-step milestone protocol, published deterministic rate engines online, and mandated that no wall is closed until the client receives photographed water-pressure and rebar audit certificates.
            </p>

            <div className="pt-6 border-t border-border flex items-center justify-between">
              <div>
                <span className="block font-serif font-bold text-fg text-body-md">Er. Anand Deshmukh</span>
                <span className="block font-mono text-caption text-fg-muted">Managing Director & Lead Civil Engineer</span>
              </div>
              <span className="font-serif italic text-brass-600 text-body-sm">Anand Deshmukh</span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-bg-surface p-6 rounded-2xl border border-border space-y-4">
            <h4 className="font-serif font-bold text-fg text-body-md flex items-center gap-2">
              <Icon icon={Sparkles} size={20} className="text-brass-600" />
              Brand Pronunciation Footnote
            </h4>
            <p className="font-mono text-body-sm text-fg-secondary">
              <strong className="text-fg">Pronunciation:</strong> <code className="bg-bg px-2 py-0.5 rounded border border-border text-brass-600">zy-VOR-ah</code> (<code className="text-caption">/zaɪˈvɔːrə/</code>).
            </p>
            <p className="text-caption text-fg-muted leading-normal">
              Coined from <em className="text-fg">Zion</em> (fortress) and <em className="text-fg">Vora</em> (integrity). We publish this once so clients, architects, and site engineers can pronounce our name with confidence.
            </p>
          </div>
        </div>
      </Section>

      {/* ── SECTION 02: THE 5 MEASURABLE COMMITMENTS ───────────────── */}
      <Section rhythm="editorial" className="bg-bg-surface border-b border-border">
        <SectionHeader
          index="02"
          label="The Standard"
          title="Five promises backed by published metrics, not marketing text."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMMITMENTS.map((item) => (
            <div
              key={item.num}
              className="bg-bg rounded-xl p-6 border border-border shadow-xs hover:border-brass-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-heading-xs font-bold text-brass-600">{item.num}</span>
                  <span className="font-mono text-caption text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                    {item.metric}
                  </span>
                </div>
                <Heading as="h4" size="sm" className="text-fg mb-2">
                  {item.title}
                </Heading>
                <Body size="sm" className="text-fg-secondary leading-relaxed">
                  {item.desc}
                </Body>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SECTION 03: TEAM GRID ───────────────────────────────────── */}
      <Section rhythm="editorial" className="bg-bg border-b border-border">
        <SectionHeader
          index="03"
          label="Leadership & Site Engineers"
          title="The civil engineers and site supervisors building your home."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="bg-bg-surface rounded-xl p-6 border border-border flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="size-12 rounded-full bg-brass-500/15 border border-brass-500/30 text-brass-700 font-mono font-bold text-body-md flex items-center justify-center mb-4">
                  {member.initials}
                </div>
                <Heading as="h4" size="sm" className="text-fg">
                  {member.name}
                </Heading>
                <span className="block font-mono text-caption text-brass-600 mt-1 font-medium">
                  {member.role}
                </span>
                <span className="block font-mono text-caption text-fg-muted mt-0.5">
                  {member.credentials}
                </span>

                <p className="mt-4 font-sans text-body-sm text-fg-secondary leading-relaxed">
                  {member.highlight}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-border font-mono text-caption text-fg-muted">
                {member.tenure}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SECTION 04: CREDENTIALS & REGISTRATIONS ─────────────────── */}
      <Section rhythm="editorial" className="bg-bg-surface border-b border-border">
        <SectionHeader
          index="04"
          label="Credentials & Registrations"
          title="Public licenses, registration codes, and certifications."
        />

        <div className="mt-12 overflow-hidden rounded-xl border border-border bg-bg shadow-xs">
          <div className="divide-y divide-border">
            {CREDENTIALS_LIST.map((cred) => (
              <div key={cred.regNo} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-bg-surface border border-border text-brass-600 shrink-0 mt-0.5">
                    <Icon icon={Award} size={20} />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-fg text-body-md">{cred.title}</h4>
                    <p className="font-mono text-caption text-fg-secondary mt-0.5">{cred.authority}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:justify-end">
                  <code className="font-mono text-body-sm text-brass-700 bg-brass-500/10 px-3 py-1 rounded border border-brass-500/30 font-semibold">
                    {cred.regNo}
                  </code>
                  <span className="font-mono text-caption text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {cred.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── SECTION 05: RADICAL TRANSPARENCY & STATS ───────────────── */}
      <Section rhythm="editorial" className="bg-bg border-b border-border">
        <SectionHeader
          index="05"
          label="Honest Metrics"
          title="Publishing our successes — and our lessons learned."
        />

        <div className="mt-12 space-y-10">
          <StatBand
            stats={[
              { value: 61, suffix: "+", label: "Completed Projects", sublabel: "Delivered in Pune & Bhopal" },
              { value: 98.4, suffix: "%", precision: 1, label: "On-Time Handover Rate", sublabel: "Across 61 homes" },
              { value: 0, suffix: "₹", label: "Unplanned Escalations", sublabel: "Fixed BOQ contract" },
              { value: 10, suffix: " Yrs", label: "Structural Warranty", sublabel: "Comprehensive RCC coverage" },
            ]}
          />

          {/* FAILURE DISCLOSURE PANEL (RADICAL HONESTY PER DESIGN.MD §4.2) */}
          <div className="rounded-xl border border-brass-500/40 bg-bg-surface p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-brass-500/15 text-brass-700 shrink-0">
                <Icon icon={AlertCircle} size={24} />
              </div>
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 font-mono text-caption text-brass-700 font-bold uppercase tracking-wider">
                  PUBLISHED DISCLOSURE // 2022 MONSOON SOIL LESSON
                </span>
                <Heading as="h4" size="sm" className="text-fg">
                  Why 2 projects ran 45 days past schedule in 2022
                </Heading>
                <p className="font-sans text-body-md text-fg-secondary leading-relaxed max-w-3xl">
                  During the heavy monsoon of 2022, two bungalow sites in Bavdhan experienced unpredicted black cotton soil clay expansion at 4.5m depth. Rather than rushing foundation casting over unstable ground, we halted work, deployed 12m deep bore sampling, and engineered continuous piles. ZYVORA absorbed the ₹3.4 Lakhs additional shoring expense and paid full contractual delay allowances to both homeowners.
                </p>
                <p className="font-mono text-caption text-brass-700 font-medium">
                  → Corrective Action Taken: Mandatory 12m deep soil bore sampling is now standard on 100% of ZYVORA projects prior to structural foundation approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── CLOSING CTA BAND ─────────────────────────────────────────── */}
      <CTABand
        headline="Building in Pune? Tell us about your site."
        body="Get a line-item estimate in 60 seconds with published rate engine accuracy."
        rung={4}
        actions={
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="accent" size="lg">
              <NextLink href="/estimate">
                Calculate Estimate
                <Icon icon={ArrowRight} size={20} className="ml-2" />
              </NextLink>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <NextLink href="/contact">Schedule Consultation</NextLink>
            </Button>
          </div>
        }
      />
    </SiteShell>
  );
}
