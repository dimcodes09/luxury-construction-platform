"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "@/lib/navigation";
import { Icon } from "@/components/foundation/icon";
import { Button } from "@/components/ui/button";
import { ServicesPanel } from "./services-panel";
import { MobileDrawer } from "./mobile-drawer";

/* design.md §3.5 — Header.
 *
 * Four behaviours are specified and each is here for a stated reason:
 *
 *  - 84px → 64px collapse past 120px scroll, with a blurred translucent
 *    background and a bottom hairline. DIRECTIONAL: reveals fully on scroll-up.
 *    "NEVER FULLY HIDDEN — the CTA must always be one click away."
 *
 *  - CONTEXT-AWARE COLOUR. On dark hero sections it renders inverted,
 *    "transitioning at the intersection boundary via IntersectionObserver, NOT
 *    SCROLL POSITION (robust to variable hero heights)." A scroll-threshold
 *    version breaks the moment a hero is a different height.
 *
 *  - The LIVE RATING CHIP, left of the CTA. §3.5 argues it explicitly: 86% of
 *    homeowners read reviews before choosing a contractor (R-02), and a rating
 *    visible on EVERY page is "one of the cheapest persistent trust signals
 *    available". Hidden below 1280 where the CTA takes priority.
 *
 *  - Mobile keeps a PHONE ICON IN THE HEADER: "a meaningful share of mobile
 *    visitors want to call immediately, and burying it costs leads."
 */

