/* eslint-disable no-restricted-syntax -- see below */

/* The ONE place in src/ where raw hex is permitted, and the reason is
 * structural rather than convenience.
 *
 * CLAUDE.md bans raw hex "anywhere in component code" so that colour has a
 * single source of truth in styles/tokens/color.css. Email cannot participate
 * in that: mail clients do not support CSS custom properties, external
 * stylesheets, or `@theme`. Outlook does not even support `<style>` reliably.
 * Every colour has to be an inline literal in the markup.
 *
 * Rather than sprinkle literals through templates.ts — where they would be
 * unreviewable and would drift — every value lives here, mirrored from
 * design.md §2.1.2, with the token name it corresponds to. When a ramp changes,
 * this file is the one place to update, and a reviewer can diff it against
 * color.css in a few seconds.
 *
 * The disable is file-scoped and this file contains nothing but constants.
 */

export const EMAIL_PALETTE = {
  /** --basalt-050 · LIME WASH, the primary light surface */
  canvas: "#F5F2ED",
  /** --basalt-000 · highest light surface */
  surface: "#FBFAF7",
  /** --basalt-200 · light borders (the §2.5 hairline) */
  hairline: "#D9D6CC",
  /** --ink-900 · headings */
  heading: "#14140F",
  /** --ink-700 · body */
  body: "#33332B",
  /** --ink-500 · secondary / captions */
  muted: "#63635A",
  /** --brass-600 · accessible accent text on light (AA). NEVER brass-500 for
   *  text — §2.1.4 makes brass-500 a graphic colour only, 3.4:1 on basalt-050. */
  accent: "#96762F",
  /** --blueprint-500 · the technical layer. §2.1.1: when the reader sees
   *  Blueprint they are looking at engineering output, not marketing. Used for
   *  the estimate figure and nothing else. */
  technical: "#2B4B6F",
} as const;
