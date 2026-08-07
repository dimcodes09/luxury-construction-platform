"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/navigation";
import { Icon } from "@/components/foundation/icon";

/* design.md §3.7 / FR-GBL-04 — the desktop contact dock.
 *
 * "Bottom-right, 56px circular, bg #128C7E, WhatsApp glyph. On hover it expands
 * left to a 280px pill showing A REAL TEAM MEMBER'S FACE, FIRST NAME, AND ROLE:
 * 'Priya · Client Relations — usually replies in 20 min.' NAMED HUMANS CONVERT
 * BETTER THAN A GENERIC BUBBLE (R-07, R-01). NEVER AUTO-OPENS. Dismissible;
 * dismissal persists 30 days."
 *
 * §0.2 is emphatic about what this replaces: "Chat widget popping open at 3
 * seconds — universally hated, hurts CLS and trust." Hence: never auto-opens,
 * user-initiated only, and fixed-position so it cannot contribute to CLS.
 *
 * §0.7 maps it to a specific hesitation — "Is anyone real here?" — answered by
 * "a named human on every CTA, WhatsApp with a person's name and photo".
 */

const DISMISS_KEY = "zyvora.dock.dismissedUntil";
const DISMISS_DAYS = 30;

export function ContactDock({
  phoneE164,
  person,
  context,
}: {
  phoneE164: string;
  /** A REAL team member. R-07 / §0.2: no stock portraits, no generic bubble. */
  person: {
    firstName: string;
    role: string;
    photo?: { src: string; alt: string };
    /** e.g. "usually replies in 20 min" — §10.2 microcopy. */
    responseNote: string;
  };
  context?: string;
}) {
  // Starts hidden so the server render and first client render agree; the
  // effect reveals it once localStorage has been read. Also means it can never
  // flash in and out, which would be its own small CLS-adjacent annoyance.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const until = window.localStorage.getItem(DISMISS_KEY);
      if (until && Number(until) > Date.now()) return;
    } catch {
      // Private mode or storage disabled — show the dock rather than hide it.
    }
    setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {
      // Dismissal simply will not persist; the visitor can dismiss again.
    }
  };

  if (!visible) return null;

  return (
    // §9.2 — desktop only. Mobile gets the sticky CTA bar instead.
    <div className="fixed bottom-6 right-6 z-dock hidden items-center lg:flex">
      <div className="group relative flex items-center">
        {/* The expanding pill. Hover/focus only — never on a timer. */}
        <a
          href={whatsappLink(phoneE164, context)}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="whatsapp_click"
          className={cn(
            "flex items-center gap-3 overflow-hidden rounded-full bg-whatsapp",
            "text-basalt-000 shadow-sheet",
            "transition-dock",
            // Collapsed: a 56px circle. Expanded: a 280px pill.
            "size-14 justify-center p-0",
            "group-hover:w-70 group-hover:justify-start group-hover:px-4",
            "group-focus-within:w-70 group-focus-within:justify-start group-focus-within:px-4",
            "focus-visible:outline-2 focus-visible:outline-offset-3",
          )}
        >
          {person.photo ? (
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={person.photo.src}
                alt={person.photo.alt}
                fill
                sizes="40px"
                quality={72}
                className="object-cover"
              />
            </span>
          ) : (
            <WhatsAppGlyph />
          )}

          {/* Text is present in the DOM (so it is announced) but clipped until
           * the pill expands. */}
          <span className="hidden min-w-0 flex-col text-left group-hover:flex group-focus-within:flex">
            <span className="truncate font-sans text-body-sm">
              {person.firstName} · {person.role}
            </span>
            <span className="truncate font-sans text-caption opacity-90">
              {person.responseNote}
            </span>
          </span>
        </a>

        {/* Dismissal. Appears on hover so the resting state stays a clean
         * circle — §0.2's complaint about chat widgets is visual noise as much
         * as behaviour. */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide the contact dock for 30 days"
          className={cn(
            "absolute -right-1 -top-1 grid size-6 place-items-center rounded-full",
            "border border-hairline bg-raised text-fg-muted shadow-sheet",
            "opacity-0 transition-opacity duration-fast",
            "group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
        >
          <Icon icon={X} size={16} />
        </button>
      </div>
    </div>
  );
}

/* The WhatsApp glyph. Drawn rather than imported: Lucide's MessageCircle is a
 * generic bubble, and §2.8 bans filled icons in the general set — but this is a
 * third-party brand mark, where the filled official shape is the recognisable
 * one and substituting an outline would weaken the signal. */
function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-current">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.21.89 2.39 1.01 2.55.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}
