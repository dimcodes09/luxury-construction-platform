"use client";

import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Hammer,
  Home,
  PaintRoller,
  Sofa,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Icon } from "@/components/foundation/icon";
import {
  Display,
  Heading,
  Body,
  Datum,
  Caption,
} from "@/components/foundation/typography";
import { ENQUIRY_PROMISE } from "@/lib/schemas/enquiry";

/* The five-step cost-estimate enquiry.
 *
 * §3.3 form rules, applied literally:
 *   1. One column, one question per screen (§4.17).
 *   2. Progressive disclosure — never more than 6 fields at once.
 *   3. Contact details LAST (§0.5 rung 5).
 *   7. State what happens next, and when.
 *
 * §4.17: the continue CTA is FIXED TO THE BOTTOM on mobile, not at the end of
 * the scroll — "on a 5-step form, making the user scroll to continue is where
 * abandonment happens."
 *
 * State persists in sessionStorage so an accidental refresh does not wipe a
 * half-written brief, and the step lives in the URL so Back works.
 */

const STORAGE_KEY = "zyvora.enquiry";
const TOTAL_STEPS = 5;

const PROJECT_TYPES = [
  { id: "new-construction", label: "Build a new house", desc: "I have a plot", icon: Home },
  { id: "renovation", label: "Renovate what I have", desc: "It needs work", icon: PaintRoller },
  { id: "interiors", label: "Interiors and fit-out", desc: "Structure is done", icon: Sofa },
  { id: "single-service", label: "One specific job", desc: "Waterproofing, wiring, paint", icon: Hammer },
  { id: "commercial", label: "Commercial space", desc: "Office, shop or clinic", icon: Building2 },
] as const;

const LOCALITIES = [
  "Arera Colony", "Shahpura", "Kolar Road", "Trilanga",
  "Bawadiya Kalan", "Ayodhya Bypass", "MP Nagar", "Bairagarh", "Other",
] as const;

const TIERS = [
  { id: "Essential", label: "Essential", desc: "Sound specification, controlled budget." },
  { id: "Signature", label: "Signature", desc: "Most clients. Better finishes, longer warranties." },
  { id: "Bespoke", label: "Bespoke", desc: "Custom joinery and imported finishes." },
] as const;

const SITE_CONDITIONS = [
  { id: "standard", label: "Level and clear" },
  { id: "sloped", label: "Sloping plot" },
  { id: "black-cotton-soil", label: "Black cotton soil" },
  { id: "rocky-strata", label: "Rocky strata" },
] as const;

const ADDONS = [
  "Solar water heating", "Compound wall", "Borewell",
  "Passenger lift", "Home automation", "Landscaping",
] as const;

const TIMELINES = [
  { id: "ready-now", label: "Ready to start" },
  { id: "1-3-months", label: "In 1–3 months" },
  { id: "3-6-months", label: "In 3–6 months" },
  { id: "6-12-months", label: "In 6–12 months" },
  { id: "just-researching", label: "Just researching" },
] as const;

const BUDGETS = [
  { id: "under-25L", label: "Under ₹25 lakh" },
  { id: "25-50L", label: "₹25–50 lakh" },
  { id: "50L-1Cr", label: "₹50 lakh – 1 crore" },
  { id: "1Cr+", label: "Over ₹1 crore" },
  // FR-LEAD-03 — mandatory. Forcing a guess is a leading cause of abandonment.
  { id: "not-sure", label: "Not sure yet" },
] as const;

type State = {
  projectType: string;
  locality: string;
  city: string;
  area: string;
  floors: string;
  tier: string;
  siteCondition: string;
  addons: string[];
  timeline: string;
  budgetBand: string;
  name: string;
  phone: string;
  email: string;
  whatsappOptIn: boolean;
  message: string;
};

const EMPTY: State = {
  projectType: "", locality: "", city: "Bhopal", area: "", floors: "1",
  tier: "", siteCondition: "standard", addons: [],
  timeline: "", budgetBand: "",
  name: "", phone: "", email: "", whatsappOptIn: true, message: "",
};

