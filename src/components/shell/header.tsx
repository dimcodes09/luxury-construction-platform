"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "@/lib/navigation";
import { Icon } from "@/components/foundation/icon";
import { Button } from "@/components/ui/button";
import { ServicesPanel } from "./services-panel";
import { MobileDrawer } from "./mobile-drawer";

export function Header({
  phoneE164,
  featuredProject,
}: {
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

  useEffect(() => {
    let frame: number | undefined;

    const measure = () => {
      frame = undefined;

      const y = window.scrollY;
      const goingDown = y > lastScrollY.current;

      setCollapsed(y > 120);
      setHidden(goingDown && y > 240);
      lastScrollY.current = y;

      const probe = 48;
      const darkSections = document.querySelectorAll("[data-header-dark]");
      let dark = false;
      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom >= probe) dark = true;
      });
      setOnDark(dark);
    };

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

  useEffect(() => {
    setServicesOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  const closeServices = useCallback(() => setServicesOpen(false), []);

  const inverted = onDark;

  return (
    <header
      data-collapsed={collapsed ? "" : undefined}
      className={cn(
        "sticky top-0 z-header w-full overflow-x-clip",
        "transition-transform duration-300 ease-in-out",
        hidden && !servicesOpen && !drawerOpen && "-translate-y-full",
        collapsed && "pt-3",
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-6 overflow-hidden",
          "transition-navbar",
          collapsed
            ? "w-navbar-pill max-w-base rounded-full px-6 py-2 shadow-xl backdrop-blur-xl lg:px-8"
            : "w-full max-w-base rounded-none px-6 md:px-8 lg:px-12",
          
          // Surface colors & borders:
          collapsed && !inverted && "border border-border/70 bg-canvas/95 text-basalt-950 shadow-lg",
          collapsed && inverted && "border border-basalt-700/80 bg-basalt-950/92 text-basalt-050 shadow-2xl",
          !collapsed && !inverted && "bg-canvas/90 backdrop-blur-md border-b border-border/40 text-basalt-950",
          !collapsed && inverted && "bg-basalt-950/85 backdrop-blur-md border-b border-basalt-800/50 text-basalt-050",

          "h-header lg:h-header-lg",
          collapsed && "lg:h-header",
        )}
      >
        {/* LOGO & WORDMARK LOCKUP */}
        <NextLink
          href="/"
          className="flex items-center gap-3 shrink-0 py-1 focus-visible:outline-none"
          aria-label="ZYVORA — home"
        >
          <div className="flex flex-col">
            <span
              className={cn(
                "block font-display text-heading-sm font-bold tracking-widest uppercase transition-colors",
                inverted ? "text-basalt-050" : "text-basalt-950",
              )}
            >
              ZYVORA
            </span>
            <span
              className={cn(
                "font-sans text-caption font-semibold tracking-wider uppercase transition-all duration-300",
                collapsed ? "hidden" : "hidden sm:block",
                inverted ? "text-brass-300" : "text-brass-600 dark:text-brass-400",
              )}
            >
              Construction • Interiors • Renovation
            </span>
          </div>
        </NextLink>

        {/* DESKTOP NAVIGATION ITEMS */}
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
                        "relative py-2 font-sans text-body-md font-medium tracking-tight",
                        "transition-colors duration-200 ease-in-out",
                        "focus-visible:outline-none",
                        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px]",
                        "after:origin-left after:scale-x-0 after:bg-brass-500",
                        "after:transition-transform after:duration-200 after:ease-in-out",
                        "hover:after:scale-x-100",
                        inverted
                          ? "text-basalt-100 hover:text-white"
                          : "text-basalt-800 hover:text-basalt-950",
                        (active || servicesOpen) &&
                          (inverted ? "text-white" : "text-basalt-950") +
                            " after:scale-x-100 font-semibold",
                      )}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <NextLink
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative py-2 font-sans text-body-md font-medium tracking-tight",
                        "transition-colors duration-200 ease-in-out",
                        "focus-visible:outline-none",
                        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px]",
                        "after:origin-left after:scale-x-0 after:bg-brass-500",
                        "after:transition-transform after:duration-200 after:ease-in-out",
                        "hover:after:scale-x-100",
                        inverted
                          ? "text-basalt-100 hover:text-white"
                          : "text-basalt-800 hover:text-basalt-950",
                        active &&
                          (inverted ? "text-white" : "text-basalt-950") +
                            " after:scale-x-100 font-semibold",
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

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${phoneE164}`}
            data-analytics="phone_click"
            aria-label="Call us"
            className={cn(
              "grid size-target place-items-center rounded-full lg:hidden",
              "transition-colors duration-200",
              "focus-visible:outline-none",
              inverted ? "text-basalt-050 hover:bg-basalt-800" : "text-fg hover:bg-basalt-100",
            )}
          >
            <Icon icon={Phone} size={20} />
          </a>

          <Button
            asChild
            variant="accent"
            size="md"
            className={cn(
              "hidden sm:inline-flex shrink-0 font-semibold shadow-sm transition-all duration-300",
              collapsed ? "rounded-full px-5 py-2" : "rounded-sm px-6 py-2.5",
            )}
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
              "transition-colors duration-200",
              "focus-visible:outline-none",
              inverted ? "text-basalt-050 hover:bg-basalt-800" : "text-fg hover:bg-basalt-100",
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
