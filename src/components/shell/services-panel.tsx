"use client";

import Image from "next/image";
import NextLink from "next/link";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { EXPLORE_LINKS, SERVICE_GROUPS } from "@/lib/navigation";
import { Datum, Label } from "@/components/foundation/typography";

/* design.md §3.5 — "Services opens A PANEL, NOT A DROPDOWN: a full-width,
 * 380px-tall sheet that slides down over --dur-slow, containing three intent
 * columns plus a fourth 'Explore' column and a featured project thumbnail on
 * the right. Closes on Esc, outside click, or route change. FOCUS IS TRAPPED
 * WHILE OPEN."
 *
 * The focus trap is hand-rolled rather than pulled from Radix: this is a
 * navigation disclosure, not a dialog, so it must NOT set aria-modal or make
 * the rest of the page inert — a screen-reader user needs to be able to leave
 * it by tabbing past the end, which is what the wrap-around below gives them.
 */

export function ServicesPanel({
  open,
  onClose,
  featuredProject,
}: {
  open: boolean;
  onClose: () => void;
  featuredProject?: {
    title: string;
    href: string;
    locality: string;
    image: { src: string; alt: string };
  };
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc closes. Registered on the document so it works wherever focus sits.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Focus trap — Tab and Shift+Tab wrap inside the panel while it is open.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

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

    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* Outside click. Sits below the panel but above the page. */}
      {open ? (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-raised bg-scrim"
        />
      ) : null}

      <div
        ref={panelRef}
        id="services-panel"
        hidden={!open}
        className={cn(
          "absolute inset-x-0 top-full z-header",
          "border-b border-hairline bg-canvas",
          "shadow-sheet",
        )}
      >
        <div className="container-base grid grid-cols-12 gap-8 py-10">
          {/* §3.9 — the three intent groups. The visitor's own words sit above
           * the service names, because that is how they arrive. */}
          {SERVICE_GROUPS.map((group) => (
            <div key={group.key} className="col-span-3">
              <Label className="block text-brass-600 dark:text-brass-300">
                {group.label}
              </Label>
              <Datum className="mt-1 block normal-case text-fg-muted">
                &ldquo;{group.intent}&rdquo;
              </Datum>
              <div className="datum-rule mt-4" />

              <ul className="mt-4 flex flex-col gap-4">
                {group.services.map((service) => (
                  <li key={service.href}>
                    <NextLink
                      href={service.href}
                      onClick={onClose}
                      className="group block focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <span className="block font-sans text-body-md text-fg transition-colors duration-fast group-hover:text-brass-600 dark:group-hover:text-brass-300">
                        {service.label}
                      </span>
                      <span className="mt-0.5 block font-sans text-caption text-fg-muted">
                        {service.description}
                      </span>
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* §3.5 — the Explore column, which exists to solve a real IA gap:
           * /materials, /gallery and /process are high-value pages a 5-item nav
           * cannot hold and a footer link will not surface. */}
          <div className="col-span-2">
            <Label className="block text-brass-600 dark:text-brass-300">
              Explore
            </Label>
            <div className="datum-rule mt-4" />
            <ul className="mt-4 flex flex-col gap-4">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <NextLink
                    href={link.href}
                    onClick={onClose}
                    className="group block focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="block font-sans text-body-sm text-fg transition-colors duration-fast group-hover:text-brass-600 dark:group-hover:text-brass-300">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block font-sans text-caption text-fg-muted">
                      {link.description}
                    </span>
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          {/* §3.5 — the featured project thumbnail on the right. */}
          {featuredProject ? (
            <div className="col-span-2">
              <Label className="block text-fg-muted">Recently finished</Label>
              <NextLink
                href={featuredProject.href}
                onClick={onClose}
                className="group mt-4 block focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-basalt-100">
                  <Image
                    src={featuredProject.image.src}
                    alt={featuredProject.image.alt}
                    fill
                    sizes="220px"
                    quality={72}
                    className="object-cover transition-transform duration-base ease-standard group-hover:scale-103"
                  />
                </div>
                <span className="mt-3 block font-sans text-body-sm text-fg">
                  {featuredProject.title}
                </span>
                <Datum className="mt-1 block">{featuredProject.locality}</Datum>
              </NextLink>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
