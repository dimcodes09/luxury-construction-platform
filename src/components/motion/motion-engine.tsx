"use client";

import { useEffect } from "react";

import {
  EASE,
  DUR,
  LENIS_CONFIG,
  LENIS_MIN_WIDTH,
  PATTERN_DEFAULTS,
  REDUCED_MOTION_QUERY,
} from "@/lib/motion/patterns";

/* design.md §7 — the single motion engine.
 *
 * §7.7 implementation note: "one useGSAP provider reads the DOM and wires
 * ScrollTriggers." Components never import GSAP; they declare intent with data
 * attributes and this file does the work. That is what keeps the §7.7 map and
 * the code from drifting.
 *
 * Four rules from §7.1 shape the whole design of this file:
 *
 *  5. "NEVER animate opacity from 0 on content required for the initial
 *     render." So anything already inside the viewport at init is left alone —
 *     it renders immediately and unanimated. Reveal only applies below the fold.
 *
 *  6. "Motion is a PROGRESSIVE ENHANCEMENT. The site is fully functional and
 *     correctly laid out with JavaScript disabled or GSAP failing to load. NO
 *     opacity: 0 IN THE BASE STYLESHEET on content — initial hidden states are
 *     applied by JS only AFTER GSAP confirms it is ready." Hence gsap.set()
 *     inside the effect, never a CSS class.
 *
 *  7. "prefers-reduced-motion: reduce disables ALL of it… a global kill switch,
 *     implemented once at the provider level." Here that means: we return before
 *     importing GSAP at all. Nothing is hidden, nothing is pinned, Lenis never
 *     starts. The page is simply the static layout.
 *
 * §7.3: GSAP and ScrollTrigger are DYNAMICALLY IMPORTED so they never reach the
 * shared bundle, and every tween lives in a gsap.context() that is reverted on
 * unmount — "orphaned ScrollTriggers in a Next.js App Router SPA are the
 * number-one source of scroll jank."
 */

type MotionElement = HTMLElement;

