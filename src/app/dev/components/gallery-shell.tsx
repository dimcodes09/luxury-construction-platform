"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Datum } from "@/components/foundation/typography";

/* design-process.md Step 6 rule 2 — "Put every component in a gallery route
 * (/dev/components) as you build it. Every variant, every state, side by side.
 * THIS IS YOUR DESIGN REVIEW SURFACE AND YOUR REGRESSION CHECK."
 *
 * The three toggles below exist because they correspond to the three checks
 * that actually catch problems in this system:
 *
 *  - DARK: §2.1.3 semantic aliases flip here. A component that hard-codes a
 *    ramp step instead of an alias breaks visibly the moment this is switched.
 *  - GRID: §2.4.4's dev-only column and baseline overlay, spec'd to Ctrl+G.
 *  - REDUCED MOTION: §7.1 principle 7's kill switch. The OS-level setting is
 *    authoritative, but this simulates the layout consequence so the Step 8
 *    checkpoint can be run without leaving the browser.
 */

export function GalleryShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [grid, setGrid] = useState(false);

  // §2.4.4 — "A dev-only overlay toggled with Ctrl+G renders both the column
  // and baseline grid."
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "g") {
        event.preventDefault();
        setGrid((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="relative min-h-svh bg-canvas">
      {/* §2.4.4 dev overlay: 12 columns + an 8px baseline. */}
      {grid ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-devtools"
        >
          <div className="container-base h-full">
            <div className="grid h-full grid-cols-4 gap-4 md:grid-cols-8 md:gap-6 lg:grid-cols-12">
              {Array.from({ length: 12 }, (_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-full bg-danger-600/8",
                    index >= 4 && "hidden md:block",
                    index >= 8 && "hidden lg:block",
                  )}
                />
              ))}
            </div>
          </div>
          <div className="baseline-overlay absolute inset-0" />
        </div>
      ) : null}

      <header className="sticky top-0 z-header border-b border-hairline bg-canvas/82 backdrop-blur-md">
        <div className="container-base flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <div>
            <p className="font-display text-heading-sm text-fg">
              ZYVORA — Component gallery
            </p>
            <Datum className="mt-0.5 block">
              design.md Part 3 · every variant, every state
            </Datum>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleButton active={dark} onClick={() => setDark((v) => !v)}>
              {dark ? "Dark" : "Light"}
            </ToggleButton>
            <ToggleButton active={grid} onClick={() => setGrid((v) => !v)}>
              Grid (Ctrl+G)
            </ToggleButton>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-target items-center rounded-sm border px-4 font-mono text-datum uppercase",
        "transition-colors duration-fast ease-standard",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        active
          ? "border-ink-900 bg-ink-900 text-basalt-050 dark:border-basalt-050 dark:bg-basalt-050 dark:text-ink-900"
          : "border-hairline text-fg-secondary hover:bg-basalt-100 dark:hover:bg-basalt-800",
      )}
    >
      {children}
    </button>
  );
}
