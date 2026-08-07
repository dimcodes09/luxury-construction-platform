"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Building,
  Home,
  RefreshCw,
  Sparkles,
  Layers,
  Map,
  Check,
  Send,
} from "lucide-react";

import { Display, Heading, Body, Label } from "@/components/foundation/typography";
import { DatumLine } from "@/components/foundation/datum-line";
import { Icon } from "@/components/foundation/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step1Data = { projectType: string };
type Step2Data = { locality: string; area: string };
type Step3Data = { timeline: string; budgetBand: string };
type Step4Data = { name: string; phone: string; email: string; whatsappOptIn: boolean; message: string };

type FormData = Step1Data & Step2Data & Step3Data & Step4Data;

const INITIAL_FORM: FormData = {
  projectType: "new-construction",
  locality: "Baner",
  area: "2400",
  timeline: "1-3-months",
  budgetBand: "50L-1Cr",
  name: "",
  phone: "",
  email: "",
  whatsappOptIn: true,
  message: "",
};

const PROJECT_TYPE_OPTIONS = [
  { id: "new-construction", label: "New House Construction", desc: "Turnkey structural & finishing build", icon: Home },
  { id: "renovation", label: "Home Renovation", desc: "Re-architecting existing space & services", icon: RefreshCw },
  { id: "interiors", label: "Interior Design", desc: "Custom joinery, lighting & room styling", icon: Sparkles },
  { id: "commercial", label: "Commercial Service", desc: "Office fit-outs & retail space design", icon: Building },
  { id: "single-service", label: "Single Service", desc: "Waterproofing, painting or modular kitchen", icon: Layers },
];

const TIMELINE_CHIPS = [
  { id: "ready-now", label: "Ready immediately" },
  { id: "1-3-months", label: "1 – 3 months" },
  { id: "3-6-months", label: "3 – 6 months" },
  { id: "just-researching", label: "Just researching" },
];

const BUDGET_CHIPS = [
  { id: "under-25L", label: "Under ₹25 Lakhs" },
  { id: "25-50L", label: "₹25L – ₹50 Lakhs" },
  { id: "50L-1Cr", label: "₹50L – ₹1 Crore" },
  { id: "1Cr+", label: "₹1 Crore +" },
  { id: "unsure", label: "Not sure yet" },
];

