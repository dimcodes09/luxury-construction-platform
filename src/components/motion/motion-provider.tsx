"use client";

import dynamic from "next/dynamic";

/* design.md §7.3 / SRS NFR-PERF-04 — "GSAP, Lenis, Three.js and the estimator
 * engine are DYNAMICALLY IMPORTED and ABSENT FROM THE SHARED BUNDLE."
 *
 * This wrapper is the boundary. It is tiny and lives in the shared bundle;
 * everything it pulls in — GSAP, ScrollTrigger, Flip, Lenis — lands in a
 * separate chunk fetched after hydration.
 *
 * ssr:false because the engine only ever touches the DOM, and rendering it on
 * the server would buy nothing while forcing GSAP into the server bundle too.
 */
const MotionEngine = dynamic(
  () => import("./motion-engine").then((mod) => mod.MotionEngine),
  { ssr: false },
);

export function MotionProvider() {
  return <MotionEngine />;
}
