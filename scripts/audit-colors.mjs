/* Colour audit.
 *
 * Two checks, both cheap and both catching bugs that are invisible in review:
 *
 * 1. UNDEFINED TOKENS. A class like `bg-basalt-850` looks plausible but that
 *    step does not exist in the §2.1.2 ramp, so Tailwind emits nothing and the
 *    element silently falls back to transparent. There is no error anywhere.
 *
 * 2. CONTRAST. §2.1.4 sets the pairs, §9.4 sets WCAG 2.2 AA as the target, and
 *    SRS NFR-A11Y-01 makes it a release gate. This verifies the ramp itself
 *    rather than trusting the table.
 *
 * Run with: npm run audit:colors
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/* ── the tokens that actually exist (styles/tokens/color.css + globals) ── */
const RAMP = {
  "basalt-950": "#0B0B09", "basalt-900": "#0E0E0C", "basalt-800": "#161613",
  "basalt-700": "#21211D", "basalt-600": "#3A3A34", "basalt-500": "#5C5C53",
  "basalt-400": "#8A8A7E", "basalt-300": "#B5B5A8", "basalt-200": "#D9D6CC",
  "basalt-100": "#EAE7DE", "basalt-050": "#F5F2ED", "basalt-000": "#FBFAF7",
  "ink-900": "#14140F", "ink-700": "#33332B", "ink-500": "#63635A", "ink-300": "#97978C",
  "brass-700": "#7D6229", "brass-600": "#96762F", "brass-500": "#B08D3F",
  "brass-400": "#C7A65C", "brass-300": "#DCC48F", "brass-100": "#F0E6CE",
  "kota-800": "#2A322E", "kota-600": "#3A423E", "kota-400": "#64706A", "kota-200": "#C3CBC6",
  "blueprint-700": "#1E3550", "blueprint-500": "#2B4B6F",
  "blueprint-300": "#7C9BBA", "blueprint-100": "#DCE6EF",
  "success-600": "#3E7A56", "success-100": "#E1F0E7",
  "warning-600": "#B4741F", "warning-100": "#FBEEDA",
  "danger-600": "#A63A2E", "danger-100": "#F8E3E0",
  "info-600": "#2B4B6F", "info-100": "#DCE6EF",
  whatsapp: "#128C7E",
};

const ALIASES = new Set([
  "canvas", "surface", "raised", "inverse", "technical",
  "fg", "fg-secondary", "fg-muted", "fg-accent", "fg-inverse",
  "hairline", "strong", "accent", "focus", "scrim", "skeleton",
  "background", "foreground", "card", "card-foreground", "popover",
  "popover-foreground", "primary", "primary-foreground", "secondary",
  "secondary-foreground", "muted", "muted-foreground", "accent-foreground",
  "destructive", "border", "input", "ring",
  "white", "black", "transparent", "current", "inherit",
]);

const VALID = new Set([...Object.keys(RAMP), ...ALIASES]);

/* ── check 1: undefined tokens ─────────────────────────────────────────── */

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

const UTILITY =
  /(?:bg|text|border|fill|stroke|from|to|via|ring|outline|decoration|accent|caret|divide|placeholder)-((?:basalt|ink|brass|kota|blueprint|success|warning|danger|info)-[a-z0-9]+)/g;

const undefinedTokens = new Map();

for (const file of walk("src")) {
  const source = readFileSync(file, "utf8");
  let match;
  while ((match = UTILITY.exec(source)) !== null) {
    const token = match[1];
    if (VALID.has(token)) continue;
    const rel = file.split(/[\\/]/).slice(1).join("/");
    if (!undefinedTokens.has(token)) undefinedTokens.set(token, new Set());
    undefinedTokens.get(token).add(rel);
  }
}

console.log("\nUndefined colour tokens (§2.1.2)");
console.log("─".repeat(64));
if (undefinedTokens.size === 0) {
  console.log("  none — every colour class maps to a real token");
} else {
  for (const [token, files] of [...undefinedTokens].sort()) {
    console.log(`  ${token.padEnd(18)} ${[...files].join(", ")}`);
  }
}

/* ── check 2: contrast (§2.1.4 / §9.4 WCAG 2.2 AA) ─────────────────────── */

const channel = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const luminance = (hex) =>
  0.2126 * channel(parseInt(hex.slice(1, 3), 16)) +
  0.7152 * channel(parseInt(hex.slice(3, 5), 16)) +
  0.0722 * channel(parseInt(hex.slice(5, 7), 16));

const contrast = (a, b) => {
  const [hi, lo] = [luminance(RAMP[a]), luminance(RAMP[b])].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/* Every foreground/background pair the site actually renders. `large` marks
 * pairs used only at display sizes, where AA is 3:1 rather than 4.5:1. */
const PAIRS = [
  ["ink-900", "basalt-050", "body text on canvas"],
  ["ink-700", "basalt-050", "secondary text on canvas"],
  ["ink-500", "basalt-050", "muted text and captions"],
  ["brass-700", "basalt-050", "accent link on canvas"],
  ["brass-700", "basalt-000", "accent link on surface"],
  ["basalt-050", "basalt-950", "text on hero"],
  ["basalt-300", "basalt-950", "secondary on hero"],
  ["brass-300", "basalt-950", "accent on hero"],
  ["basalt-300", "basalt-900", "footer body"],
  ["basalt-400", "basalt-900", "footer muted"],
  ["brass-300", "basalt-900", "footer accent"],
  ["blueprint-100", "blueprint-700", "estimator body"],
  ["basalt-050", "blueprint-700", "estimator heading"],
  ["brass-300", "blueprint-700", "estimator accent"],
  ["basalt-000", "brass-600", "accent button label", true],
  ["basalt-050", "whatsapp", "whatsapp button label", true],
  ["basalt-050", "danger-600", "danger button label", true],
];

console.log("\nContrast (§2.1.4 · WCAG 2.2 AA · §9.4)");
console.log("─".repeat(64));

let failures = 0;
for (const [fg, bg, label, large] of PAIRS) {
  const ratio = contrast(fg, bg);
  const threshold = large ? 3 : 4.5;
  const pass = ratio >= threshold;
  if (!pass) failures += 1;
  console.log(
    `  ${pass ? "PASS" : "FAIL"}  ${ratio.toFixed(2).padStart(6)}:1  ` +
      `(min ${threshold})  ${label}`,
  );
}

/* §2.1.4 hard rule: "brass-500 NEVER on text." Verified rather than trusted. */
const brassAsText = contrast("brass-500", "basalt-050");
console.log(
  `\n  brass-500 as text on canvas would be ${brassAsText.toFixed(2)}:1 — ` +
    "correctly banned by §2.1.4",
);

console.log("─".repeat(64));

const problems = undefinedTokens.size + failures;
if (problems > 0) {
  console.error(
    `\n✗ ${undefinedTokens.size} undefined token(s), ${failures} contrast failure(s)\n`,
  );
  process.exitCode = 1;
} else {
  console.log("\n✓ colour system clean\n");
}
