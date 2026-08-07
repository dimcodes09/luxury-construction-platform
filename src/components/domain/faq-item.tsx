import { cn } from "@/lib/utils";

/* design.md §3.19 — FAQItem.
 *
 * Built on NATIVE <details>/<summary>, deliberately. §3.19: "Proper
 * details/summary semantics so content is in the DOM for SEO and Ctrl+F, with
 * JS enhancing the animation."
 *
 * That is the difference between this and the Radix Accordion in the ui layer.
 * SRS FR-FAQ-01 and FR-SVC-08 require FAQPage structured data, and Google will
 * not credit answers that only exist after hydration. This component therefore
 * works, and is crawlable, with zero JavaScript.
 *
 * §3.19: "First item open by default on FAQ pages (demonstrates the
 * affordance), all closed when embedded in another page."
 */

export type FAQ = { question: string; answer: string };

export function FAQItem({
  faq,
  defaultOpen = false,
  className,
}: {
  faq: FAQ;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details
      open={defaultOpen}
      className={cn("group border-b border-hairline", className)}
    >
      <summary
        className={cn(
          // §3.19: entire row clickable, min-height 64px, 24px vertical padding.
          "flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-6",
          "font-sans text-heading-sm text-fg",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          // Suppress the native disclosure triangle in every engine.
          "no-marker",
        )}
      >
        {faq.question}

        {/* §3.19 — a 20px + rotating into an ×. One glyph, two states. */}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className={cn(
            "size-5 shrink-0 text-fg-muted",
            "transition-transform duration-base ease-standard",
            "group-open:rotate-45",
          )}
        >
          <path
            d="M10 4v12M4 10h12"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="butt"
          />
        </svg>
      </summary>

      <div className="pb-6 font-sans text-body-md text-fg-secondary measure-body">
        {faq.answer}
      </div>
    </details>
  );
}

/* Emits FAQPage structured data alongside the rendered list, from the same
 * source array — SRS FR-FAQ-01 / FR-SVC-08, validated in CI (NFR-SEO-03). */
export function FAQList({
  faqs,
  /** §3.19 — true on /faq, false when embedded in another page. */
  openFirst = false,
  emitStructuredData = true,
  className,
}: {
  faqs: FAQ[];
  openFirst?: boolean;
  emitStructuredData?: boolean;
  className?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className={className}>
      {faqs.map((faq, index) => (
        <FAQItem
          key={faq.question}
          faq={faq}
          defaultOpen={openFirst && index === 0}
        />
      ))}

      {emitStructuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </div>
  );
}