export default function ContactPage() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Restore sessionStorage on mount (design.md §4.8)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("zyvora_contact_form");
      if (saved) {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {}
  }, []);

  // Update sessionStorage on state change
  const updateForm = (patch: Partial<FormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch };
      try {
        sessionStorage.setItem("zyvora_contact_form", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 2 && !formData.locality.trim()) {
      setErrorMsg("Please enter your project locality.");
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          area: formData.area ? Number(formData.area) : undefined,
          source: { page: "/contact", referrer: typeof document !== "undefined" ? document.referrer : "" },
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error?.message || "Failed to submit lead. Please try again.");
      } else {
        setSubmittedLeadId(data.leadId);
        sessionStorage.removeItem("zyvora_contact_form");
      }
    } catch (err) {
      setErrorMsg("Network error. Please check your connection or contact us via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS STATE (Dedicated Page View per design.md §4.8)
  if (submittedLeadId) {
    return (
      <div className="container-main py-16 md:py-24 max-w-3xl">
        <div className="rounded-md bg-bg p-8 md:p-12 hairline text-center flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Icon icon={CheckCircle2} size={32} />
          </div>

          <DatumLine label="SUBMISSION RECEIVED" className="mt-6 mb-2" />
          <Heading as="h1" size="xl">
            Enquiry Confirmed — Thank You, {formData.name}
          </Heading>

          <Body size="md" className="mt-4 text-fg-secondary max-w-xl">
            We have received your {formData.projectType.replace("-", " ")} brief for{" "}
            <strong>{formData.locality}</strong>. Rahul, our Lead Site Engineer, will call you within one working day.
          </Body>

          <div className="mt-8 rounded-md bg-basalt-100/50 dark:bg-basalt-850 p-6 text-left w-full max-w-md hairline">
            <Label className="text-brass-500">WHAT WE RECEIVED</Label>
            <ul className="mt-3 flex flex-col gap-2 font-mono text-body-sm text-fg">
              <li>• Location: {formData.locality}</li>
              <li>• Estimated Area: {formData.area || "Not specified"} sq ft</li>
              <li>• Timeline: {formData.timeline}</li>
              <li>• Budget Band: {formData.budgetBand}</li>
              <li>• Phone: {formData.phone}</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="primary" size="lg">
              <NextLink href={`/estimate?type=${formData.projectType}`}>
                Run the estimator while you wait →
              </NextLink>
            </Button>
            <a
              href={`https://wa.me/919876543210?text=Hi%20Rahul,%20I%20just%20submitted%20an%20enquiry%20for%20${encodeURIComponent(
                formData.locality,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-6 py-3 font-sans text-body-md font-medium text-white hover:brightness-110"
            >
              <Icon icon={MessageSquare} size={20} />
              WhatsApp Rahul Directly
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="border-b border-border bg-bg-surface py-12 md:py-16">
        <div className="container-main">
          <DatumLine label="GET IN TOUCH" className="mb-4" />
          <Display as="h1" size="xxl" className="tracking-tight">
            Talk to an engineer. Not a call centre.
          </Display>
          <Body size="lg" className="mt-4 text-fg-secondary max-w-2xl">
            Complete our 4-step progressive form or contact our site team directly. We collect contact details last and reply within one working day.
          </Body>
        </div>
      </section>

      {/* MAIN TWO-COLUMN CONTENT */}
      <section className="py-12 md:py-20">
        <div className="container-main">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* LEFT COLUMN: 4-STEP PROGRESSIVE FORM */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Progress Rule (4 segments) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-caption font-mono text-fg-muted">
                  <span>STEP 0{step} OF 04</span>
                  <span>
                    {step === 1 && "Project Type"}
                    {step === 2 && "Location & Area"}
                    {step === 3 && "Timeline & Budget"}
                    {step === 4 && "Contact Details"}
                  </span>
                </div>
                <div className="flex h-2 w-full gap-2 overflow-hidden rounded-full bg-basalt-100 dark:bg-basalt-800">
                  {[1, 2, 3, 4].map((s) => (
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

              <form onSubmit={handleSubmit} className="flex flex-col gap-8 rounded-md bg-bg p-6 md:p-8 hairline">
                {/* STEP 1: WHAT ARE YOU PLANNING? */}
                {step === 1 && (
                  <div className="flex flex-col gap-6">
                    <Heading as="h2" size="md">
                      What are you planning to build or renovate?
                    </Heading>
                    <div className="flex flex-col gap-3">
                      {PROJECT_TYPE_OPTIONS.map((opt) => {
                        const active = formData.projectType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateForm({ projectType: opt.id })}
                            className={`flex items-center gap-4 rounded-md p-4 text-left hairline transition-colors ${
                              active
                                ? "bg-brass-500/10 border-brass-500 ring-1 ring-brass-500"
                                : "hover:bg-basalt-100 dark:hover:bg-basalt-800"
                            }`}
                          >
                            <Icon
                              icon={opt.icon}
                              size={24}
                              className={active ? "text-brass-500" : "text-fg-muted"}
                            />
                            <div className="flex-1">
                              <span className="block font-sans text-body-md font-medium text-fg">
                                {opt.label}
                              </span>
                              <span className="block font-sans text-caption text-fg-muted">
                                {opt.desc}
                              </span>
                            </div>
                            {active && <Icon icon={Check} size={20} className="text-brass-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2: WHERE & HOW BIG? */}
                {step === 2 && (
                  <div className="flex flex-col gap-6">
                    <Heading as="h2" size="md">
                      Where is your plot or property located?
                    </Heading>

                    <div className="flex flex-col gap-4">
                      <div>
                        <Label className="block mb-2">LOCALITY / NEIGHBOURHOOD</Label>
                        <Input
                          value={formData.locality}
                          onChange={(e) => updateForm({ locality: e.target.value })}
                          placeholder="e.g. Baner, Wakad, Kothrud, Kalyani Nagar"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2">ESTIMATED BUILT-UP AREA (SQ FT)</Label>
                        <Input
                          type="number"
                          value={formData.area}
                          onChange={(e) => updateForm({ area: e.target.value })}
                          placeholder="e.g. 2400"
                          className="w-full font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: TIMELINE & BUDGET */}
                {step === 3 && (
                  <div className="flex flex-col gap-6">
                    <Heading as="h2" size="md">
                      What is your timeline and target budget?
                    </Heading>

                    <div className="flex flex-col gap-4">
                      <div>
                        <Label className="block mb-2">EXPECTED TIMELINE</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {TIMELINE_CHIPS.map((chip) => (
                            <button
                              key={chip.id}
                              type="button"
                              onClick={() => updateForm({ timeline: chip.id })}
                              className={`rounded-md p-3 font-sans text-body-sm transition-colors hairline ${
                                formData.timeline === chip.id
                                  ? "bg-brass-500 text-basalt-950 font-medium"
                                  : "bg-basalt-100 hover:bg-basalt-200 dark:bg-basalt-800 dark:hover:bg-basalt-750 text-fg"
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label className="block mb-2">ESTIMATED BUDGET BAND</Label>
                        <div className="flex flex-wrap gap-3">
                          {BUDGET_CHIPS.map((chip) => (
                            <button
                              key={chip.id}
                              type="button"
                              onClick={() => updateForm({ budgetBand: chip.id })}
                              className={`rounded-md px-4 py-2.5 font-sans text-body-sm transition-colors hairline ${
                                formData.budgetBand === chip.id
                                  ? "bg-brass-500 text-basalt-950 font-medium"
                                  : "bg-basalt-100 hover:bg-basalt-200 dark:bg-basalt-800 dark:hover:bg-basalt-750 text-fg"
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: CONTACT DETAILS (LAST) */}
                {step === 4 && (
                  <div className="flex flex-col gap-6">
                    <Heading as="h2" size="md">
                      How should our site engineer contact you?
                    </Heading>

                    <div className="flex flex-col gap-4">
                      <div>
                        <Label className="block mb-2">YOUR FULL NAME *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => updateForm({ name: e.target.value })}
                          placeholder="e.g. Vikram Sharma"
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2">PHONE NUMBER *</Label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateForm({ phone: e.target.value })}
                          placeholder="10-digit mobile number"
                          required
                          className="w-full font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="whatsapp"
                          checked={formData.whatsappOptIn}
                          onChange={(e) => updateForm({ whatsappOptIn: e.target.checked })}
                          className="h-4 w-4 rounded border-border text-brass-500 focus:ring-brass-500"
                        />
                        <label htmlFor="whatsapp" className="font-sans text-body-sm text-fg">
                          Receive updates & project specs via WhatsApp (recommended)
                        </label>
                      </div>

                      <div>
                        <Label className="block mb-2">EMAIL ADDRESS (OPTIONAL)</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateForm({ email: e.target.value })}
                          placeholder="To receive formal PDF estimates"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2">ANY SPECIFIC NOTES OR QUESTIONS?</Label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => updateForm({ message: e.target.value })}
                          placeholder="Tell us about your plot size, preferred materials, or timeline constraints..."
                          rows={3}
                          className="w-full rounded-md border border-border bg-bg px-3 py-2 font-sans text-body-sm focus:outline-none focus:ring-2 focus:ring-brass-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* NAVIGATION BUTTONS */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-6">
                  {step > 1 ? (
                    <Button type="button" variant="secondary" onClick={handleBack}>
                      <Icon icon={ArrowLeft} size={16} className="mr-2" />
                      Back
                    </Button>
                  ) : <div />}

                  {step < 4 ? (
                    <Button type="button" variant="primary" onClick={handleNext}>
                      Continue →
                    </Button>
                  ) : (
                    <Button type="submit" variant="accent" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Enquiry"}
                      <Icon icon={Send} size={16} className="ml-2" />
                    </Button>
                  )}
                </div>
              </form>

              <Body size="sm" className="text-center text-fg-muted font-mono">
                We reply within one working day. Median response so far: 3h 20m.
              </Body>
            </div>

            {/* RIGHT COLUMN: ALTERNATIVES & OFFICE INFO */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {/* Direct Phone Call */}
              <div className="rounded-md bg-bg p-6 hairline flex flex-col gap-4">
                <Label className="text-brass-500">DIRECT PHONE LINE</Label>
                <a
                  href="tel:+919876543210"
                  className="font-serif text-heading-lg text-fg hover:text-brass-600 transition-colors"
                >
                  +91 98765 43210
                </a>
                <Body size="sm" className="text-fg-secondary">
                  Mon – Sat, 9:00 AM – 7:00 PM IST. Direct to site engineering desk.
                </Body>
              </div>

              {/* Direct WhatsApp with Team Member */}
              <div className="rounded-md bg-emerald-500/5 border border-emerald-500/20 p-6 flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-emerald-500">
                  <Image src="/dev/team-1.png" alt="Rahul, Site Engineer" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <span className="block font-mono text-caption text-emerald-600 dark:text-emerald-400">
                    TALK TO RAHUL
                  </span>
                  <span className="block font-sans text-body-md font-medium text-fg">
                    Senior Project Engineer
                  </span>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 font-sans text-body-sm text-emerald-600 dark:text-emerald-400 underline-wipe"
                  >
                    <Icon icon={MessageSquare} size={16} />
                    WhatsApp Rahul directly →
                  </a>
                </div>
              </div>

              {/* Office Address & Embedded Map Placeholder */}
              <div className="rounded-md bg-bg p-6 hairline flex flex-col gap-4">
                <Label className="text-brass-500">PUNE OFFICE & EXPERIENCE CENTRE</Label>
                <div className="flex items-start gap-3">
                  <Icon icon={MapPin} size={20} className="mt-1 text-fg-muted shrink-0" />
                  <Body size="sm" className="text-fg">
                    ZYVORA Studio, 4th Floor, Apex Towers, Baner Road, Baner, Pune, Maharashtra 411045
                  </Body>
                </div>
                <div className="flex items-start gap-3">
                  <Icon icon={Clock} size={20} className="mt-1 text-fg-muted shrink-0" />
                  <Body size="sm" className="text-fg">
                    Visiting hours: Mon – Sat 10:00 AM – 6:00 PM (Prior appointment recommended)
                  </Body>
                </div>

                {/* Map Placeholder with Click-to-Load */}
                <div className="relative mt-2 aspect-16/9 w-full overflow-hidden rounded-md bg-basalt-100 dark:bg-basalt-800 hairline flex items-center justify-center">
                  {!mapLoaded ? (
                    <button
                      type="button"
                      onClick={() => setMapLoaded(true)}
                      className="flex flex-col items-center gap-2 text-fg hover:text-brass-500 transition-colors p-4 text-center"
                    >
                      <Icon icon={Map} size={32} />
                      <span className="font-sans text-body-sm font-medium">Click to load interactive map</span>
                      <span className="font-mono text-caption text-fg-muted">(Preserves page speed)</span>
                    </button>
                  ) : (
                    <iframe
                      title="Office Location Map"
                      src="https://maps.google.com/maps?q=Baner%20Road,%20Pune&t=&z=14&ie=UTF8&iwloc=&output=embed"
                      className="h-full w-full border-0"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>

              {/* Free Site Visit Box */}
              <div className="rounded-md bg-basalt-900 p-6 text-basalt-050 hairline">
                <Label className="text-brass-400">FREE SITE VISIT</Label>
                <Heading as="h3" size="sm" className="mt-2 text-basalt-100">
                  Prefer we inspect your plot or flat in person?
                </Heading>
                <Body size="sm" className="mt-2 text-basalt-300">
                  We measure soil, verify site access, check electrical loads, and review society NOC rules at zero charge.
                </Body>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