export function Header({
  rating,
  phoneE164,
  featuredProject,
}: {
  /** FR-HOME-06 — live Google aggregate. Omitted when the API is unavailable;
   *  INT-06 says serve last-known values and never show an error. */
  rating?: { value: number; count: number };
  phoneE164: string;
  featuredProject?: React.ComponentProps<typeof ServicesPanel>["featuredProject"];
}) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const lastScrollY = useRef(0);

  /* Collapse, direction, and context colour — all resolved in ONE rAF per
   * scroll frame. §7.3 forbids layout-triggering work on scroll, and setState
   * per scroll event is exactly that.
   *
   * §3.5 asks for the colour inversion to key off the section boundary rather
   * than a scroll threshold, "robust to variable hero heights". The first
   * attempt used an IntersectionObserver with rootMargin "-96px 0px -100% 0px"
   * to make a thin detection band at the top of the viewport. That margin is
   * arithmetically impossible: it shrinks the root by 96px from the top AND by
   * a full viewport height from the bottom, so the root rect ends up NEGATIVE
   * and the observer can never report an intersection. The header therefore
   * never inverted, in any browser.
   *
   * A direct rect test gives the same section-boundary behaviour, is exact at
   * every scroll position rather than only at crossings, and has no dependency
   * on compositing — so it also works in headless and background tabs. There
   * are at most a couple of marked sections per page, so the cost is trivial. */
  useEffect(() => {
    let frame: number | undefined;

    const measure = () => {
      frame = undefined;

      const y = window.scrollY;
      const goingDown = y > lastScrollY.current;

      setCollapsed(y > 120);
      // Never hidden at the top, and never while a panel is open.
      setHidden(goingDown && y > 240);
      lastScrollY.current = y;

      /* Is a dark section behind the header right now? The header occupies the
       * top ~84px, so test the band just below its midline. */
      const probe = 48;
      const darkSections = document.querySelectorAll("[data-header-dark]");
      let dark = false;
      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom >= probe) dark = true;
      });
      setOnDark(dark);
    };

    /* Polled from rAF, NOT from a scroll listener.
     *
     * Lenis (§7.5) takes over scrolling on desktop and drives position itself.
     * With it active, the native `scroll` event on window is unreliable — it
     * did not fire at all in testing while scrollTop moved from 0 to 900 — so a
     * header wired to that event simply stops updating after mount. That is
     * what left it light-on-light over the dark hero.
     *
     * A rAF poll is correct whether Lenis is running or not, on touch or
     * pointer, and needs no coupling between the shell and the motion layer.
     * It early-outs when the scroll position has not changed, so the steady
     * state is one cheap comparison per frame. */
    let running = true;
    let lastMeasured = -1;

    const tick = () => {
      if (!running) return;
      const y = window.scrollY;
      if (y !== lastMeasured) {
        lastMeasured = y;
        measure();
      }
      frame = requestAnimationFrame(tick);
    };

    // Run once immediately so the header is correct on first paint rather than
    // rendering light over a dark hero for a frame.
    measure();
    frame = requestAnimationFrame(tick);

    const onResize = () => measure();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      running = false;
      window.removeEventListener("resize", onResize);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // §3.5 — closes on route change.
  useEffect(() => {
    setServicesOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  const closeServices = useCallback(() => setServicesOpen(false), []);

  /* Inversion depends ONLY on what is behind the header, never on whether it
   * has collapsed. Tying it to !collapsed meant that the instant you scrolled
   * past 120px over a dark hero, the bar flipped to a light background while
   * the hero behind it stayed black — the grey band bug. */
  const inverted = onDark;

  return (
    <header
      data-collapsed={collapsed ? "" : undefined}
      className={cn(
        "sticky top-0 z-header w-full",
        "transition-transform duration-base ease-standard",
        // Never fully hidden while a panel is open — the CTA must stay reachable.
        hidden && !servicesOpen && !drawerOpen && "-translate-y-full",
        // §3.5 — translucent + blurred on scroll, but tinted to match whatever
        // it is sitting over. A light scrim over a dark hero reads as a bug.
        collapsed && "backdrop-blur-lg backdrop-saturate-150",
        collapsed && !inverted && "border-b border-hairline bg-canvas/85",
        collapsed && inverted && "border-b border-basalt-700/60 bg-basalt-950/70",
      )}
    >
      <div
        className={cn(
          "container-base flex items-center justify-between gap-6",
          "transition-height",
          // §3.5 / §9.2 — 64px mobile; 84px → 64px on desktop.
          "h-header lg:h-header-lg",
          collapsed && "lg:h-header",
        )}
      >
        {/* §1.1.2 — the lockup. Compact (wordmark only) below 640px is the ONLY
         * context where the descriptor may be dropped, "and only because the
         * hero headline immediately below states the category". */}
        <NextLink
          href="/"
          className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4"
          aria-label="ZYVORA — home"
        >
          <span
            className={cn(
              "block font-display text-heading-sm uppercase tracking-widest",
              inverted ? "text-basalt-050" : "text-fg",
            )}
          >
            ZYVORA
          </span>
          <span
            className={cn(
              "mt-0.5 hidden font-sans text-label uppercase sm:block",
              inverted ? "text-brass-300" : "text-fg-muted",
            )}
          >
            Construction • Interiors • Renovation
          </span>
        </NextLink>

        {/* Desktop nav — §3.5: exactly five items. */}
        <nav className="hidden lg:block" aria-label="Primary">
          <ul className="flex items-center gap-8">
            {PRIMARY_NAV.map((item) => {
              const isServices = item.href === "/services";
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  {isServices ? (
                    <button
                      type="button"
                      onClick={() => setServicesOpen((open) => !open)}
                      aria-expanded={servicesOpen}
                      aria-controls="services-panel"
                      className={cn(
                        "relative py-2 font-sans text-body-md tracking-tight",
                        "transition-colors duration-fast ease-standard",
                        "focus-visible:outline-2 focus-visible:outline-offset-2",
                        // §3.5 — a 1px brass underline, wiping from the left.
                        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px",
                        "after:origin-left after:scale-x-0 after:bg-brass-500",
                        "after:transition-transform after:duration-base after:ease-standard",
                        "hover:after:scale-x-100",
                        inverted
                          ? "text-basalt-300 hover:text-basalt-050"
                          : "text-fg-secondary hover:text-fg",
                        (active || servicesOpen) &&
                          (inverted ? "text-basalt-050" : "text-fg") +
                            " after:scale-x-100",
                      )}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <NextLink
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative py-2 font-sans text-body-md tracking-tight",
                        "transition-colors duration-fast ease-standard",
                        "focus-visible:outline-2 focus-visible:outline-offset-2",
                        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px",
                        "after:origin-left after:scale-x-0 after:bg-brass-500",
                        "after:transition-transform after:duration-base after:ease-standard",
                        "hover:after:scale-x-100",
                        inverted
                          ? "text-basalt-300 hover:text-basalt-050"
                          : "text-fg-secondary hover:text-fg",
                        active &&
                          (inverted ? "text-basalt-050" : "text-fg") +
                            " after:scale-x-100",
                      )}
                    >
                      {item.label}
                    </NextLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* §3.5 rating chip — hidden below 1280 where the CTA takes priority. */}
          {rating ? (
            <NextLink
              href="/reviews"
              className={cn(
                "hidden items-center gap-1.5 rounded-sm px-2 py-1 xl:inline-flex",
                "font-mono text-datum uppercase tabular",
                "transition-colors duration-fast",
                "focus-visible:outline-2 focus-visible:outline-offset-2",
                inverted
                  ? "text-basalt-300 hover:text-basalt-050"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              <Icon icon={Star} size={16} className="fill-brass-500 text-brass-500" />
              {rating.value.toFixed(1)}
              <span className="opacity-70">({rating.count})</span>
            </NextLink>
          ) : null}

          {/* §3.5 — the phone icon lives in the MOBILE header, deliberately.
           * FR-GBL-06: tel: with the E.164 number, firing a phone_click event. */}
          <a
            href={`tel:${phoneE164}`}
            data-analytics="phone_click"
            aria-label="Call us"
            className={cn(
              "grid size-target place-items-center rounded-full lg:hidden",
              "transition-colors duration-fast",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              inverted ? "text-basalt-050" : "text-fg",
            )}
          >
            <Icon icon={Phone} size={20} />
          </a>

          {/* §3.5 — one persistent conversion CTA on every page (FR-GBL-02).
           * §10.3 rung 3: "Get a cost estimate" is approved; it is also the
           * value exchange §0.5 requires before any rung-5 ask. */}
          <Button
            asChild
            variant="accent"
            size="md"
            className="hidden sm:inline-flex"
          >
            <NextLink href="/estimate">Get a cost estimate</NextLink>
          </Button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className={cn(
              "grid size-target place-items-center rounded-full lg:hidden",
              "transition-colors duration-fast",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              inverted ? "text-basalt-050" : "text-fg",
            )}
          >
            <Icon icon={Menu} size={24} />
          </button>
        </div>
      </div>

      <ServicesPanel
        open={servicesOpen}
        onClose={closeServices}
        featuredProject={featuredProject}
      />

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        phoneE164={phoneE164}
      />
    </header>
  );
}
