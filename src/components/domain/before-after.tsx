"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.14 — BeforeAfter. The signature component.
 *
 * §3.14 is the longest component spec in the document because this is a
 * conversion moment (R-10), and implementationplan.md Phase 3 budgets it 1.5
 * days on its own: "It is a mini-project, not a component."
 *
 * The four things that are usually got wrong, and how each is handled here:
 *
 * 1. THE IDLE HINT. §3.14: "This is the single most important detail — without
 *    it a large share of users never discover the interaction." Handle animates
 *    50 → 62 → 44 → 50 over 1400ms on first viewport entry, ONCE.
 *
 * 2. TOUCH THAT DOESN'T EAT PAGE SCROLL. `touch-action: pan-y` lets a vertical
 *    swipe scroll the page while a horizontal drag moves the handle. §3.14
 *    calls this "a very common bug in off-the-shelf sliders."
 *
 * 3. NO REACT STATE PER POINTER-MOVE. §3.14: the clip-path updates via a CSS
 *    custom property written inside requestAnimationFrame. Re-rendering React
 *    on every pointermove drops frames on the mid-range Android that is our
 *    reference device (SRS §8.7).
 *
 * 4. IT WORKS WITHOUT JS. §3.14 fallback: the two images render stacked with
 *    captions. Achieved by making the stacked layout the DEFAULT and letting an
 *    effect upgrade it, rather than hiding content behind a hydration check.
 */

export type BeforeAfterImage = {
  src: string;
  alt: string;
};