function num(el: MotionElement, attr: string, fallback: number): number {
  const raw = el.dataset[attr];
  const parsed = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** §7.1 rule 5 — is this element already on screen at first paint? */
function isAboveTheFold(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.9;
}

export function MotionEngine() {

  useEffect(() => {
    // §7.1 rule 7 — the global kill switch, checked before anything loads.
    const reduceQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    if (reduceQuery.matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      /* §7.3 / NFR-PERF-04 — dynamic import. GSAP, ScrollTrigger, Flip and
       * Lenis are absent from the shared bundle and load only here. */
      const [{ gsap }, { ScrollTrigger }, { Flip }, LenisModule] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("gsap/Flip"),
          import("lenis"),
        ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger, Flip);

      /* §7.5 — Lenis, DESKTOP ONLY, driven from the GSAP ticker with
       * lagSmoothing(0) so scroll position and ScrollTrigger stay in step. */
      const Lenis = LenisModule.default;
      let lenis: InstanceType<typeof Lenis> | undefined;

      const desktop = window.matchMedia(`(min-width: ${LENIS_MIN_WIDTH}px)`);
      const pointerFine = window.matchMedia("(pointer: fine)");

      if (desktop.matches && pointerFine.matches) {
        lenis = new Lenis({
          duration: LENIS_CONFIG.duration,
          smoothWheel: LENIS_CONFIG.smoothWheel,
          syncTouch: LENIS_CONFIG.syncTouch,
          touchMultiplier: LENIS_CONFIG.touchMultiplier,
        });

        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis?.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }

      /* NO SCOPE ELEMENT.
       *
       * gsap.context(fn, scope) scopes every selector string inside fn to that
       * element. This engine deliberately queries the WHOLE DOCUMENT, because
       * §7.7's registry pattern means the elements it animates live all over the
       * page tree, not inside the provider.
       *
       * Passing the provider's own ref as the scope silently narrowed every
       * query to an empty <div>, so gsap.utils.toArray() matched nothing and no
       * ScrollTrigger was ever created — the chunk loaded, the effect ran, and
       * nothing animated. context.revert() still tears everything down on
       * unmount without a scope, which is the only reason the scope was there. */
      const context = gsap.context(() => {
        /* ── M1 · Reveal ───────────────────────────────────────────────────
         * §7.2: y 24→0, opacity 0→1, --dur-slow, --ease-out, trigger 85%,
         * once. Grouped children stagger 60ms. */
        const reveals = gsap.utils.toArray<MotionElement>('[data-motion="M1"]');

        reveals.forEach((el) => {
          const childSelector = el.dataset.motionChildren;
          const targets: Element[] = childSelector
            ? Array.from(el.querySelectorAll(childSelector))
            : [el];

          if (targets.length === 0) return;

          /* §7.7 marks a few elements "On load" rather than scroll-triggered —
           * the hero sub and CTAs, the hero datum line. Those opt in explicitly;
           * everything else obeys §7.1 rule 5 and stays static above the fold. */
          const onLoad = el.dataset.motionOnload !== undefined;
          if (!onLoad && isAboveTheFold(targets[0]!)) return;

          const stagger =
            num(el, "motionStagger", PATTERN_DEFAULTS.M1.stagger * 1000) / 1000;
          const delay = num(el, "motionDelay", 0) / 1000;
          const start = el.dataset.motionStart ?? PATTERN_DEFAULTS.M1.start;

          gsap.set(targets, { opacity: 0, y: PATTERN_DEFAULTS.M1.y });

          const animate = (batch: Element[]) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: PATTERN_DEFAULTS.M1.duration,
              ease: PATTERN_DEFAULTS.M1.ease,
              stagger,
              delay,
              overwrite: true,
            });

          if (onLoad) {
            animate(targets);
          } else if (el.dataset.motionBatch !== undefined) {
            // §7.3 — card grids batch so a wide row fires as one group.
            ScrollTrigger.batch(targets, {
              start,
              once: true,
              batchMax: 3,
              onEnter: animate,
            });
          } else {
            ScrollTrigger.create({
              trigger: el,
              start,
              // §7.1 rule 4: "Nothing animates twice."
              once: true,
              onEnter: () => animate(targets),
            });
          }
        });

        /* ── M2 · Rule draw ────────────────────────────────────────────────
         * §7.2: scaleX 0→1, origin left, --dur-slow, --ease-standard.
         * "The identity's signature motion." */
        gsap.utils
          .toArray<MotionElement>('[data-motion="M2"]')
          .forEach((el) => {
            if (isAboveTheFold(el)) return;

            const delay = num(el, "motionDelay", 0) / 1000;
            const stagger = num(el, "motionStagger", 0) / 1000;
            const childSelector = el.dataset.motionChildren;
            const targets: Element[] = childSelector
              ? Array.from(el.querySelectorAll(childSelector))
              : [el];

            gsap.set(targets, { scaleX: 0, transformOrigin: "left center" });

            ScrollTrigger.create({
              trigger: el,
              start: el.dataset.motionStart ?? PATTERN_DEFAULTS.M2.start,
              once: true,
              onEnter: () =>
                gsap.to(targets, {
                  scaleX: 1,
                  duration: PATTERN_DEFAULTS.M2.duration,
                  ease: PATTERN_DEFAULTS.M2.ease,
                  delay,
                  stagger,
                  overwrite: true,
                }),
            });
          });

        /* ── M3 · Media parallax ───────────────────────────────────────────
         * §7.2: inner media translates -8% over the container's scroll range,
         * scrub 0.6. Hard cap of 2 elements per page, enforced here rather
         * than trusted to call sites. */
        gsap.utils
          .toArray<MotionElement>('[data-motion="M3"]')
          .slice(0, PATTERN_DEFAULTS.M3.maxPerPage)
          .forEach((el) => {
            const inner = el.querySelector('[data-motion-media]') ?? el.firstElementChild;
            if (!inner) return;

            const percent = Math.min(
              num(el, "motionParallax", PATTERN_DEFAULTS.M3.percent),
              PATTERN_DEFAULTS.M3.percent,
            );

            gsap.fromTo(
              inner,
              { yPercent: 0 },
              {
                yPercent: -percent,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: PATTERN_DEFAULTS.M3.scrub,
                },
              },
            );
          });

        /* ── FRAME · scrubbed scale-in ──────────────────────────────────────
         * An extension beyond the four §7.2 patterns, added deliberately for the
         * showcase band. It stays inside the system's constraints: transform and
         * opacity only (§7.3), the house curve, no overshoot, and scrubbed to
         * scroll so it can never play at a speed the user did not choose.
         *
         * The panel starts inset and slightly small, then settles to full width
         * as it reaches the middle of the viewport — the reference behaviour
         * from the Elva site: content arriving INTO a frame rather than sliding
         * past one. */
        gsap.utils
          .toArray<MotionElement>('[data-motion="frame"]')
          .forEach((el) => {
            const panel = el.querySelector<HTMLElement>("[data-motion-panel]");
            if (!panel) return;

            gsap.fromTo(
              panel,
              { scale: 0.88, yPercent: 6, opacity: 0.85 },
              {
                scale: 1,
                yPercent: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  end: "top 25%",
                  scrub: 0.6,
                },
              },
            );
          });

        /* ── M4 · Counter ──────────────────────────────────────────────────
         * §7.2 / §3.12: 0 → value over 900ms, once, tabular numerals so the
         * width never changes as it counts. */
        gsap.utils
          .toArray<MotionElement>('[data-motion="M4"]')
          .forEach((el) => {
            const value = num(el, "motionValue", NaN);
            if (!Number.isFinite(value)) return;

            const precision = num(el, "motionPrecision", 0);
            const counter = { current: 0 };
            const format = (n: number) =>
              n.toLocaleString("en-IN", {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
              });

            ScrollTrigger.create({
              trigger: el,
              start: PATTERN_DEFAULTS.M4.start,
              once: true,
              onEnter: () =>
                gsap.to(counter, {
                  current: value,
                  duration: PATTERN_DEFAULTS.M4.duration,
                  ease: PATTERN_DEFAULTS.M4.ease,
                  delay: num(el, "motionDelay", 0) / 1000,
                  onUpdate: () => {
                    el.textContent = format(counter.current);
                  },
                  onComplete: () => {
                    el.textContent = format(value);
                  },
                }),
            });
          });

        /* ── SVG draw ──────────────────────────────────────────────────────
         * §7.7 project detail §4: stroke-dashoffset draw, 1400ms
         * --ease-standard, stagger 200ms per drawing, once.
         * "THIS IS THE SIGNATURE MOMENT OF THE PAGE." */
        gsap.utils
          .toArray<MotionElement>('[data-motion="draw"]')
          .forEach((el) => {
            const strokes = Array.from(
              el.querySelectorAll<SVGGeometryElement>("path, line, polyline, rect, circle"),
            );
            if (strokes.length === 0) return;

            strokes.forEach((stroke) => {
              const length =
                typeof stroke.getTotalLength === "function"
                  ? stroke.getTotalLength()
                  : 0;
              if (!length) return;
              gsap.set(stroke, {
                strokeDasharray: length,
                strokeDashoffset: length,
              });
            });

            ScrollTrigger.create({
              trigger: el,
              start: PATTERN_DEFAULTS.draw.start,
              once: true,
              onEnter: () =>
                gsap.to(strokes, {
                  strokeDashoffset: 0,
                  duration: PATTERN_DEFAULTS.draw.duration,
                  ease: PATTERN_DEFAULTS.draw.ease,
                  stagger: PATTERN_DEFAULTS.draw.stagger,
                }),
            });
          });

        /* ── Horizontal scrub ──────────────────────────────────────────────
         * §7.7: BehindTheWall and the home process strip. DESKTOP ≥1024 ONLY —
         * §7.3 is explicit that "pinned horizontal scroll on mobile is a
         * usability disaster", and §4.17 makes the mobile form a vertical
         * timeline / native scroll-snap instead. */
        if (desktop.matches) {
          gsap.utils
            .toArray<MotionElement>('[data-motion="scrub-x"]')
            .forEach((el) => {
              const track = el.querySelector<HTMLElement>("[data-motion-track]");
              if (!track) return;

              const distance = track.scrollWidth - el.clientWidth;
              if (distance <= 0) return;

              gsap.to(track, {
                x: -distance,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: PATTERN_DEFAULTS.scrubX.start,
                  end: () => `+=${distance}`,
                  pin: true,
                  scrub: PATTERN_DEFAULTS.scrubX.scrub,
                  invalidateOnRefresh: true,
                },
              });
            });
        }
      });

      /* Dev-only handle so the motion map can be verified in the browser
       * without importing GSAP into a test. Stripped in production. */
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as Record<string, unknown>).__zyvoraMotion = {
          scrollTriggers: () => ScrollTrigger.getAll().length,
          triggers: () =>
            ScrollTrigger.getAll().map((t) => ({
              el: (t.trigger as HTMLElement | undefined)?.dataset?.motion ?? "?",
              tag: (t.trigger as HTMLElement | undefined)?.tagName ?? "?",
              start: t.start,
            })),
          lenis: Boolean(lenis),
        };
      }

      /* §7.3 — "ScrollTrigger.refresh() is called after any image load that
       * could change document height, and after route transitions, debounced."
       * Without this, a late-decoding hero pushes every trigger out of place. */
      let refreshTimer: ReturnType<typeof setTimeout> | undefined;
      const debouncedRefresh = () => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
      };

      const images = Array.from(document.images);
      images.forEach((image) => {
        if (!image.complete) image.addEventListener("load", debouncedRefresh);
      });
      window.addEventListener("resize", debouncedRefresh);

      cleanup = () => {
        clearTimeout(refreshTimer);
        window.removeEventListener("resize", debouncedRefresh);
        images.forEach((image) =>
          image.removeEventListener("load", debouncedRefresh),
        );
        context.revert();
        lenis?.destroy();
        gsap.ticker.lagSmoothing(500, 33);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  /* Renders nothing. All wiring happens against the live document in the effect
   * above; there is no scoping element, deliberately (see the note there). */
  return null;
}

/* Exported for components that need the raw values (the estimator's local step
 * transition, the toast, the drawer) without importing GSAP. */
export { DUR, EASE };
