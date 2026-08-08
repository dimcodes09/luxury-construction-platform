import { Section } from "@/components/sections/section-header";
import { Display, Body, Heading } from "@/components/foundation/typography";

/* design.md §4.1 S02 — "The problem, named."
 *
 * §4.1: "naming the visitor's fear BEFORE selling anything is the highest-trust
 * opening move available (R-01). It signals we understand them. Almost no
 * competitor does this; they all open with 'Our Services.'"
 *
 * The stated risk is that it sounds negative, and the stated mitigation is that
 * it must resolve WITHIN THE SAME VIEWPORT into our answer. That is why the
 * hairline and the closing line are not a separate section — separating them
 * would leave a visitor on a screen that only names a fear.
 */

export function ProblemStatement() {
  return (
    <Section rhythm="standard" container="narrow" className="bg-basalt-050 dark:bg-basalt-950">
      {/* §7.7 S02: M1, SINGLE BLOCK, NO STAGGER, top 80%. Staggering here
        * would serialise a paragraph that has to land as one thought. */}
      <div
        data-motion="M1"
        data-motion-start="top 80%"
        className="mx-auto max-w-prose text-center"
      >
        <Display as="h2" size="lg" className="mx-auto text-balance">
          Most people building a home are quietly terrified.
        </Display>

        <Body size="lg" className="mx-auto mt-6 text-balance">
          Not of the cost. Of not knowing. Of a number that moves. Of work sealed
          behind plaster before anyone checked it. Of a builder who stops
          answering.
        </Body>

        {/* The turn. §4.1 requires the resolution to sit in the same viewport. */}
        <div className="datum-rule mx-auto mt-10 max-w-24" />

        <Heading as="p" size="md" className="mt-10 text-balance">
          So we built the company around removing the not-knowing.
        </Heading>
      </div>
    </Section>
  );
}
