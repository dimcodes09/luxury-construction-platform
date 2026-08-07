# CLAUDE.md

Batch verification. Write the full feature, then run lint + tsc +
build + browser check ONCE at the end. Don't verify after each file.
Don't re-read files you just wrote.

Authoritative specs live in `docs/`: [design.md](docs/design.md) (experience & visual system), [SRS.md](docs/SRS.md) (functional/non-functional requirements), [implementationplan.md](docs/implementationplan.md) (phasing), [design-process.md](docs/design-process.md) (how to build it — design in the browser, mobile-first, in the specified step order). Read the relevant doc section before implementing anything non-trivial; this file is a summary, not a replacement.

No application code exists yet. This file exists so that when code starts, it starts inside these constraints rather than drifting from them.

## Stack (SRS §2.2)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js (App Router) 15.x | Server Components by default |
| Language | TypeScript 5.x | `strict: true`, no `any` |
| Styling | Tailwind CSS 4.x | Theme generated **from** CSS custom properties in `styles/tokens/*.css` — tokens are the source of truth, not Tailwind config |
| Components | shadcn/ui | Copied in, not a dependency |
| Animation | GSAP + ScrollTrigger + Flip, `@gsap/react` 3.13+ | Dynamically imported, never in the shared bundle |
| Smooth scroll | Lenis 1.x | Desktop only (`smoothTouch: false` is mandatory) |
| 3D | Three.js + React Three Fiber + Drei r170+/9.x | Exactly two surfaces only (design.md §7.4), code-split |
| Backend | Next.js Route Handlers + Server Actions | No separate API server |
| Database | MongoDB Atlas 7.x | Mongoose connection must be globally cached across lambda invocations |
| ODM | Mongoose 8.x | Schemas mirror SRS §5 exactly |
| Media | Cloudinary | All images and video; never served from the app origin |
| Auth | Better Auth | Admin only, roles: Owner / Manager / Editor |
| Email | Resend | Transactional + notifications |
| Analytics | PostHog (primary) + GA4 | Load after idle/interaction, gated on consent |
| Validation | Zod 3.x | Single schema shared client + server |
| Forms | React Hook Form + Zod resolver | |
| Rate limiting | Upstash Redis, MongoDB TTL fallback | |
| Hosting | Vercel | Edge network, ISR, image optimisation |
| Error tracking | Sentry | Non-negotiable for a lead-generating site |

## Hard rules (non-negotiable, lint/CI-enforced where possible)

- **No raw hex values, no arbitrary pixel values, anywhere in component code.** Every colour and size comes from `styles/tokens/*.css` via the Tailwind theme. This is a lint rule (Phase 3), not a suggestion.
- **Mobile-first.** Design and write classes for 375px first, then add `md:`/`lg:` to enhance — never the reverse (`text-2xl md:text-4xl`, never `text-6xl md:text-4xl sm:text-2xl`). Real design decisions happen at three breakpoints: 375 (base, single column), 768/`md` (1-up→2-up), 1024/`lg` (nav unlocks, 3D unlocks, Lenis turns on). 1280/1536 are polish only. Layout (column counts, nav) snaps at breakpoints; only type and space are fluid (`clamp()`).
- **Server Components by default.** Client components are the exception, justified by real interactivity needs — not a default.
- **All motion goes through the §7.7 motion map.** Only four approved patterns exist (design.md §7.2): **M1 Reveal**, **M2 Rule draw**, **M3 Media parallax** (max 8%, ≤2 elements/page), **M4 Counter**. Anything not listed in the §7.7 table for a given section does not animate — that's a decision, not an omission. Bouncy/elastic easing is banned; the house curve is `--ease-standard`. `prefers-reduced-motion: reduce` is a single global kill switch that must fully disable motion everywhere. Motion is added last (design-process.md Step 8), after every page already works statically.
- Design in the browser, not Figma — the token layer *is* the design tool (design-process.md §0).
- Order of work per design-process.md §2: Tokens → Type specimen → Greybox home → Hero → one finished vertical-slice project page → component extraction → page assembly → motion pass → polish pass. Do not skip the greybox step or write page-specific CSS to cover a component gap.
- Container queries for components that appear at multiple widths (e.g. `ProjectCard`); media queries for page layout only.
- Estimator numbers come from a deterministic pure-function rate engine — **never an LLM**. LLMs only narrate already-computed figures.
- AI provider calls are server-side only, behind the `ImageGenerationProvider` abstraction (SRS §7.1), with the provider chain: Gemini → Cloudflare Workers AI → Qwen (paid) → curated moodboard (never fails). Raw provider errors must never reach the client.

## Known deviations from the specs

Accepted, deliberate, and listed here so they are not silently rediscovered as bugs.