export function BeforeAfter({
  before,
  after,
  /* §3.14 content rule: "every before/after pair carries a one-line caption
   * naming WHAT CHANGED AND WHAT IT COST — 'Kitchen re-planned, 128 sq ft ·
   * ₹4.6 L · 5 weeks.' A slider without cost context is entertainment; with it,
   * it's a sales tool." Hence caption is required, not optional. */
  caption,
  /** §3.14 — cursor tracking is opt-in per instance; it steals control. */
  trackCursor = false,
  priority = false,
  className,
}: {
  before: BeforeAfterImage;
  after: BeforeAfterImage;
  caption: string;
  trackCursor?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const positionRef = useRef(50);
  const draggingRef = useRef(false);
  const hintedRef = useRef(false);

  /* `enhanced` gates the interactive layer. It starts false so the server HTML
   * is the no-JS stacked fallback (§3.14), then flips after mount. */
  const [enhanced, setEnhanced] = useState(false);
  /* Mirrored into React state only for aria-valuenow — once per committed
   * change, never per pointer-move. */
  const [announced, setAnnounced] = useState(50);

  /* The single write path. Everything funnels through here so there is exactly
   * one place that touches the DOM, inside one rAF. */
  const paint = useCallback((next: number) => {
    positionRef.current = next;
    if (frameRef.current !== undefined) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = undefined;
      containerRef.current?.style.setProperty(
        "--reveal",
        `${positionRef.current}%`,
      );
    });
  }, []);

  const commit = useCallback((next: number) => {
    setAnnounced(Math.round(next));
  }, []);

  useEffect(() => {
    setEnhanced(true);
    /* Set synchronously rather than through paint(): the very first value must
     * land in the same frame the interactive layer appears, otherwise the
     * handle renders at its 50% fallback while the clip-path is still at its
     * 100% fallback — handle centred, before-image covering everything. */
    containerRef.current?.style.setProperty("--reveal", "50%");
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
        /* Must clear the ref, not just cancel. React StrictMode mounts,
         * unmounts and remounts in development; leaving a stale id here makes
         * every subsequent paint() early-return and the component never draws
         * again. The same applies to any real remount in production. */
        frameRef.current = undefined;
      }
    },
    [],
  );

  /* §3.14 idle hint: 50% → 62% → 44% → 50% over 1400ms, --ease-inout, once.
   * Suppressed entirely under reduced motion, which leaves a static 50/50. */
  useEffect(() => {
    if (!enhanced) return;
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hintedRef.current) return;
        hintedRef.current = true;
        observer.disconnect();

        const keyframes = [
          { at: 0, value: 50 },
          { at: 0.32, value: 62 },
          { at: 0.68, value: 44 },
          { at: 1, value: 50 },
        ];
        const duration = 1400;
        const start = performance.now();

        // Hand-rolled rather than WAAPI because we are animating a custom
        // property that drives clip-path; --ease-inout is applied per segment.
        const easeInOut = (t: number) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const tick = (now: number) => {
          // A user grabbing the handle mid-hint cancels it immediately.
          if (draggingRef.current) return;
          const elapsed = Math.min((now - start) / duration, 1);

          let segment = 0;
          while (
            segment < keyframes.length - 2 &&
            elapsed > keyframes[segment + 1]!.at
          ) {
            segment += 1;
          }
          const from = keyframes[segment]!;
          const to = keyframes[segment + 1]!;
          const span = to.at - from.at;
          const localT = span === 0 ? 1 : (elapsed - from.at) / span;
          paint(from.value + (to.value - from.value) * easeInOut(localT));

          if (elapsed < 1) requestAnimationFrame(tick);
          else commit(50);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.7 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [enhanced, paint, commit]);

  const positionFromClientX = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return 50;
    const rect = container.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(100, Math.max(0, ratio * 100));
  }, []);

  /* Pointer events unify mouse, touch and pen — §3.14 asks for exactly this
   * rather than three separate listener sets. */
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    hintedRef.current = true;
    // Capture means we keep receiving moves even if the pointer leaves the box.
    event.currentTarget.setPointerCapture(event.pointerId);
    paint(positionFromClientX(event.clientX));
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      paint(positionFromClientX(event.clientX));
      return;
    }
    // §3.14 — off by default because it steals control from the user.
    if (trackCursor && event.pointerType === "mouse") {
      paint(positionFromClientX(event.clientX));
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    commit(positionRef.current);
  };

  /* §3.14 keyboard: ←/→ move 2%, Shift+←/→ 10%, Home/End jump to 0/100. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    let next: number | undefined;

    if (event.key === "ArrowLeft") next = positionRef.current - step;
    else if (event.key === "ArrowRight") next = positionRef.current + step;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 100;

    if (next === undefined) return;
    event.preventDefault();
    hintedRef.current = true;
    const clamped = Math.min(100, Math.max(0, next));
    paint(clamped);
    commit(clamped);
  };

  return (
    <figure className={cn("w-full", className)}>
      <div
        ref={containerRef}
        onPointerDown={enhanced ? onPointerDown : undefined}
        onPointerMove={enhanced ? onPointerMove : undefined}
        onPointerUp={enhanced ? endDrag : undefined}
        onPointerCancel={enhanced ? endDrag : undefined}
        data-enhanced={enhanced ? "" : undefined}
        className={cn(
          "group relative w-full overflow-hidden rounded-md bg-basalt-100",
          // §3.14 — 4:3 mobile, 16:9 desktop.
          "aspect-4/3 md:aspect-video",
          // §3.14 / §9.3 — the whole reason vertical page scroll still works.
          "touch-pan-y",
          enhanced ? "cursor-ew-resize select-none" : "cursor-default",
          // No-JS: the two images stack instead of overlaying.
          "not-data-enhanced:flex not-data-enhanced:aspect-auto not-data-enhanced:flex-col not-data-enhanced:gap-2",
        )}
      >
        {/* AFTER is the base layer (§3.14). Preloaded when above the fold. */}
        <div className="relative size-full">
          <Image
            src={after.src}
            alt={after.alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            quality={72}
            priority={priority}
            className="object-cover"
          />
        </div>

        {/* BEFORE is clipped from the right by --reveal. When JS has not run,
         * --reveal is unset and inset(0 0 0 0) leaves it fully visible — which
         * is exactly the stacked fallback we want. */}
        <div
          className={cn(
            "size-full",
            "group-data-enhanced:absolute group-data-enhanced:inset-0",
          )}
          style={{
            clipPath: "inset(0 calc(100% - var(--reveal, 100%)) 0 0)",
          }}
        >
          <Image
            src={before.src}
            alt={before.alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            quality={72}
            className="object-cover"
          />
        </div>

        {/* §3.14 labels — ALWAYS visible, never hover-only. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden items-start justify-between p-3 group-data-enhanced:flex">
          <span className="rounded-sm bg-basalt-950/60 px-2 py-1 font-sans text-label uppercase text-basalt-050 backdrop-blur-sm">
            Before
          </span>
          <span className="rounded-sm bg-basalt-950/60 px-2 py-1 font-sans text-label uppercase text-basalt-050 backdrop-blur-sm">
            After
          </span>
        </div>

        {/* The handle: a 2px rule with a 44px grab control (§9.3 target). */}
        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label="Reveal before image"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={announced}
          aria-valuetext={`${announced}% before`}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute inset-y-0 hidden w-0.5 -translate-x-1/2 bg-basalt-000",
            "group-data-enhanced:block",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
          style={{ left: "var(--reveal, 50%)" }}
        >
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 grid size-target -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink-900 bg-basalt-000 text-ink-900 shadow-sheet"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              className="size-5"
            >
              <path d="M9 7 4 12l5 5M15 7l5 5-5 5" strokeLinecap="butt" />
            </svg>
          </span>
        </div>
      </div>

      {/* §3.14 content rule — what changed and what it cost. */}
      <figcaption className="mt-3 font-mono text-datum uppercase text-fg-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
