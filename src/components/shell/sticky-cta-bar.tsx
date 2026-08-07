"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/navigation";
import { Icon } from "@/components/foundation/icon";

/* design.md §3.6 / FR-GBL-03 — the mobile sticky CTA bar.
 *
 * "Appears after 40% scroll on all pages EXCEPT Contact. Height 64px,
 * z-sticky-cta, bg basalt-900, top hairline brass. Two actions split 50/50:
 * WhatsApp and Get estimate. Hides while the mobile drawer or any modal is
 * open. Respects env(safe-area-inset-bottom)."
 *
 * §3.6 on why WhatsApp comes first: "for this audience and market, WhatsApp is
 * the lowest-friction, highest-response channel, and the message is PRE-FILLED
 * WITH THE PAGE CONTEXT. This gives the sales team instant context and
 * dramatically raises reply quality."
 *
 * §9.2: hidden at ≥1024 — desktop gets the contact dock instead, and showing
 * both would be two competing persistent CTAs.
 */

export function StickyCtaBar({
  phoneE164,
  /** FR-GBL-05 — page context for the pre-filled message, e.g. a project name. */
  context,
}: {
  phoneE164: string;
  context?: string;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // §3.6 — not on /contact. That page IS the conversion surface; a sticky bar
  // pointing elsewhere would compete with the form the visitor is filling in.
  const suppressed = pathname === "/contact";

  useEffect(() => {
    if (suppressed) return;

    /* Polled from rAF rather than a scroll listener, for the same reason as the
     * header: Lenis (§7.5) owns scrolling on desktop and the native scroll
     * event does not reliably fire while it does. A listener-based bar simply
     * never appears. Early-outs when the position has not changed. */
    let frame: number | undefined;
    let running = true;
    let last = -1;

    const tick = () => {
      if (!running) return;
      const y = window.scrollY;
      if (y !== last) {
        last = y;
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        // Guard against a short page where scrollable is 0 — dividing by it
        // yields Infinity and the bar would appear immediately.
        const progress = scrollable > 0 ? y / scrollable : 0;
        setVisible(progress > 0.4);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [suppressed, pathname]);

  if (suppressed) return null;

  return (
    <div
      /* Hides while a drawer or modal is open. Radix sets aria-hidden on the
       * body's other children when a dialog opens, so keying off that keeps
       * this in step with every overlay without wiring up shared state. */
      className={cn(
        "fixed inset-x-0 bottom-0 z-sticky-cta lg:hidden",
        "border-t border-brass-500 bg-basalt-900",
        "pb-safe",
        "transition-transform duration-base ease-standard",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="grid h-16 grid-cols-2">
        {/* WhatsApp first — deliberately (§3.6). */}
        <a
          href={whatsappLink(phoneE164, context)}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="whatsapp_click"
          className={cn(
            "flex items-center justify-center gap-2 border-r border-basalt-700",
            "font-sans text-body-md text-basalt-050",
            "transition-colors duration-fast hover:bg-basalt-800",
            "focus-visible:outline-2 focus-visible:-outline-offset-2",
          )}
        >
          <Icon icon={MessageCircle} size={20} className="text-whatsapp" />
          WhatsApp
        </a>

        {/* §10.3 rung 3 — "Get a cost estimate" is the approved label, and the
         * value exchange that must precede any rung-5 ask (§0.5). */}
        <NextLink
          href="/estimate"
          data-analytics="cta_click"
          className={cn(
            "flex items-center justify-center gap-2",
            "font-sans text-body-md text-basalt-050",
            "transition-colors duration-fast hover:bg-basalt-800",
            "focus-visible:outline-2 focus-visible:-outline-offset-2",
          )}
        >
          <Icon icon={Calculator} size={20} className="text-brass-400" />
          Get estimate
        </NextLink>
      </div>
    </div>
  );
}
