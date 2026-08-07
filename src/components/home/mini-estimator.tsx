"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Icon } from "@/components/foundation/icon";
import { Display, Body, Datum } from "@/components/foundation/typography";

/* design.md §4.1 S07 — "The estimator invitation."
 *
 * FR-HOME-05: "An inline 3-field mini-estimator carries its state into
 * /estimate VIA URL PARAMETERS."
 *
 * §4.1 on why inline rather than a link: "starting the interaction in place
 * raises completion dramatically compared to a link to a tool page. Three
 * fields is low enough friction to be an impulse action. THIS IS THE PRIMARY
 * CONVERSION MECHANISM OF THE HOMEPAGE."
 *
 * Surface is blueprint-700 deliberately — §2.1.1 reserves Blueprint for the
 * technical layer, so the colour itself signals "a tool, not a pitch". §2.1.5
 * permits full-bleed Blueprint here by name: the homepage estimator band is one
 * of the listed exceptions to the 15% cap.
 *
 * This is the only client component on the homepage. Everything else is a
 * Server Component, per the CLAUDE.md default.
 */

const PROJECT_TYPES = [
  { value: "new-construction", label: "New construction" },
  { value: "renovation", label: "Renovation" },
  { value: "interiors", label: "Interiors" },
  { value: "commercial", label: "Commercial" },
] as const;

const CITIES = ["Pune", "Mumbai", "Nashik", "Nagpur"] as const;

export function MiniEstimator() {
  const router = useRouter();
  const [projectType, setProjectType] = useState<string>("new-construction");
  const [area, setArea] = useState<string>("");
  const [city, setCity] = useState<string>("Pune");

  /* State travels as plain query params (FR-EST-11), so a shared link is
   * inspectable and the estimator can resume without re-entry. */
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ projectType, city });
    if (area) params.set("area", area);
    params.set("step", "1");
    router.push(`/estimate?${params.toString()}`);
  };

  return (
    <section className="bg-blueprint-700 py-section">
      <div className="container-narrow">
        <Datum className="block text-blueprint-300">05 — Estimate</Datum>

        <Display as="h2" size="lg" className="mt-4 text-basalt-050">
          What will it cost?
        </Display>

        <Body size="lg" className="mt-4 text-blueprint-100">
          Three fields. You get a range, the breakdown behind it, and the full
          list of what it excludes — before we ask for anything.
        </Body>

        <form onSubmit={handleSubmit} className="mt-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <Field id="mini-type" label="Project type">
              <Select
                id="mini-type"
                value={projectType}
                onChange={(event) => setProjectType(event.target.value)}
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="mini-area" label="Built-up area">
              <Input
                id="mini-area"
                inputMode="numeric"
                // §3.3 — the placeholder gives an EXAMPLE, never repeats the label.
                placeholder="e.g. 2400"
                value={area}
                onChange={(event) =>
                  setArea(event.target.value.replace(/[^\d]/g, ""))
                }
                suffix="sq ft"
              />
            </Field>

            <Field id="mini-city" label="City">
              <Select
                id="mini-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              >
                {CITIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* §10.3 rung 3 — "See the range" is approved.
             * "Try our calculator" is banned. */}
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full sm:w-auto"
              iconTrailing={<Icon icon={ArrowRight} size={20} />}
            >
              See the range
            </Button>

            {/* §0.5 — the number is never gated. Saying so up front is the
             * whole trust play; hiding it is "the most common and most damaging
             * mistake in this category". */}
            <p className="font-sans text-caption text-blueprint-300">
              No email needed. The number comes first.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
