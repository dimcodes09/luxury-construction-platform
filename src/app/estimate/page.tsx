"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Building,
  Home,
  RefreshCw,
  Sparkles,
  Layers,
  Info,
  Send,
  Download,
  ShieldCheck,
  Calendar,
  Layers3,
  Sliders,
  CheckCircle2,
} from "lucide-react";

import { Display, Heading, Body, Label, Numeral, Datum } from "@/components/foundation/typography";
import { DatumLine } from "@/components/foundation/datum-line";
import { Icon } from "@/components/foundation/icon";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { CostRangeBar } from "@/components/domain/cost-range-bar";
import type { calculateEstimate } from "@/lib/estimator/engine";

/* What /api/estimate returns: the deterministic engine output (SRS §4.9.1)
 * plus the persisted id and the assumptions shown alongside it (FR-EST-06).
 * Derived from the engine so the two cannot drift — FR-EST-02 is absolute that
 * these figures come from the engine and never from an LLM. */
type EngineOutput = ReturnType<typeof calculateEstimate>;

type EstimateResult = EngineOutput & {
  estimateId?: string;
  output?: EngineOutput;
  assumptions?: {
    rateCardVersion?: number;
    regionalMultiplier?: number;
    commodityRates?: {
      steelPerKg?: number;
      cementPerBag?: number;
      sandPerBrass?: number;
      bricksPerThousand?: number;
    };
  };
};

type EstimatorState = {
  projectType: string;
  locality: string;
  city: string;
  area: number;
  floors: number;
  tier: "essential" | "signature" | "bespoke";
  siteCondition: "standard" | "steep-slope" | "narrow-access" | "rocky-strata";
  addons: string[];
};

const PROJECT_TYPES = [
  { id: "house-construction", label: "New House Construction", desc: "Turnkey structural RCC build from ground up", icon: Home },
  { id: "turnkey-home-solutions", label: "Turnkey Home Solutions", desc: "Structure + complete interior architecture & joinery", icon: Building },
  { id: "home-renovation", label: "Home Renovation", desc: "Full-home structural & finishing re-architecture", icon: RefreshCw },
  { id: "interior-design", label: "Interior Design Only", desc: "Space planning, joinery, lighting & soft finishes", icon: Sparkles },
  { id: "modular-kitchen", label: "Single Service / Kitchen", desc: "Marine ply carcases, countertops & hardware", icon: Layers },
];

const LOCALITIES = [
  "Baner",
  "Koregaon Park",
  "Kalyani Nagar",
  "Wakad",
  "Kothrud",
  "Viman Nagar",
  "Hinjewadi",
  "Pimple Saudagar",
  "Hadapsar",
  "Bavdhan",
];

const TIER_SPECS = [
  {
    id: "essential",
    label: "ESSENTIAL TIER",
    name: "Standard Quality",
    desc: "Tested structural standards with standard market brands.",
    specs: ["Ultratech OPC 53 Grade Cement", "Tata Tiscon Fe550D Rebar", "Vitrified Tile Flooring (60x60cm)", "Jaquar / Cera CP Fittings"],
  },
  {
    id: "signature",
    label: "SIGNATURE TIER (RECOMMENDED)",
    name: "Premium Craftsmanship",
    desc: "Upgraded finishes, branded fixtures, and 3-year warranty.",
    specs: ["Grohe / Kohler Brass Fittings", "BWP Grade Marine Ply Joinery", "Italian Marble Accents", "10-Bar Pressure Tested Plumbing"],
    recommended: true,
  },
  {
    id: "bespoke",
    label: "BESPOKE TIER",
    name: "Luxury Architecture",
    desc: "Imported materials, home automation, and 5-year warranty.",
    specs: ["Imported Italian Marble Flooring", "Hansgrohe / Toto Sanitaryware", "Smart Home Touch Automation", "5-Year Whole-Home Warranty"],
  },
];

