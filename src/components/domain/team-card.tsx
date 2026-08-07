import Image from "next/image";

import { cn } from "@/lib/utils";
import { Heading, Body, Datum } from "@/components/foundation/typography";

/* design.md §0.7 — the antidote to "They'll vanish mid-project": a team page
 * with FACES AND TENURE, not stock portraits.
 *
 * R-07: "Homeowners want to see the actual team, actual site vehicles, actual
 * local projects. Authenticity removes the uncertainty of hiring a stranger."
 * §0.2 bans stock imagery outright, and implementationplan.md Phase 2 makes
 * "Zero stock photography anywhere" an acceptance criterion.
 *
 * `tenureFrom` (SRS DM-10) is the quiet load-bearing detail — "with us since
 * 2019" answers the vanishing fear far better than a job title does.
 */

export type TeamMember = {
  name: string;
  role: string;
  photo: { src: string; alt: string };
  /** Year they joined, e.g. 2019. Rendered as tenure, not as a date. */
  tenureFrom: number;
  bio?: string;
};

export function TeamCard({
  member,
  className,
}: {
  member: TeamMember;
  className?: string;
}) {
  const years = new Date().getFullYear() - member.tenureFrom;

  return (
    <article className={cn("group w-full", className)}>
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-basalt-100">
        <Image
          src={member.photo.src}
          alt={member.photo.alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          quality={72}
          className="object-cover transition-transform duration-base ease-standard group-hover:scale-103"
        />
      </div>

      <div className="mt-4">
        <Heading as="h3" size="sm">
          {member.name}
        </Heading>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-sans text-caption text-fg-muted">{member.role}</p>
          <span aria-hidden="true" className="h-3 w-px bg-hairline" />
          {/* §1.3 "Precise": real numbers, not rounded marketing figures. */}
          <Datum>
            {years > 0 ? `${years} yrs here` : "Joined this year"}
          </Datum>
        </div>

        {member.bio ? (
          <Body size="sm" className="mt-3" measure={false}>
            {member.bio}
          </Body>
        ) : null}
      </div>
    </article>
  );
}
