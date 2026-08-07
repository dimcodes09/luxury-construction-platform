import NextLink from "next/link";
import { ArrowRight } from "lucide-react";

import { Section, SectionHeader } from "@/components/sections/section-header";
import { Icon } from "@/components/foundation/icon";
import { Heading, Body, Datum } from "@/components/foundation/typography";

/* design.md §4.1 S08 — "Process, compressed."
 *
 * Five steps with durations. §4.1 specifies a GSAP horizontal pin-scroll on
 * desktop and a vertical timeline on mobile.
 *
 * MOTION IS NOT BUILT YET (design-process.md Step 8 puts it last, deliberately:
 * "motion added during layout hides layout problems and makes you tolerate
 * structures you'd otherwise fix"). So this ships as the static structure the
 * motion pass will later pin: a horizontal rail from lg, a vertical timeline
 * below it. §4.17 is explicit that the mobile form is a vertical timeline and
 * NOT horizontal scroll — "pinned horizontal scroll on touch is a usability
 * failure" — so the mobile layout here is final, not a placeholder.
 */

const STEPS = [
  { number: "01", title: "Consult", duration: "1 week", body: "We walk your plot or flat and photograph everything." },
  { number: "02", title: "Design", duration: "3–6 weeks", body: "Plans, elevations and a line-by-line bill of quantities." },
  { number: "03", title: "Estimate", duration: "1 week", body: "A range with its assumptions, then a fixed contract sum." },
  { number: "04", title: "Build", duration: "7–13 months", body: "Weekly photographs, including the work we then cover up." },
  { number: "05", title: "Handover", duration: "2 weeks", body: "Snagging, as-built drawings, and every warranty document." },
] as const;

export function ProcessStrip() {
  return (
    <Section rhythm="standard" className="bg-basalt-050 dark:bg-basalt-950">
      <SectionHeader
        index="06"
        label="Process"
        title="Five phases. Thirty-eight steps. Nine payment milestones."
        action={
          <NextLink
            href="/process"
            className="inline-flex items-center gap-2 font-sans text-body-md text-brass-600 underline-wipe focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-brass-300"
          >
            Read the process
            <Icon icon={ArrowRight} size={20} />
          </NextLink>
        }
      />

      {/* §4.17 — vertical timeline on mobile, with a persistent brass rule
       * (§3.18). Becomes a horizontal 5-up rail from lg. */}
      {/* §7.7 S08: desktop is a pinned horizontal scrub, mobile is a
        * vertical M1 stagger of 60ms. The pinned version is deliberately NOT
        * wired here — §4.17 makes the vertical timeline the final mobile
        * layout, and pinning a 5-step strip that already fits the viewport on
        * desktop adds scroll distance without adding information. */}
      <ol
        data-motion="M1"
        data-motion-children=":scope > li"
        data-motion-stagger="60"
        className="mt-12 flex flex-col lg:grid lg:grid-cols-5 lg:gap-6"
      >
        {STEPS.map((step, index) => (
          <li
            key={step.number}
            className="relative flex gap-6 pb-10 last:pb-0 lg:block lg:pb-0"
          >
            {/* Mobile: the vertical rule running through the numbers. */}
            <div className="relative flex flex-col items-center lg:hidden">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-accent bg-canvas font-mono text-datum text-brass-600 dark:text-brass-300">
                {step.number}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="mt-2 w-px flex-1 bg-accent opacity-40"
                />
              ) : null}
            </div>

            {/* Desktop: the horizontal rule above each step. */}
            <div className="hidden lg:block">
              <div className="datum-rule bg-accent" />
              <Datum className="mt-4 block text-brass-600 dark:text-brass-300">
                {step.number}
              </Datum>
            </div>

            <div className="min-w-0 flex-1 lg:mt-3">
              <Heading as="h3" size="sm">
                {step.title}
              </Heading>
              {/* §3.18 — the duration chip is part of the trust payload. */}
              <p className="mt-1 font-mono text-datum uppercase tabular text-fg-muted">
                {step.duration}
              </p>
              <Body size="sm" className="mt-3">
                {step.body}
              </Body>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