| Deviation | Spec | Why | Migration path |
|---|---|---|---|
| ~~Fonts load via `next/font/google`~~ — **RESOLVED**, now `next/font/local` per spec | design.md §2.2.1 | `next/font/google` fetches woff2 at compile time via Turbopack's native HTTP stack, which ignores Node's DNS resolver. On any network with a restricted resolver the font module fails to build (`Module not found: @vercel/turbopack-next/internal/font/google/font`) and **every page 500s** — a failure that reads nothing like DNS. Self-hosting removes the build-time network dependency entirely and is what §2.2.1 asked for anyway. | Done. Latin-subset variable cuts live in `src/styles/fonts/`: Fraunces 67.3KB + Inter 48.3KB + JetBrains Mono 40.4KB = **152.3KB / 190KB budget**. Fraunces and Inter are preloaded; mono is not (it carries no above-the-fold text). |
| `/dev/*` routes are excluded from production | — | The component gallery imports every Radix primitive at once; leaving it in would measure the shared-JS budget against code that never ships. `page.dev.tsx` is only a page extension in development (see [next.config.ts](next.config.ts)). | None needed. Add new dev-only routes as `page.dev.tsx`. |

## Performance budgets (SRS §8.1) — CI fails the build on breach

| Budget | Value |
|---|---|
| LCP | < 2.0s on mid-tier Android over 4G (home, service, project pages) |
| INP | < 200ms |
| CLS | < 0.05 |
| Shared first-load JS | < 130KB gzipped |
| Per-route additional JS | < 90KB |
| Fonts | ≤3 self-hosted woff2, ≤190KB total, `display: swap`, no Google Fonts CDN |
| First-viewport image weight | ≤1.4MB |
| Full-page image weight | ≤3.5MB |
| Lighthouse mobile | Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95 |
| GSAP / Lenis / Three.js / estimator engine | Dynamically imported, absent from shared bundle |
| Reference test device | 4GB-RAM mid-range Android, 360×640, throttled 4G — not a MacBook |

`npm run build` runs [scripts/check-bundle-budget.mjs](scripts/check-bundle-budget.mjs) and **exits non-zero** on breach. It measures gzipped JS (the budget is stated gzipped; raw bytes are ~3× and would fail a budget that is actually being met), taking "shared" as the intersection of chunk lists across every route in `app-build-manifest.json`. Run it alone with `npm run check:budget` after a build.

Note: `next build` and `next dev` share `.next/`, so running a build while the dev server is up corrupts it — restart the dev server afterwards.

## Local setup

```
cp .env.example .env.local     # fill in MONGODB_URI at minimum
npm run seed                   # reference data: settings, rate card, localities, services, FAQs
npm run seed:dev               # DEV-ONLY fixture projects (guarded; refuses NODE_ENV=production)
npm run placeholders           # regenerates public/dev/*.png (gitignored, ~1s)
npm run dev
```

`seed:dev` creates six projects with deliberately uneven data so FR-PROJ-01's conditional-section logic is exercised — `/work/wakad-flat-refresh` is the sparse one and must render **no** empty sections. Remove with `npm run seed:dev -- --clean`.

**If DNS is restricted** (sandboxes, some corporate networks): set `DNS_SERVERS=8.8.8.8,1.1.1.1` in `.env.local`. Applied by [scripts/dns-bootstrap.cjs](scripts/dns-bootstrap.cjs) (preloaded before Next starts) and by [connect.ts](src/lib/db/connect.ts) for Mongoose. Absent, nothing is overridden — on Vercel the platform resolver is correct.

## Banned words (design.md §10.1)

*bespoke* (except as a tier name), *cutting-edge*, *state-of-the-art*, *one-stop solution*, *dream home* (as a headline), *passion*, *journey*, *unlock*, *seamless*, *revolutionary*, *world-class*, *leading*, *premium* (demonstrate it, don't claim it).

Also: sentences under 20 words in body copy, under 10 in headings; every claim carries a number or a link to proof; Indian-English throughout (lakh, crore, sq ft — not million/square footage).

## Approved CTA lexicon (design.md §10.3)

CTAs map to the five-rung commitment ladder (design.md §0.5) — never present a rung-5 ask before a rung-3 value exchange on the same page.

| Rung | Approved | Banned |
|---|---|---|
| 2 | `Save to shortlist` · `Add to shortlist` | `Like` · `Favourite` |
| 3 | `Get a cost estimate` · `See the range` · `Estimate this project` | `Try our calculator` |
| 3 | `Redesign my room` · `See it restyled` | `Try AI` |
| 4 | `Email me this estimate` · `WhatsApp it to me` · `Download the spec sheet` | `Get it now` |
| 5 | `Book a site visit` · `Talk to a designer` · `Request a callback` · `Send us your plot details` | `Contact us` · `Get in touch` · `Enquire now` · `Submit` |
| Nav | `See our work` · `Read the process` | `Learn more` · `Click here` · `Explore` |

The estimator always shows its result **before** asking for contact details — gating the number is explicitly banned (design.md §0.5).
