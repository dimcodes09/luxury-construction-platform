"use client";

import NextLink from "next/link";
import { MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SERVICE_GROUPS, whatsappLink } from "@/lib/navigation";
import { Icon } from "@/components/foundation/icon";
import { Button } from "@/components/ui/button";
import { Datum, Label } from "@/components/foundation/typography";

/* design.md §3.5 mobile — "Menu opens a FULL-SCREEN DRAWER from the right:
 * items stagger in at 40ms intervals, display-lg type, generous 64px rows.
 * Bottom of the drawer holds phone, WhatsApp, and the estimator CTA plus the
 * office address. Body scroll locked; `inert` applied to the page behind;
 * focus trapped; Esc closes."
 *
 * `inert` on the background is the part most implementations skip, and it is
 * the one that matters: without it a screen reader happily walks straight out
 * of the drawer into the page underneath, which is why §9.4 requires escape
 * from every modal to be possible and predictable.
 */

export function MobileDrawer({
  open,
  onClose,
  phoneE164,
}: {
  open: boolean;
  onClose: () => void;
  phoneE164: string;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Body scroll lock. Storing and restoring the previous value rather than
    // assuming "" avoids clobbering a lock set by something else.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* `inert` on everything except the drawer. Supported in all our §8.7
     * targets; where it is not, the focus trap below still holds. */
    const siblings = Array.from(document.body.children).filter(
      (child) => !child.contains(drawerRef.current),
    );
    siblings.forEach((sibling) => sibling.setAttribute("inert", ""));

    // Move focus into the drawer so the first Tab lands somewhere sensible.
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      siblings.forEach((sibling) => sibling.removeAttribute("inert"));
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={cn(
        "fixed inset-0 z-drawer flex flex-col bg-basalt-950",
        "animate-slide-in-right",
      )}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-display text-heading-sm uppercase tracking-widest text-basalt-050">
          ZYVORA
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid size-target place-items-center rounded-full text-basalt-050 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Icon icon={X} size={24} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-5" aria-label="Primary">
        <ul className="flex flex-col">
          {PRIMARY_NAV.map((item, index) => (
            <li key={item.href}>
              <NextLink
                href={item.href}
                onClick={onClose}
                /* §3.5 — items stagger in at 40ms intervals. Inline delay is
                 * the one place a computed value is unavoidable; it is a
                 * timing, not a design token, and reduced motion zeroes the
                 * animation globally via motion.css. */
                style={{ animationDelay: `${index * 40}ms` }}
                className={cn(
                  // §3.5 — generous 64px rows, display-lg type.
                  "flex min-h-16 items-center border-b border-basalt-700",
                  "font-display text-display-lg text-basalt-050",
                  "animate-fade-in focus-visible:outline-2 focus-visible:outline-offset-2",
                )}
              >
                {item.label}
              </NextLink>
            </li>
          ))}
        </ul>

        {/* §3.9 intent groups, flattened for mobile. A nested accordion here
         * would bury nine services behind two taps. */}
        <div className="mt-8">
          <Label className="block text-basalt-400">All services</Label>
          <div className="mt-4 flex flex-col gap-6">
            {SERVICE_GROUPS.map((group) => (
              <div key={group.key}>
                <Datum className="block text-brass-300">{group.label}</Datum>
                <ul className="mt-2 flex flex-col">
                  {group.services.map((service) => (
                    <li key={service.href}>
                      <NextLink
                        href={service.href}
                        onClick={onClose}
                        className="flex min-h-target items-center font-sans text-body-md text-basalt-300 focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        {service.label}
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* §3.5 — the drawer foot: phone, WhatsApp, estimator CTA, address. */}
      <div className="border-t border-basalt-700 px-5 py-6 pb-safe">
        <div className="flex flex-col gap-3">
          <Button asChild variant="accent" size="lg" className="w-full">
            <NextLink href="/estimate" onClick={onClose}>
              Get a cost estimate
            </NextLink>
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="secondary" size="md" className="border-basalt-050 text-basalt-050">
              <a href={`tel:${phoneE164}`} data-analytics="phone_click">
                <Icon icon={Phone} size={20} />
                Call
              </a>
            </Button>
            <Button asChild variant="whatsapp" size="md">
              <a
                href={whatsappLink(phoneE164)}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="whatsapp_click"
              >
                <Icon icon={MessageCircle} size={20} />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        <address className="mt-6 not-italic font-sans text-caption text-basalt-400">
          Placeholder address, Bhopal 462039
          <br />
          Mon–Sat, 10:00–19:00
        </address>
      </div>
    </div>
  );
}