const ADDON_OPTIONS = [
  { id: "solar-pv-3kw", label: "3kW Solar PV System", cost: 220000 },
  { id: "ev-charger-11kw", label: "11kW EV Fast Charger", cost: 45000 },
  { id: "smart-automation-basic", label: "Home Automation Basic", cost: 150000 },
  { id: "rainwater-harvesting", label: "Rainwater Harvesting System", cost: 65000 },
  { id: "elevator-3-stop", label: "3-Stop Hydraulic Elevator", cost: 650000 },
  { id: "borewell-submersible", label: "Borewell & Submersible Pump", cost: 85000 },
  { id: "cctv-8-cam", label: "8-Camera IP CCTV Security", cost: 38000 },
];

function EstimatorFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [state, setState] = useState<EstimatorState>({
    projectType: searchParams.get("type") || "house-construction",
    locality: searchParams.get("locality") || "Baner",
    city: searchParams.get("city") || "Pune",
    area: Number(searchParams.get("area")) || 2400,
    floors: Number(searchParams.get("floors")) || 1,
    tier: (searchParams.get("tier") as "essential" | "signature" | "bespoke") || "signature",
    siteCondition: "standard",
    addons: [],
  });

  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  const [narration, setNarration] = useState<string | null>(null);

  // Rung 4 delivery form state
  const [sendName, setSendName] = useState("");
  const [sendEmail, setSendEmail] = useState("");
  const [sendPhone, setSendPhone] = useState("");
  const [sendChannel, setSendChannel] = useState<"email" | "whatsapp">("email");
  const [sendSubmitted, setSendSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  // Sync state to URL params (FR-EST-11)
  useEffect(() => {
    const urlStep = searchParams.get("step");
    if (urlStep) {
      const parsedStep = parseInt(urlStep, 10);
      if (parsedStep >= 1 && parsedStep <= 5) {
        setStep(parsedStep);
      }
    }
  }, [searchParams]);

  const updateState = (patch: Partial<EstimatorState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("type", next.projectType);
        params.set("locality", next.locality);
        params.set("city", next.city);
        params.set("area", String(next.area));
        params.set("tier", next.tier);
        params.set("step", String(step));
        window.history.replaceState(null, "", `/estimate?${params.toString()}`);
      }
      return next;
    });
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 3 && (state.area < 100 || state.area > 50000)) {
      setErrorMsg("Please enter a valid area between 100 and 50,000 sq ft.");
      return;
    }
    if (step < 5) {
      const nextStep = step + 1;
      setStep(nextStep);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("step", String(nextStep));
        window.history.replaceState(null, "", `/estimate?${params.toString()}`);
      }
      fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state, step: nextStep, completed: false }),
      }).catch(() => {});
    } else {
      computeFinalEstimate();
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("step", String(prevStep));
        window.history.replaceState(null, "", `/estimate?${params.toString()}`);
      }
    }
  };

  const computeFinalEstimate = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state, completed: true, step: 5 }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error?.message || "Failed to compute estimate.");
        setLoading(false);
        return;
      }

      setEstimateResult(data);
      setShowResult(true);

      fetch("/api/estimate/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId: data.estimateId,
          projectType: state.projectType,
          area: state.area,
          tier: state.tier,
          locality: state.locality,
          min: data.output.min,
          max: data.output.max,
          mostLikely: data.output.mostLikely,
        }),
      })
        .then((r) => r.json())
        .then((narrateData) => {
          if (narrateData.narration) setNarration(narrateData.narration);
        })
        .catch(() => {});
    } catch (err) {
      setErrorMsg("Network error computing estimate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/estimate/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId: estimateResult?.estimateId,
          name: sendName,
          email: sendEmail,
          phone: sendPhone,
          channel: sendChannel,
        }),
      });

      if (res.ok) {
        setSendSubmitted(true);
      }
    } catch (err) {
      console.error("Failed to send estimate:", err);
    } finally {
      setSending(false);
    }
  };

  const toggleAddon = (id: string) => {
    const next = state.addons.includes(id)
      ? state.addons.filter((a) => a !== id)
      : [...state.addons, id];
    updateState({ addons: next });
  };

  // UNGATED RESULT VIEW — ARCHITECTURAL REPORT EXPERIENCE (design.md §5.2)
  if (showResult && estimateResult) {
    /* The API nests the engine result under `output`; older responses and the
     * inline widget return it flat. Falling back to the top-level object keeps
     * both shapes working and satisfies the non-null narrowing. */
    const output = estimateResult.output ?? estimateResult;
    const assumptions = estimateResult.assumptions;

    const confMin = output.min + (output.mostLikely - output.min) * 0.4;
    const confMax = output.mostLikely + (output.max - output.mostLikely) * 0.4;

    const breakdownItems = [
      { key: "structure", label: "1. STRUCTURE", share: 0.37, desc: "Footing, columns, RCC slab & blockwork", min: output.breakdown.structure.min, max: output.breakdown.structure.max },
      { key: "finishes", label: "2. FINISHES", share: 0.33, desc: "Flooring, plastering, painting & joinery", min: output.breakdown.finishes.min, max: output.breakdown.finishes.max },
      { key: "mep", label: "3. MEP & SERVICES", share: 0.15, desc: "Concealed CPVC/UPVC plumbing & FR wiring", min: output.breakdown.mep.min, max: output.breakdown.mep.max },
      { key: "designPM", label: "4. DESIGN & PM", share: 0.08, desc: "Architectural drawings, 3D & site engineer", min: output.breakdown.designPM.min, max: output.breakdown.designPM.max },
      { key: "contingency", label: "5. CONTINGENCY", share: 0.07, desc: "Site condition & material market reserve", min: output.breakdown.contingency.min, max: output.breakdown.contingency.max },
    ];

    return (
      <div className="flex flex-col bg-bg">
        {/* RESULT HERO (FULL-BLEED BLUEPRINT LOOK) */}
        <section className="bg-blueprint-700 py-16 md:py-24 text-basalt-050 border-b border-blueprint-600">
          <div className="container-narrow">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blueprint-500/40 pb-6 mb-8">
              <Datum className="text-blueprint-300">
                REPORT // ESTIMATE-{state.locality.toUpperCase()}-{state.area}SQFT-{state.tier.toUpperCase()}
              </Datum>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blueprint-800 px-3 py-1 font-mono text-caption text-brass-400 border border-blueprint-500/30">
                <span className="size-2 rounded-full bg-brass-400 animate-pulse" />
                VERIFIED DETERMINISTIC ENGINE
              </span>
            </div>

            <Label className="text-blueprint-300 block">ESTIMATED TOTAL INVESTMENT RANGE</Label>
            <Display as="h1" size="xxl" className="mt-2 text-basalt-050 font-mono tracking-tight">
              ₹{(output.min / 100000).toFixed(1)} L – ₹{(output.max / 100000).toFixed(1)} L
            </Display>

            <div className="mt-4 flex flex-wrap items-baseline gap-4">
              <Body size="lg" className="text-blueprint-200">
                Most likely budget:{" "}
                <strong className="text-brass-300 font-mono font-bold text-heading-md">
                  ₹{(output.mostLikely / 100000).toFixed(1)} Lakhs
                </strong>
              </Body>
              <span className="font-mono text-body-md text-blueprint-300">
                (₹{output.perSqft.toLocaleString("en-IN")} / sq ft)
              </span>
            </div>

            {output.logisticsNote && (
              <div className="mt-6 rounded bg-blueprint-800 p-4 border border-blueprint-600 font-mono text-body-sm text-blueprint-200">
                <Icon icon={Info} size={16} className="inline mr-2 text-brass-400" />
                {output.logisticsNote}
              </div>
            )}

            {/* Cost Range Bar Component */}
            <div className="mt-10 pt-6 border-t border-blueprint-600/50">
              <CostRangeBar
                min={output.min}
                max={output.max}
                mostLikely={output.mostLikely}
                confidenceMin={confMin}
                confidenceMax={confMax}
                formatValue={(n) => `₹${(n / 100000).toFixed(1)} L`}
              />
              <div className="mt-3 flex items-center justify-between text-caption font-mono text-blueprint-300">
                <span>Confidence: <strong className="text-brass-400 uppercase">{output.confidence}</strong></span>
                <span>Based on {output.comparableProjectCount} comparable completed projects in {state.locality}</span>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN REPORT BODY */}
        <section className="py-16 md:py-24">
          <div className="container-narrow flex flex-col gap-16">
            {/* EQUAL VISUAL WEIGHT: INCLUSIONS VS EXCLUSIONS (design.md §5.2 — THE TRUST PLAY) */}
            <div className="flex flex-col gap-8">
              <div>
                <Label className="text-brass-600 dark:text-brass-400 block mb-1">RADICAL TRANSPARENCY</Label>
                <Heading as="h2" size="xl">
                  Scope Boundaries — What is INCLUDED & EXCLUDED
                </Heading>
                <Body size="md" className="mt-2 text-fg-secondary">
                  Two adjacent columns of equal visual weight. What is NOT included is our primary trust payload.
                </Body>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* WHAT THIS INCLUDES */}
                <div className="flex flex-col rounded-md border border-emerald-500/30 bg-emerald-500/5 p-8 dark:bg-emerald-950/20 hairline">
                  <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Icon icon={Check} size={20} />
                    </div>
                    <Heading as="h3" size="md" className="text-emerald-900 dark:text-emerald-100">
                      WHAT THIS INCLUDES
                    </Heading>
                  </div>
                  <ul className="mt-6 flex flex-col gap-4">
                    {output.inclusions.map((item: string) => (
                      <li key={item} className="flex items-start gap-3">
                        <Icon icon={Check} size={16} className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-sans text-body-md text-fg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* WHAT THIS DOES NOT INCLUDE (Equal Visual Weight) */}
                <div className="flex flex-col rounded-md border border-rose-500/30 bg-rose-500/5 p-8 dark:bg-rose-950/20 hairline">
                  <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4">
                    <div className="flex size-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      <Icon icon={X} size={20} />
                    </div>
                    <Heading as="h3" size="md" className="text-rose-900 dark:text-rose-100">
                      WHAT THIS DOES NOT INCLUDE
                    </Heading>
                  </div>
                  <ul className="mt-6 flex flex-col gap-4">
                    {output.exclusions.map((item: string) => (
                      <li key={item} className="flex items-start gap-3">
                        <Icon icon={X} size={16} className="mt-1 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span className="font-sans text-body-md text-fg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* BREAKDOWN BY COMPONENT */}
            <div className="flex flex-col gap-8 border-t border-border pt-16">
              <div>
                <Label className="text-brass-600 dark:text-brass-400 block mb-1">SYSTEM SPLIT</Label>
                <Heading as="h2" size="xl">
                  Cost Breakdown by Component
                </Heading>
              </div>

              <div className="flex flex-col divide-y divide-border rounded-md bg-bg border border-border overflow-hidden hairline">
                {breakdownItems.map((b) => (
                  <div key={b.key} className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="md:w-1/3">
                      <Label className="text-brass-600 dark:text-brass-400">{b.label}</Label>
                      <Body size="sm" className="mt-1 text-fg-secondary">
                        {b.desc}
                      </Body>
                    </div>

                    <div className="flex items-center gap-4 md:w-2/3 justify-between md:justify-end">
                      <div className="w-32 bg-basalt-100 dark:bg-basalt-800 h-3 rounded-full overflow-hidden hidden sm:block">
                        <div className="bg-brass-500 h-full" style={{ width: `${b.share * 100}%` }} />
                      </div>
                      <span className="font-mono text-caption text-fg-muted w-12 text-right">
                        {(b.share * 100).toFixed(0)}%
                      </span>
                      <Numeral size="md" className="text-fg w-40 text-right">
                        ₹{(b.min / 100000).toFixed(1)} L – ₹{(b.max / 100000).toFixed(1)} L
                      </Numeral>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PLAIN LANGUAGE NARRATION */}
            {narration && (
              <div className="flex flex-col gap-6 border-t border-border pt-16">
                <Label className="text-brass-600 dark:text-brass-400 block mb-1">AI EXPLANATION ENGINE</Label>
                <Heading as="h2" size="xl">
                  What Drives This Number
                </Heading>
                <div className="rounded-md bg-basalt-100/50 dark:bg-basalt-900 p-8 hairline flex flex-col gap-4 border-l-4 border-l-brass-500">
                  {narration.split("\n\n").map((paragraph, idx) => (
                    <Body key={idx} size="md" className="text-fg leading-relaxed">
                      {paragraph}
                    </Body>
                  ))}
                </div>
              </div>
            )}

            {/* ASSUMPTIONS PANEL */}
            <div className="flex flex-col gap-6 border-t border-border pt-16">
              <Label className="text-brass-600 dark:text-brass-400 block mb-1">ENGINE PARAMETERS</Label>
              <Heading as="h2" size="xl">
                Published Rate Card Assumptions
              </Heading>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 font-mono text-body-sm bg-basalt-900 text-basalt-050 p-8 rounded-md hairline">
                <div>
                  <Label className="text-brass-400 block">RATE CARD</Label>
                  <span className="block mt-2 text-heading-sm font-medium">v{assumptions?.rateCardVersion}</span>
                </div>
                <div>
                  <Label className="text-brass-400 block">REGIONAL MULTIPLIER</Label>
                  <span className="block mt-2 text-heading-sm font-medium text-brass-300">
                    {assumptions?.regionalMultiplier}x ({state.locality})
                  </span>
                </div>
                <div>
                  <Label className="text-brass-400 block">COMMODITY STEEL</Label>
                  <span className="block mt-2 text-heading-sm font-medium">
                    ₹{assumptions?.commodityRates?.steelPerKg}/kg
                  </span>
                </div>
                <div>
                  <Label className="text-brass-400 block">COMMODITY CEMENT</Label>
                  <span className="block mt-2 text-heading-sm font-medium">
                    ₹{assumptions?.commodityRates?.cementPerBag}/bag
                  </span>
                </div>
              </div>
            </div>

            {/* RUNG 4 / RUNG 5 CONVERSION BOX */}
            <div className="border-t border-border pt-16">
              <div className="rounded-md bg-basalt-950 p-8 md:p-12 text-basalt-050 hairline flex flex-col gap-8">
                <div>
                  <Datum className="text-brass-400 block mb-2">RUNG 4 VALUE EXCHANGE</Datum>
                  <Display as="h2" size="lg" className="text-basalt-050">
                    Email or WhatsApp this report as a PDF
                  </Display>
                  <Body size="md" className="mt-3 text-basalt-300 max-w-xl">
                    Receive the complete PDF calculation sheet with line-item specification benchmarks to hold against competitor quotes.
                  </Body>
                </div>

                {sendSubmitted ? (
                  <div className="rounded bg-emerald-500/10 border border-emerald-500/30 p-6 text-emerald-400 font-sans text-body-md flex items-center gap-4">
                    <Icon icon={ShieldCheck} size={32} />
                    <div>
                      <span className="block font-medium">Estimate sent successfully!</span>
                      <span className="text-body-sm text-emerald-400/80">Check your inbox or WhatsApp for the report.</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendEstimate} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Input
                        value={sendName}
                        onChange={(e) => setSendName(e.target.value)}
                        placeholder="Your Full Name *"
                        required
                        className="bg-basalt-900 text-basalt-050 border-basalt-800"
                      />
                      <Input
                        type="email"
                        value={sendEmail}
                        onChange={(e) => setSendEmail(e.target.value)}
                        placeholder="Email Address"
                        className="bg-basalt-900 text-basalt-050 border-basalt-800"
                      />
                      <Input
                        type="tel"
                        value={sendPhone}
                        onChange={(e) => setSendPhone(e.target.value)}
                        placeholder="10-Digit Mobile Number"
                        className="bg-basalt-900 text-basalt-050 border-basalt-800 font-mono"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-6 text-body-sm text-basalt-300">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="channel"
                            checked={sendChannel === "email"}
                            onChange={() => setSendChannel("email")}
                            className="text-brass-500 focus:ring-brass-500"
                          />
                          Email PDF Report
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="channel"
                            checked={sendChannel === "whatsapp"}
                            onChange={() => setSendChannel("whatsapp")}
                            className="text-brass-500 focus:ring-brass-500"
                          />
                          WhatsApp Direct
                        </label>
                      </div>

                      <Button type="submit" variant="accent" size="lg" disabled={sending}>
                        {sending ? "Sending..." : "Send Estimate PDF"}
                        <Icon icon={Send} size={20} className="ml-2" />
                      </Button>
                    </div>
                  </form>
                )}

                <div className="flex flex-wrap items-center justify-between border-t border-basalt-800 pt-6 text-caption text-basalt-400">
                  <NextLink
                    href={`/api/estimate/${estimateResult?.estimateId || "latest"}/pdf`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-brass-400 hover:underline"
                  >
                    <Icon icon={Download} size={16} />
                    Open PDF directly in browser
                  </NextLink>

                  <Button asChild variant="secondary" size="md">
                    <NextLink href="/contact">Book a site visit to firm this up →</NextLink>
                  </Button>
                </div>

                {/* SIGNATURE FOOTNOTE CLAUSE (design.md §5.2) */}
                <div className="border-t border-basalt-800/80 pt-6 text-caption text-basalt-400 leading-relaxed font-mono">
                  <strong>Small print:</strong> This is an indicative range, not a quotation. A real quote needs a site visit and structural drawings. We&rsquo;ve never quoted more than 8% above our estimate range.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 5-STEP QUESTIONNAIRE CONSULTATION FLOW (design.md §5.2)
  return (
    <div className="flex flex-col bg-bg">
      {/* CONSULTATION HERO */}
      <section className="border-b border-border bg-bg-surface py-12 md:py-16">
        <div className="container-narrow">
          <DatumLine label="GUIDED COST CONSULTATION" className="mb-4" />
          <Display as="h1" size="xxl" className="tracking-tight">
            Calculate your construction budget in 2 minutes.
          </Display>
          <Body size="lg" className="mt-4 text-fg-secondary max-w-xl">
            Deterministic rate engine based on published 2026 Pune benchmarks. Ungated range output before contact details are requested.
          </Body>
        </div>
      </section>

      {/* 5-STEP QUESTIONNAIRE CONTAINER */}
      <section className="py-12 md:py-20">
        <div className="container-narrow flex flex-col gap-8">
          {/* Progress Rule (5 segments) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-caption font-mono text-fg-muted">
              <span>STEP 0{step} OF 05</span>
              <span>
                {step === 1 && "Project Type"}
                {step === 2 && "Locality & City"}
                {step === 3 && "Area & Floors"}
                {step === 4 && "Specification Tier"}
                {step === 5 && "Add-ons & Options"}
              </span>
            </div>
            <div className="flex h-2.5 w-full gap-2 overflow-hidden rounded-full bg-basalt-100 dark:bg-basalt-800">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-full flex-1 transition-colors ${
                    s <= step ? "bg-brass-500" : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="rounded border border-rose-500/20 bg-rose-500/10 p-4 text-body-sm text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          <div className="rounded-md bg-bg p-6 md:p-10 hairline flex flex-col gap-8 border border-border">
            {/* STEP 1: PROJECT TYPE (Large Radio Cards) */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <Label className="text-brass-600 dark:text-brass-400 block mb-1">STEP 01</Label>
                  <Heading as="h2" size="lg">
                    What are you planning to build or renovate?
                  </Heading>
                </div>

                <div className="flex flex-col gap-4">
                  {PROJECT_TYPES.map((type) => {
                    const active = state.projectType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => updateState({ projectType: type.id })}
                        className={`flex items-center gap-5 rounded-md p-5 text-left hairline transition-colors ${
                          active
                            ? "bg-brass-500/10 border-brass-500 ring-2 ring-brass-500"
                            : "hover:bg-basalt-100 dark:hover:bg-basalt-850"
                        }`}
                      >
                        <div className={`flex size-12 items-center justify-center rounded-full ${
                          active ? "bg-brass-500 text-basalt-950" : "bg-basalt-100 dark:bg-basalt-800 text-fg"
                        }`}>
                          <Icon icon={type.icon} size={24} />
                        </div>
                        <div className="flex-1">
                          <span className="block font-sans text-body-lg font-medium text-fg">
                            {type.label}
                          </span>
                          <span className="block font-sans text-body-sm text-fg-secondary">
                            {type.desc}
                          </span>
                        </div>
                        {active && <Icon icon={CheckCircle2} size={24} className="text-brass-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: LOCALITY & CITY */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <Label className="text-brass-600 dark:text-brass-400 block mb-1">STEP 02</Label>
                  <Heading as="h2" size="lg">
                    Where is your project located?
                  </Heading>
                  <Body size="md" className="mt-1 text-fg-secondary">
                    Locality drives the regional cost multiplier (R-11).
                  </Body>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <Label className="block mb-2">CITY</Label>
                    <Select
                      value={state.city}
                      onChange={(e) => updateState({ city: e.target.value })}
                      className="w-full h-14 text-body-lg"
                    >
                      <option value="Pune">Pune</option>
                      <option value="Mumbai">Mumbai / MMR</option>
                      <option value="Nashik">Nashik</option>
                      <option value="Nagpur">Nagpur</option>
                    </Select>
                  </div>

                  <div>
                    <Label className="block mb-2">LOCALITY / NEIGHBOURHOOD</Label>
                    <Select
                      value={state.locality}
                      onChange={(e) => updateState({ locality: e.target.value })}
                      className="w-full h-14 text-body-lg"
                    >
                      {LOCALITIES.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                      <option value="Other">Other / Outside primary list</option>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: AREA, FLOORS & SITE CONDITION (Paired input + live sq m) */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <Label className="text-brass-600 dark:text-brass-400 block mb-1">STEP 03</Label>
                  <Heading as="h2" size="lg">
                    How big is your property footprint?
                  </Heading>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <Label>BUILT-UP AREA (SQ FT)</Label>
                      <span className="font-mono text-caption text-brass-600 dark:text-brass-400">
                        ≈ {Math.round(state.area / 10.764)} m²
                      </span>
                    </div>

                    <Input
                      type="number"
                      value={state.area}
                      onChange={(e) => updateState({ area: Number(e.target.value) })}
                      placeholder="2400"
                      className="w-full font-mono text-display-md h-16 text-brass-600 dark:text-brass-400"
                    />

                    {/* Area Slider */}
                    <input
                      type="range"
                      min={500}
                      max={10000}
                      step={100}
                      value={state.area}
                      onChange={(e) => updateState({ area: Number(e.target.value) })}
                      className="w-full mt-4 accent-brass-500 cursor-pointer"
                    />
                    <div className="flex justify-between font-mono text-caption text-fg-muted mt-1">
                      <span>500 sq ft</span>
                      <span>5,000 sq ft</span>
                      <span>10,000 sq ft</span>
                    </div>
                  </div>

                  <div>
                    <Label className="block mb-2">NUMBER OF FLOORS</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => updateState({ floors: f })}
                          className={`rounded-md p-4 text-center font-mono text-body-md transition-colors hairline ${
                            state.floors === f
                              ? "bg-brass-500 text-basalt-950 font-bold"
                              : "bg-basalt-100 hover:bg-basalt-200 dark:bg-basalt-800 text-fg"
                          }`}
                        >
                          G + {f - 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="block mb-2">SITE ACCESS & STRATA CONDITION</Label>
                    <Select
                      value={state.siteCondition}
                      onChange={(e) =>
                        updateState({
                          siteCondition: e.target
                            .value as EstimatorState["siteCondition"],
                        })
                      }
                      className="w-full h-14"
                    >
                      <option value="standard">Standard Level Site (1.00x)</option>
                      <option value="steep-slope">Steep Slope / Hilly Plot (1.08x)</option>
                      <option value="narrow-access">Narrow Access Lane &lt; 15ft (1.05x)</option>
                      <option value="rocky-strata">Hard Basalt Rock Strata (1.06x)</option>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SPECIFICATION TIER CARDS WITH BRANDS */}
            {step === 4 && (
              <div className="flex flex-col gap-6">
                <div>
                  <Label className="text-brass-600 dark:text-brass-400 block mb-1">STEP 04</Label>
                  <Heading as="h2" size="lg">
                    What standard of materials & finishes?
                  </Heading>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {TIER_SPECS.map((tier) => {
                    const active = state.tier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => updateState({ tier: tier.id as EstimatorState["tier"] })}
                        className={`relative flex flex-col rounded-md p-6 text-left hairline transition-colors ${
                          active
                            ? "bg-brass-500/10 border-brass-500 ring-2 ring-brass-500"
                            : "hover:bg-basalt-100 dark:hover:bg-basalt-850"
                        }`}
                      >
                        {tier.recommended && (
                          <span className="absolute -top-3 left-4 rounded-full bg-brass-500 px-3 py-0.5 font-mono text-caption text-basalt-950 font-bold">
                            RECOMMENDED
                          </span>
                        )}

                        <Label className={active ? "text-brass-600 dark:text-brass-400" : "text-fg-muted"}>
                          {tier.label}
                        </Label>

                        <Heading as="h3" size="md" className="mt-2">
                          {tier.name}
                        </Heading>

                        <Body size="sm" className="mt-2 text-fg-secondary">
                          {tier.desc}
                        </Body>

                        <div className="my-4 border-t border-border" />

                        <ul className="flex flex-col gap-2.5 flex-1">
                          {tier.specs.map((spec) => (
                            <li key={spec} className="flex items-start gap-2 font-sans text-body-sm text-fg">
                              <span className="mt-1 size-1.5 rounded-full bg-brass-500 shrink-0" />
                              {spec}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: ADDONS & SPECIAL OPTIONS (Live Delta Chips) */}
            {step === 5 && (
              <div className="flex flex-col gap-6">
                <div>
                  <Label className="text-brass-600 dark:text-brass-400 block mb-1">STEP 05</Label>
                  <Heading as="h2" size="lg">
                    Any specific add-ons or equipment? (Optional)
                  </Heading>
                  <Body size="sm" className="mt-1 text-fg-secondary">
                    Each chip visibly adds to the estimate in real time.
                  </Body>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {ADDON_OPTIONS.map((addon) => {
                    const active = state.addons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`flex items-center justify-between rounded-md p-5 text-left hairline transition-colors ${
                          active
                            ? "bg-brass-500/10 border-brass-500 ring-2 ring-brass-500"
                            : "hover:bg-basalt-100 dark:hover:bg-basalt-850"
                        }`}
                      >
                        <div>
                          <span className="block font-sans text-body-md font-medium text-fg">
                            {addon.label}
                          </span>
                          <span className="block font-mono text-caption text-brass-600 dark:text-brass-400 mt-0.5">
                            + ₹{(addon.cost / 1000).toLocaleString("en-IN")}k
                          </span>
                        </div>
                        {active ? (
                          <Icon icon={CheckCircle2} size={24} className="text-brass-500" />
                        ) : (
                          <div className="size-6 rounded-full border border-border" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              {step > 1 ? (
                <Button type="button" variant="secondary" size="lg" onClick={handleBack}>
                  <Icon icon={ArrowLeft} size={20} className="mr-2" />
                  Back
                </Button>
              ) : <div />}

              {step < 5 ? (
                <Button type="button" variant="primary" size="lg" onClick={handleNext}>
                  Continue →
                </Button>
              ) : (
                <Button type="button" variant="accent" size="lg" onClick={computeFinalEstimate} disabled={loading}>
                  {loading ? "Computing Rate Engine..." : "Calculate Cost Range →"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function EstimatorPage() {
  return (
    <Suspense fallback={<div className="container-narrow py-24 text-center font-mono">Loading Estimator...</div>}>
      <EstimatorFlow />
    </Suspense>
  );
}