export function EnquiryFlow({ phoneE164 }: { phoneE164: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<State>(EMPTY);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const headingRef = useRef<HTMLDivElement>(null);

  /* Restore a half-written brief, then apply anything the homepage
   * mini-estimator carried in on the URL (FR-HOME-05). */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setState((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch {
      // Private mode — the form simply starts empty.
    }

    const type = searchParams.get("projectType");
    const area = searchParams.get("area");
    const city = searchParams.get("city");
    if (type || area || city) {
      setState((prev) => ({
        ...prev,
        projectType: type ?? prev.projectType,
        area: area ?? prev.area,
        city: city ?? prev.city,
      }));
      if (type) setStep(2);
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Nothing to do; persistence is a convenience, not a requirement.
    }
  }, [state]);

  // §9.4 — move focus to the new question so a screen reader announces it.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const canContinue = (() => {
    if (step === 1) return Boolean(state.projectType);
    if (step === 2) return state.locality.trim().length > 1;
    if (step === 3) return Boolean(state.tier);
    if (step === 4) return Boolean(state.timeline) && Boolean(state.budgetBand);
    return state.name.trim().length > 1 && state.phone.trim().length >= 10;
  })();

  const next = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else void submit();
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: state.projectType,
          locality: state.locality,
          city: state.city,
          area: state.area ? Number(state.area) : undefined,
          floors: state.floors ? Number(state.floors) : undefined,
          tier: state.tier || undefined,
          siteCondition: state.siteCondition || undefined,
          addons: state.addons,
          timeline: state.timeline,
          budgetBand: state.budgetBand,
          name: state.name,
          phone: state.phone,
          email: state.email || undefined,
          whatsappOptIn: state.whatsappOptIn,
          message: state.message || undefined,
          source: { page: "/estimate" },
          website: "",
          startedAt: startedAt.current,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        setError(data.error?.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setSubmitted(true);
    } catch {
      setError(
        "We couldn't reach the server. Please call or WhatsApp +91 93998 17681.",
      );
    }
    setSubmitting(false);
  };

  /* §4.8 — "Success state is A PAGE, not a toast: confirms what was received,
   * states who will call and by when." */
  if (submitted) {
    return (
      <section className="py-section-feature">
        <div className="container-narrow">
          <span className="inline-grid size-14 place-items-center rounded-full bg-success-100 text-success-600">
            <Icon icon={Check} size={32} />
          </span>

          <Display as="h1" size="lg" className="mt-8">
            We&rsquo;ve got your brief.
          </Display>

          <Body size="lg" className="mt-6">
            {ENQUIRY_PROMISE} You&rsquo;ll get a costed range, what it includes,
            and the full list of what it excludes.
          </Body>

          <div className="mt-10 hairline rounded-md bg-surface p-6">
            <Datum className="block">What we received</Datum>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Summary label="Project" value={labelFor(PROJECT_TYPES, state.projectType)} />
              <Summary label="Locality" value={`${state.locality}, ${state.city}`} />
              {state.area ? <Summary label="Area" value={`${Number(state.area).toLocaleString("en-IN")} sq ft`} /> : null}
              {state.tier ? <Summary label="Specification" value={state.tier} /> : null}
              <Summary label="Timeline" value={labelFor(TIMELINES, state.timeline)} />
              <Summary label="Budget" value={labelFor(BUDGETS, state.budgetBand)} />
            </dl>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="lg">
              <NextLink href="/work">See our work</NextLink>
            </Button>
            <Button asChild variant="whatsapp" size="lg">
              <a
                href={`https://wa.me/${phoneE164.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
              </a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-section">
      {/* §4.17 — reserve room for the fixed CTA so the last field is reachable. */}
      <div className="container-narrow pb-32 lg:pb-0">
        {/* Progress. §4.17 draws a 5-segment rule, not a percentage bar. */}
        <div className="flex items-baseline justify-between gap-4">
          <Datum>
            Step {String(step).padStart(2, "0")} of {String(TOTAL_STEPS).padStart(2, "0")}
          </Datum>
          <Caption>{["Project", "Where", "Specification", "When", "You"][step - 1]}</Caption>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-2" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-sm transition-colors duration-base ease-standard",
                i < step ? "bg-brass-500" : "bg-hairline",
              )}
            />
          ))}
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-8 rounded-sm border border-danger-600 bg-danger-100 px-4 py-3 font-sans text-body-sm text-danger-600"
          >
            {error}
          </p>
        ) : null}

        <div
          ref={headingRef}
          tabIndex={-1}
          className="mt-10 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {step === 1 ? (
            <Question
              title="What are you planning?"
              hint="Pick the closest. You can add detail at the end."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PROJECT_TYPES.map((type) => (
                  <ChoiceCard
                    key={type.id}
                    selected={state.projectType === type.id}
                    onSelect={() => { set("projectType", type.id); }}
                    icon={type.icon}
                    label={type.label}
                    desc={type.desc}
                  />
                ))}
              </div>
            </Question>
          ) : null}

          {step === 2 ? (
            <Question title="Where is it?" hint="Locality is enough — we work across Bhopal.">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field id="locality" label="Locality">
                  <Select
                    id="locality"
                    value={state.locality}
                    onChange={(e) => set("locality", e.target.value)}
                  >
                    <option value="">Select a locality</option>
                    {LOCALITIES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </Select>
                </Field>

                <Field id="area" label="Built-up area" optional helper="Skip it if you don't know yet.">
                  <Input
                    id="area"
                    inputMode="numeric"
                    placeholder="e.g. 2400"
                    suffix="sq ft"
                    value={state.area}
                    onChange={(e) => set("area", e.target.value.replace(/[^\d]/g, ""))}
                  />
                </Field>

                <Field id="floors" label="Floors" optional>
                  <Select id="floors" value={state.floors} onChange={(e) => set("floors", e.target.value)}>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </Select>
                </Field>

                <Field id="site" label="Plot condition" optional>
                  <Select
                    id="site"
                    value={state.siteCondition}
                    onChange={(e) => set("siteCondition", e.target.value)}
                  >
                    {SITE_CONDITIONS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </Question>
          ) : null}

          {step === 3 ? (
            <Question
              title="How should it be specified?"
              hint="This sets the material grade we quote from. Nothing is committed."
            >
              <div className="flex flex-col gap-3">
                {TIERS.map((tier) => (
                  <ChoiceCard
                    key={tier.id}
                    selected={state.tier === tier.id}
                    onSelect={() => set("tier", tier.id)}
                    label={tier.label}
                    desc={tier.desc}
                  />
                ))}
              </div>

              <fieldset className="mt-10">
                <legend className="font-sans text-body-sm font-medium text-fg">
                  Anything extra? <span className="font-normal text-fg-muted">(optional)</span>
                </legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ADDONS.map((addon) => {
                    const on = state.addons.includes(addon);
                    return (
                      <button
                        key={addon}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          set(
                            "addons",
                            on
                              ? state.addons.filter((a) => a !== addon)
                              : [...state.addons, addon],
                          )
                        }
                        className={cn(
                          "inline-flex min-h-target items-center rounded-sm border px-4 py-2",
                          "font-sans text-body-sm transition-colors duration-fast ease-standard",
                          "focus-visible:outline-2 focus-visible:outline-offset-2",
                          on
                            ? "border-ink-900 bg-ink-900 text-basalt-050"
                            : "border-hairline text-fg-secondary hover:bg-basalt-100",
                        )}
                      >
                        {addon}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </Question>
          ) : null}

          {step === 4 ? (
            <Question title="When, and roughly what budget?" hint="A range is fine. So is not knowing.">
              <fieldset>
                <legend className="font-sans text-body-sm font-medium text-fg">Timeline</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {TIMELINES.map((t) => (
                    <Pill key={t.id} selected={state.timeline === t.id} onSelect={() => set("timeline", t.id)}>
                      {t.label}
                    </Pill>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-10">
                <legend className="font-sans text-body-sm font-medium text-fg">Budget</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <Pill key={b.id} selected={state.budgetBand === b.id} onSelect={() => set("budgetBand", b.id)}>
                      {b.label}
                    </Pill>
                  ))}
                </div>
              </fieldset>
            </Question>
          ) : null}

          {step === 5 ? (
            <Question title="Where do we send it?" hint="Last step. We reply within one working day.">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field id="name" label="Your name">
                  <Input id="name" value={state.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
                </Field>
                <Field id="phone" label="Phone">
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="e.g. 93998 17681"
                    autoComplete="tel"
                    value={state.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-6">
                <Field id="email" label="Email" optional helper="Only if you'd rather we wrote to you.">
                  <Input id="email" type="email" autoComplete="email" value={state.email} onChange={(e) => set("email", e.target.value)} />
                </Field>
              </div>

              <label className="mt-6 flex min-h-target items-start gap-3">
                <input
                  type="checkbox"
                  checked={state.whatsappOptIn}
                  onChange={(e) => set("whatsappOptIn", e.target.checked)}
                  className="mt-1 size-5 accent-ink-900"
                />
                <span className="font-sans text-body-md text-fg">
                  Reply on WhatsApp
                  <span className="mt-0.5 block text-caption text-fg-muted">
                    Usually the fastest way to reach us. Uncheck for a call instead.
                  </span>
                </span>
              </label>

              <div className="mt-6">
                <Field id="message" label="Anything else" optional helper="Drawings, a deadline, a problem you've already hit.">
                  <Textarea id="message" value={state.message} onChange={(e) => set("message", e.target.value)} />
                </Field>
              </div>

              {/* §3.3 rule 7 / §10.2 — what happens next, and when. */}
              <Caption className="mt-6">{ENQUIRY_PROMISE}</Caption>
            </Question>
          ) : null}
        </div>

        {/* Desktop controls sit inline; mobile gets the fixed bar below. */}
        <div className="mt-10 hidden items-center gap-4 lg:flex">
          {step > 1 ? (
            <Button variant="ghost" size="lg" onClick={() => setStep((s) => s - 1)} iconLeading={<Icon icon={ArrowLeft} size={20} />}>
              Back
            </Button>
          ) : null}
          <Button
            variant="accent"
            size="lg"
            disabled={!canContinue || submitting}
            loading={submitting}
            onClick={next}
            iconTrailing={<Icon icon={ArrowRight} size={20} />}
          >
            {step === TOTAL_STEPS ? "Send my brief" : "Continue"}
          </Button>
        </div>
      </div>

      {/* §4.17 — fixed-bottom CTA on mobile. Sits above the sticky CTA bar. */}
      <div className="fixed inset-x-0 bottom-16 z-sticky-cta border-t border-hairline bg-canvas/95 p-4 pb-safe backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          {step > 1 ? (
            <Button variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)} aria-label="Back">
              <Icon icon={ArrowLeft} size={20} />
            </Button>
          ) : null}
          <Button
            variant="accent"
            size="lg"
            className="flex-1"
            disabled={!canContinue || submitting}
            loading={submitting}
            onClick={next}
          >
            {step === TOTAL_STEPS ? "Send my brief" : "Continue"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Question({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Heading as="h1" size="xl">{title}</Heading>
      <Body size="md" className="mt-3">{hint}</Body>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function ChoiceCard({
  selected,
  onSelect,
  icon,
  label,
  desc,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: React.ComponentProps<typeof Icon>["icon"];
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-4 rounded-md border p-5 text-left",
        "transition-colors duration-fast ease-standard",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        selected
          ? "border-ink-900 bg-basalt-100"
          : "border-hairline bg-surface hover:bg-basalt-100",
      )}
    >
      {icon ? (
        <Icon icon={icon} size={24} className={selected ? "text-brass-700" : "text-fg-muted"} />
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block font-sans text-body-md font-medium text-fg">{label}</span>
        <span className="mt-1 block font-sans text-caption text-fg-muted">{desc}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 grid size-5 shrink-0 place-items-center rounded-full border",
          selected ? "border-ink-900 bg-ink-900 text-basalt-050" : "border-hairline",
        )}
      >
        {selected ? <Icon icon={Check} size={16} /> : null}
      </span>
    </button>
  );
}

function Pill({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "inline-flex min-h-target items-center rounded-sm border px-4 py-2",
        "font-sans text-body-sm transition-colors duration-fast ease-standard",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        selected
          ? "border-ink-900 bg-ink-900 text-basalt-050"
          : "border-hairline text-fg-secondary hover:bg-basalt-100",
      )}
    >
      {children}
    </button>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2">
      <dt className="font-sans text-label uppercase text-fg-muted">{label}</dt>
      <dd className="text-right font-sans text-body-sm text-fg">{value}</dd>
    </div>
  );
}

function labelFor(
  options: readonly { id: string; label: string }[],
  id: string,
): string {
  return options.find((o) => o.id === id)?.label ?? id;
}
