import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tailwindcss from "eslint-plugin-tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// design.md §2: "No raw hex values, no arbitrary pixel values, anywhere in
// component code." Enforced here rather than left to review — see CLAUDE.md.
const HEX_COLOR_PATTERN =
  "/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![0-9a-fA-F])/";
const HEX_COLOR_MESSAGE =
  "Raw hex colors are banned. Use a design token from styles/tokens/color.css (design.md §2.1) instead.";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      tailwindcss,
    },
    settings: {
      tailwindcss: {
        cssConfigPath: "./src/app/globals.css",
      },
    },
    rules: {
      "tailwindcss/no-arbitrary-value": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=${HEX_COLOR_PATTERN}]`,
          message: HEX_COLOR_MESSAGE,
        },
        {
          selector: `TemplateElement[value.raw=${HEX_COLOR_PATTERN}]`,
          message: HEX_COLOR_MESSAGE,
        },
      ],
    },
  },
  {
    /* Build-time Node scripts are not component code, and the CLAUDE.md rule is
     * scoped to component code. `scripts/make-dev-placeholders.mjs` encodes
     * palette values as raw bytes to emit PNGs — there is no token layer at
     * that level, and routing it through CSS would mean parsing our own
     * stylesheet to draw a placeholder.
     *
     * Deliberately narrow: this exempts scripts/ ONLY, and only this rule.
     * Nothing under src/ can reach it. */
    files: ["scripts/**/*.{js,mjs,cjs,ts}"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
