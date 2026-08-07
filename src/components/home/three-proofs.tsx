import NextLink from "next/link";
import { ArrowRight, FileText, Receipt, ScanEye } from "lucide-react";

import { Section, SectionHeader } from "@/components/sections/section-header";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/foundation/icon";
import { Heading, Body } from "@/components/foundation/typography";

/* design.md §4.1 S03 — "The three proofs."
 *
 * "Each proof is a CHECKABLE CLAIM. The section converts abstract trust into
 * three verifiable artefacts — this is the entire brand strategy compressed
 * into one viewport."
 *
 * So every card must link somewhere the claim can actually be checked. A proof
 * card without a destination is just a boast, which §1.3 explicitly rejects
 * ("numbers over adjectives", "every claim carries a number or a link to
 * proof" — §10.1).
 */

const PROOFS = [
  {
    icon: Receipt,
    title: "A published price",
    body: "Our rate card is on this site. Run the estimator and see the same ranges we quote from.",
    href: "/estimate",
    linkLabel: "See the range",
  },
  {
    icon: FileText,
    title: "A published process",
    body: "38 steps, 9 payment milestones, one page. Read it before you call us.",
    href: "/process",
    linkLabel: "Read the process",
  },
  {
    icon: ScanEye,
    title: "A published record",
    body: "We photograph waterproofing, conduit and steel before we close it. Every project.",
    href: "/work",
    linkLabel: "See our work",
  },
] as const;

export function ThreeProofs() {
  return (
    <Section rhythm="standard">
      <SectionHeader
        index="01"
        label="Why us"
        title="Three things you can check before you call."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PROOFS.map((proof) => (
          <Card
            key={proof.title}
            variant="bordered"
            interactive
            padding="default"
            className="flex flex-col"
          >
            <Icon
              icon={proof.icon}
              size={32}
              className="text-brass-600 dark:text-brass-300"
            />

            <Heading as="h3" size="md" className="mt-6">
              {proof.title}
            </Heading>

            <Body size="md" className="mt-3 flex-1">
              {proof.body}
            </Body>

            {/* §10.3 — the nav lexicon. `Learn more` and `Explore` are banned. */}
            <NextLink
              href={proof.href}
              className="mt-6 inline-flex items-center gap-2 font-sans text-body-sm text-brass-600 underline-wipe focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-brass-300"
            >
              {proof.linkLabel}
              <Icon icon={ArrowRight} size={16} />
            </NextLink>
          </Card>
        ))}
      </div>
    </Section>
  );
}
