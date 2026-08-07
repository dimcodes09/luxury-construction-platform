import { cn } from "@/lib/utils";
import { Datum } from "@/components/foundation/typography";

/* design.md §3.8 zone 3 — the trust band.
 *
 * "Zone 3 is DOING REAL WORK: GSTIN and registration numbers are the cheapest,
 * highest-impact legitimacy signals available and are ABSENT FROM MOST
 * COMPETITOR FOOTERS (R-01)."
 *
 * R-01 is the research finding the whole site is built around: 19% of
 * homeowners postponed work entirely because they did not trust available
 * builders. A registration number is a falsifiable claim; "trusted since 2015"
 * is not — which is exactly why this component only accepts the former.
 *
 * The locality list is also the local-SEO surface (§10.5): each links to a
 * location page, and §NFR-SEO-10 requires those pages to carry genuinely
 * locality-specific content rather than templated duplication.
 */

export type TrustCredential = {
  label: string;
  /** The actual number or value. Rendered in mono — it is a datum, not copy. */
  value: string;
};

export function TrustBar({
  credentials,
  localities,
  localityHref,
  className,
}: {
  credentials: TrustCredential[];
  /** §3.8 — "Serving: {{CITY}} + 6 named localities". */
  localities?: string[];
  localityHref?: (locality: string) => string;
  className?: string;
}) {
  return (
    <div className={cn("w-full border-y border-basalt-700 py-8", className)}>
      <dl className="flex flex-wrap items-start gap-x-10 gap-y-6">
        {credentials.map((credential) => (
          <div key={credential.label} className="min-w-0">
            <dt>
              <Datum className="text-basalt-400">{credential.label}</Datum>
            </dt>
            <dd className="mt-1 font-mono text-body-sm tabular text-basalt-300">
              {credential.value}
            </dd>
          </div>
        ))}
      </dl>

      {localities?.length ? (
        <div className="mt-6">
          <Datum className="text-basalt-400">Serving</Datum>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {localities.map((locality) => (
              <li key={locality}>
                {localityHref ? (
                  <a
                    href={localityHref(locality)}
                    className="underline-wipe font-sans text-body-sm text-basalt-300 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {locality}
                  </a>
                ) : (
                  <span className="font-sans text-body-sm text-basalt-300">
                    {locality}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
