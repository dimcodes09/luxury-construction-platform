/* design.md §7.2 — THE MOTION BUDGET. Four approved patterns. Nothing else.
 *
 * §7.7: "every entry lives in a single motion/ registry keyed by section ID, NOT
 * scattered through components. Components declare data-motion="M1" and
 * data-motion-stagger="60"; one useGSAP provider reads the DOM and wires
 * ScrollTriggers. This keeps the motion map and the code in sync — IF THEY
 * DIVERGE, THE MAP IS AUTHORITATIVE."
 *
 * §7.7 also states the rule that governs everything absent from the map:
 * "Anything not in this table does not animate. If a section is missing here,
 * it is static — THAT IS A DECISION, NOT AN OMISSION."
 *
 * This file is data only, so it can be imported by the server bundle for types
 * without dragging GSAP anywhere near it.
 */

export type PatternKey =
  | "M1" // Reveal
  | "M2" // Rule draw
  | "M3" // Media parallax
  | "M4" // Counter
  | "draw" // SVG stroke-dashoffset (project drawings — §7.7 "signature moment")
  | "scrub-x"; // Horizontal scrub (BehindTheWall, desktop only)

/** §2.6 motion tokens, mirrored in ms/curves for GSAP. */
export const DUR = {
  instant: 0.08,
  fast: 0.16,
  base: 0.28,
  slow: 0.48,
  cinema: 0.9,
} as const;

/* §2.6 — the house curves. There is NO spring or elastic entry here and there
 * must never be one: "Bouncy/elastic easing is BANNED — it reads playful and
 * undermines engineering credibility." */
export const EASE = {
  standard: "cubic-bezier(0.32, 0.72, 0, 1)",
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  in: "cubic-bezier(0.7, 0, 0.84, 0)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  linear: "none",
} as const;

/** §7.2 pattern defaults. Per-element overrides come from data attributes. */
export const PATTERN_DEFAULTS = {
  M1: {
    y: 24,
    duration: DUR.slow,
    ease: EASE.out,
    start: "top 85%",
    stagger: 0.06,
  },
  M2: {
    duration: DUR.slow,
    ease: EASE.standard,
    start: "top 85%",
  },
  M3: {
    /* §7.2: "Max 8% — anything more induces motion sickness and reveals edges.
     * NEVER ON MORE THAN 2 ELEMENTS PER PAGE." The cap is enforced in the
     * provider, not left to call sites. */
    percent: 8,
    scrub: 0.6,
    maxPerPage: 2,
  },
  M4: {
    duration: 0.9,
    ease: EASE.out,
    start: "top 85%",
  },
  draw: {
    duration: 1.4,
    ease: EASE.standard,
    stagger: 0.2,
    start: "top 75%",
  },
  scrubX: {
    scrub: 1,
    start: "top top",
  },
} as const;

/** §7.5 — Lenis. smoothTouch:false is mandatory and desktop-only is a gate. */
export const LENIS_CONFIG = {
  duration: 1.05,
  smoothWheel: true,
  /* §7.5: "smoothTouch: false is MANDATORY. Smooth scroll on touch fights
   * native momentum, feels broken, and is widely disliked." */
  syncTouch: false,
  touchMultiplier: 1,
} as const;

/** §9.1 — Lenis unlocks at lg, alongside 3D and pinned scroll. */
export const LENIS_MIN_WIDTH = 1024;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
