# SOFTWARE REQUIREMENTS SPECIFICATION
## {{BRAND_NAME}} (working name: ZYVORA) — Premium Construction & Interiors Platform

**Version** 1.0 · **Date** 2026-08-07 · **Status** Approved for implementation
**Companion docs** `design.md` (experience & visual system), `implementationplan.md` (phasing)

---

## 1. INTRODUCTION

### 1.1 Purpose
This document specifies the complete functional and non-functional requirements for the {{BRAND_NAME}} web platform: a public marketing and lead-generation site, two AI-assisted tools, and an administrative back office. It is written to be implementable without further clarification. Where a requirement depends on a business decision not yet made, it is marked **[DECISION REQUIRED]** and cross-referenced to `design.md` §10.7.

### 1.2 Scope
**In scope (v1):** public website (26 route patterns), AI Cost Estimator, AI Design Assistant (room redesign), lead capture and management, content management, analytics instrumentation, transactional email, SEO infrastructure.

**Out of scope (v1), explicitly:** client login portal / project tracking for existing clients, online payments, native mobile apps, multi-language, a general-purpose chatbot (see `design.md` §5.4 for the recommended narrow alternative), 3D house configurator, e-commerce.

**Deferred to v1.1+ with reasoning:** client project-tracking portal (high value, but requires operational readiness first); Hindi/Marathi locale **[DECISION REQUIRED]**; grounded Answer Assistant (Phase 8b).

### 1.3 Definitions

| Term | Meaning |
|---|---|
| **Lead** | Any submission containing contact details |
| **Estimate** | One completed run of the cost estimator, stored whether or not it becomes a lead |
| **Generation** | One AI room-redesign job (produces 1–3 variant images) |
| **Rung** | Commitment-ladder level 1–5, `design.md` §0.5 |
| **Rate card** | The versioned table of per-sq-ft rates and multipliers driving the estimator |
| **Shortlist** | A device-local collection of saved projects/images, no account required |
| **Behind-the-wall** | Concealed-works photography (waterproofing, conduit, steel) captured before closure |
| **Tier** | Essential / Signature / Bespoke specification level |

### 1.4 Requirement ID convention
`FR-<AREA>-<n>` functional · `NFR-<AREA>-<n>` non-functional · `DM-<n>` data model · `INT-<n>` integration.
Priority: **P0** must ship in v1 · **P1** should ship in v1 · **P2** deferred.

---

## 2. SYSTEM OVERVIEW

### 2.1 Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  CLIENT (browser)                                                     │
│  Next.js App Router · React Server Components · Tailwind · shadcn/ui  │
│  Progressive enhancement layer: GSAP · Lenis · R3F (all dynamic)      │
└───────────────┬──────────────────────────────────────────────────────┘
                │ HTTPS
┌───────────────▼──────────────────────────────────────────────────────┐
│  NEXT.JS SERVER (Vercel)                                              │
│  ├─ RSC / SSG / ISR page rendering                                    │
│  ├─ Route Handlers  /api/*                                            │
│  ├─ Server Actions (forms, admin mutations)                           │
│  ├─ Middleware: auth guard · rate limit · security headers · geo hint │
│  └─ Edge cache + ISR revalidation                                     │
└──┬─────────┬─────────┬─────────┬──────────┬──────────┬───────────────┘
   │         │         │         │          │          │
┌──▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌─▼──────┐ ┌─▼──────┐ ┌─▼────────────┐
│Mongo │ │Cloud-  │ │Better  │ │Resend  │ │AI      │ │PostHog + GA4 │
│Atlas │ │inary   │ │Auth    │ │email   │ │Provider│ │analytics     │
│      │ │media   │ │        │ │        │ │(abstr.)│ │              │
└──────┘ └────────┘ └────────┘ └────────┘ └────────┘ └──────────────┘
                                              │
                    ┌─────────────────────────▼─────────────────────────┐
                    │  PROVIDER CHAIN (see §7.1)                        │
                    │  1. Gemini 2.5 Flash Image   — free, best quality │
                    │  2. Cloudflare Workers AI    — free, always-on    │
                    │  3. Qwen-Image-Edit (paid)   — Apache 2.0 escape  │
                    │  4. Curated moodboard        — never fails        │
                    └───────────────────────────────────────────────────┘
```

### 2.2 Technology stack (fixed per brief)

| Layer | Technology | Version target | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | 15.x | Server Components default |
| Language | TypeScript | 5.x | `strict: true`, no `any` |
| Styling | Tailwind CSS | 4.x | Theme generated from CSS custom properties |
| Components | shadcn/ui | latest | Copied in, not a dependency |
| Animation | GSAP + ScrollTrigger + Flip, `@gsap/react` | 3.13+ | Dynamically imported |
| Smooth scroll | Lenis | 1.x | Desktop only |
| 3D | Three.js + React Three Fiber + Drei | r170+ / 9.x | Two surfaces only, code-split |
| Backend | Next.js Route Handlers + Server Actions | — | No separate API server |
| Database | MongoDB Atlas | 7.x | M0 free tier acceptable for v1; M10 at scale |
| ODM | Mongoose | 8.x | Schemas mirror §5 exactly |
| Media | Cloudinary | — | All images and video |
| Auth | Better Auth | latest | Admin only |
| Email | Resend | — | Transactional + notifications |
| Analytics | PostHog + GA4 | — | PostHog primary, GA4 for Search Console linkage |
| Validation | Zod | 3.x | Single schema shared client + server |
| Forms | React Hook Form + Zod resolver | — | |
| Rate limiting | Upstash Redis (or MongoDB TTL fallback) | — | See NFR-SEC-05 |
| Hosting | Vercel | — | Edge network, ISR, image optimisation |
| Error tracking | Sentry | — | **Recommended addition** — not in the brief, but non-negotiable for a lead-generating site |

**Stack notes and one flag:**
- The brief fixes the stack and this SRS honours it. One caution: **MongoDB Atlas M0 (free) sleeps and has connection limits** that will cause cold-start failures on a production lead form. Budget for M10 (~$57/mo) or accept M2/M5. Losing a lead to a database timeout is the most expensive possible failure. **[DECISION REQUIRED]**
- Mongoose connection **must** be globally cached across lambda invocations (`global._mongoose`) — the standard serverless Mongoose pitfall.

---

## 3. USERS & ROLES

| Actor | Description | Authentication |
|---|---|---|
| **Visitor** | Anonymous public user | None. Device-local shortlist via `localStorage`. |
| **Identified visitor** | Has given name + one contact channel (rung 4) | None (no login); recognised by a first-party cookie |
| **Owner** | Business owner | Better Auth, email + password + 2FA (TOTP) |
| **Manager** | Sales/ops staff | Better Auth, email + password |
| **Editor** | Content contributor | Better Auth, email + password |
| **System** | Cron jobs, webhooks | Signed secret |

### Permission matrix

| Capability | Owner | Manager | Editor |
|---|---|---|---|
| View dashboard | ✓ | ✓ | ✓ (limited) |
| View / edit leads | ✓ | ✓ | ✗ |
| Delete leads | ✓ | ✗ | ✗ |
| Export leads CSV | ✓ | ✓ | ✗ |
| Manage projects | ✓ | ✓ | ✗ |
| Manage testimonials | ✓ | ✓ | ✓ |
| Manage journal | ✓ | ✓ | ✓ |
| Manage materials | ✓ | ✓ | ✗ |
| Edit rate card | ✓ | ✗ | ✗ |
| View AI usage | ✓ | ✓ | ✗ |
| Change AI settings | ✓ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ |
| Site settings | ✓ | ✗ | ✗ |

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Public site — global

| ID | Requirement | Priority |
|---|---|---|
| FR-GBL-01 | All public pages render meaningful HTML server-side; content must be present without JavaScript | P0 |
| FR-GBL-02 | Header exposes 5 nav items, a services panel, and one persistent conversion CTA on every page | P0 |
| FR-GBL-03 | Mobile viewports display a sticky CTA bar (WhatsApp + Estimate) after 40% scroll, on all pages except `/contact` | P0 |
| FR-GBL-04 | Desktop displays a WhatsApp contact dock with a named team member; dismissible, dismissal persists 30 days | P0 |
| FR-GBL-05 | All WhatsApp links are pre-filled with page context (page title, and project name where applicable) | P0 |
| FR-GBL-06 | All phone links use `tel:` with the E.164 number and fire a `phone_click` analytics event | P0 |
| FR-GBL-07 | A device-local shortlist persists across sessions in `localStorage`, capped at 50 items, with schema versioning for forward compatibility | P0 |
| FR-GBL-08 | Returning visitors with a saved shortlist or estimate see a dismissible resume prompt on the homepage; permanently dismissible | P1 |
| FR-GBL-09 | Every page emits the analytics events listed in `design.md` §10.6, including a `rung` dimension on all CTA clicks | P0 |
| FR-GBL-10 | A cookie/consent notice is presented before non-essential analytics load; analytics respect the choice | P0 |
| FR-GBL-11 | 404 and 500 pages render the designed editorial layouts with the phone number visible | P0 |
| FR-GBL-12 | All motion respects `prefers-reduced-motion: reduce` via a single global provider | P0 |
| FR-GBL-13 | Site search (⌘K / header field) queries projects, services, journal, materials and FAQs | P1 |

### 4.2 Home

| ID | Requirement | Priority |
|---|---|---|
| FR-HOME-01 | Render the 10 sections specified in `design.md` §4.1 in order | P0 |
| FR-HOME-02 | Hero renders a static poster image as LCP; video (if present) loads after and only at ≥768px | P0 |
| FR-HOME-03 | Stat band values are read from SiteSettings, not hard-coded, and animate once on first view | P0 |
| FR-HOME-04 | Selected Work displays 6 projects flagged `featured`, ordered by `featureOrder` | P0 |
| FR-HOME-05 | An inline 3-field mini-estimator carries its state into `/estimate` via URL parameters | P0 |
| FR-HOME-06 | The Google rating block displays live aggregate rating, review count, and the 3 most recent reviews, cached server-side for 6 hours with a stale-while-revalidate fallback to last-known values | P1 |
| FR-HOME-07 | Before/after section supports switching between at least 3 comparison pairs | P0 |

### 4.3 Portfolio

| ID | Requirement | Priority |
|---|---|---|
| FR-PORT-01 | `/work` lists all published projects with filters: type, locality, area band, budget band, year, style | P0 |
| FR-PORT-02 | Filter state is reflected in the URL query string; the page is fully server-rendered for any filter combination | P0 |
| FR-PORT-03 | Pagination via an explicit `Load more` control; **infinite scroll is prohibited** | P0 |
| FR-PORT-04 | Filter changes animate the grid via GSAP Flip on pointer devices; no animation under reduced motion | P1 |
| FR-PORT-05 | Filter combinations returning ≥6 results are indexable and self-canonical; thinner combinations canonicalise to `/work` | P1 |
| FR-PORT-06 | No-results state renders the designed empty state with a `Clear filters` action | P0 |
| FR-PORT-07 | Every project card exposes a shortlist toggle without navigating | P0 |

### 4.4 Project detail

| ID | Requirement | Priority |
|---|---|---|
| FR-PROJ-01 | Render the 13 sections in `design.md` §4.4, each conditionally omitted if its data is absent — the page must never show an empty section | P0 |
| FR-PROJ-02 | The fact table displays planned vs actual duration side by side | P0 |
| FR-PROJ-03 | Support 0–4 before/after pairs, each with scope, cost and duration captions | P0 |
| FR-PROJ-04 | Support a behind-the-wall image set with technical caption, date, and optional geotag per image | P0 |
| FR-PROJ-05 | Gallery opens a keyboard-navigable lightbox with project attribution | P0 |
| FR-PROJ-06 | Sticky rail at ≥1280px with shortlist, share, spec-sheet download, and a prefilled WhatsApp link | P1 |
| FR-PROJ-07 | Spec-sheet PDF is generated on demand from project data and requires name + one contact channel (rung 4) | P1 |
| FR-PROJ-08 | An inline estimator prefilled with this project's type and area appears in the cost-context section | P0 |
| FR-PROJ-09 | Related projects are matched by type, then area band, then locality; minimum 3, never showing the current project | P0 |
| FR-PROJ-10 | Interactive floor-plan SVG reveals room areas on hover/tap where drawings exist | P2 |
| FR-PROJ-11 | Emits `ImageObject` and `BreadcrumbList` structured data | P1 |

### 4.5 Services

| ID | Requirement | Priority |
|---|---|---|
| FR-SVC-01 | Nine service pages plus three group hubs plus an index, all from a single template | P0 |
| FR-SVC-02 | Each service page renders the 13 sections in `design.md` §4.6 | P0 |
| FR-SVC-03 | Included and excluded scope render with equal visual weight; the excluded list is mandatory and cannot be empty | P0 |
| FR-SVC-04 | Three pricing tiers per service, each with a per-sq-ft range, an audience line, 5 named specifications, and a worked example total | P0 |
| FR-SVC-05 | Tier ranges are read from the active rate card, so a rate-card change updates every service page | P0 |
| FR-SVC-06 | A loss-framed "what you avoid" panel appears immediately after pricing | P0 |
| FR-SVC-07 | Related projects filter automatically by service tag | P0 |
| FR-SVC-08 | Service FAQ emits `FAQPage` structured data | P0 |
| FR-SVC-09 | The renovation service page includes the Occupancy Timeline module | P1 |
| FR-SVC-10 | A commercial services page exists with SLA table, phasing capability, and a capability-deck download | P1 |

### 4.6 Process, About, Materials, Reviews, Gallery, FAQ

| ID | Requirement | Priority |
|---|---|---|
| FR-PRC-01 | `/process` renders all phases and steps with duration, responsible role, deliverables, and payment flags | P0 |
| FR-PRC-02 | The payment milestone map renders all milestones proportionally against the timeline with release conditions | P0 |
| FR-PRC-03 | Full process is downloadable as a PDF (rung 4 capture) | P1 |
| FR-ABT-01 | `/about` renders origin, commitments, team, credentials with viewable document thumbnails, stat band, and workplace imagery | P0 |
| FR-MAT-01 | `/materials` lists all published materials, filterable by category and tier; each opens a detail sheet | P1 |
| FR-MAT-02 | A material detail shows brand, grade, unit cost, rationale, linked projects, and the lower-tier alternative | P1 |
| FR-MAT-03 | 3D material explorer available at ≥1024px with a static-image fallback | P2 |
| FR-REV-01 | `/reviews` lists all testimonials filterable by service and locality, with the live Google feed and a rating distribution | P1 |
| FR-REV-02 | Emits `AggregateRating` and `Review` structured data | P1 |
| FR-GAL-01 | `/gallery` renders a masonry grid across all projects, filterable by **room type**, with a lightbox and per-image shortlisting | P1 |
| FR-GAL-02 | Every gallery image is independently shareable with a generated OG image | P2 |
| FR-FAQ-01 | `/faq` groups questions by category, uses native `details/summary` semantics, and emits `FAQPage` schema | P0 |

### 4.7 Journal

| ID | Requirement | Priority |
|---|---|---|
| FR-JRN-01 | Index with a featured article, a grid, and category filtering | P0 |
| FR-JRN-02 | Article pages support the approved block set: paragraph, heading, image+caption, pull-quote, cost table, spec callout, warning callout, checklist, before/after embed, project card embed, estimator embed | P0 |
| FR-JRN-03 | Reading progress indicator and sticky share rail (WhatsApp first) | P1 |
| FR-JRN-04 | Author byline plus an optional "Reviewed by" technical reviewer | P1 |
| FR-JRN-05 | Contextual end-of-article CTA selected by article category | P0 |
| FR-JRN-06 | Emits `Article` + `BreadcrumbList` structured data with author and reviewer | P0 |
| FR-JRN-07 | RSS feed at `/journal/rss.xml` | P2 |

### 4.8 Lead capture

| ID | Requirement | Priority |
|---|---|---|
| FR-LEAD-01 | `/contact` implements a 4-step progressive form; contact details are collected **last** | P0 |
| FR-LEAD-02 | Form state persists in `sessionStorage` and survives refresh and back navigation | P0 |
| FR-LEAD-03 | Budget step includes a "not sure yet" option | P0 |
| FR-LEAD-04 | Locality is prefilled from an IP-derived hint and is always editable | P1 |
| FR-LEAD-05 | WhatsApp opt-in defaults to on and is clearly labelled | P0 |
| FR-LEAD-06 | Validation runs on blur; after a field has errored it re-validates on change | P0 |
| FR-LEAD-07 | On network failure, all entered values are retained, a retry is offered, and a WhatsApp fallback link is shown | P0 |
| FR-LEAD-08 | Success renders a dedicated page stating what was received, who will respond, and by when | P0 |
| FR-LEAD-09 | Every lead is enriched with: source page, referrer, UTM parameters, device, all pages viewed, estimates run, projects shortlisted, and generations created | P0 |
| FR-LEAD-10 | Lead creation triggers a notification to configured recipients by email and optionally WhatsApp within 60 seconds | P0 |
| FR-LEAD-11 | The visitor receives an acknowledgement email containing a summary of their brief and a link to the process page | P0 |
| FR-LEAD-12 | Spam protection: honeypot field + time-to-complete check + server-side rate limit. **No CAPTCHA** — it measurably reduces genuine submissions and this audience is not technical | P0 |
| FR-LEAD-13 | Site-visit booking offers real available slots; slot availability is configurable in settings | P1 |
| FR-LEAD-14 | A shortlist can be converted into an enquiry with the saved items attached | P1 |
| FR-LEAD-15 | Duplicate detection: a submission with the same phone within 24h updates the existing lead rather than creating a new one | P1 |

### 4.9 AI Cost Estimator

| ID | Requirement | Priority |
|---|---|---|
| FR-EST-01 | 5-step flow per `design.md` §5.2, one question per screen on mobile | P0 |
| FR-EST-02 | Estimate values are computed by a **deterministic rate engine**, never by an LLM | P0 |
| FR-EST-03 | Output is a range with a most-likely value; a single point value must never be displayed alone | P0 |
| FR-EST-04 | Result displays inclusions and exclusions with equal visual weight; the exclusions list cannot be empty | P0 |
| FR-EST-05 | Result includes a cost breakdown by Structure / Finishes / MEP / Contingency / Design & PM, each with its own range | P0 |
| FR-EST-06 | Result displays all assumptions used, including rate-card version, regional multiplier, tier, and commodity rates | P0 |
| FR-EST-07 | An LLM generates a 3-paragraph plain-language explanation of what drives this number; if the LLM is unavailable a templated explanation renders instead and the numbers are unaffected | P0 |
| FR-EST-08 | The result is shown **before** any contact details are requested | P0 |
| FR-EST-09 | Result can be emailed or sent by WhatsApp after providing name + one channel (rung 4) | P0 |
| FR-EST-10 | Every estimate run is persisted with inputs, outputs, rate-card version, and completion status — including abandoned runs with the step reached | P0 |
| FR-EST-11 | Estimator state is encoded in the URL so a partial estimate is resumable and shareable | P1 |
| FR-EST-12 | Inputs outside supported bounds still produce an estimate, flagged low-confidence with an explanatory note | P0 |
| FR-EST-13 | Unserved localities produce an estimate with a logistics note, and the locality is recorded for expansion analysis | P1 |
| FR-EST-14 | Confidence label is derived from the count of comparable completed projects | P1 |
| FR-EST-15 | The estimator is embeddable as a compact widget in journal articles, service pages, and project pages, with prefilled context | P0 |
| FR-EST-16 | Rate limit: 20 estimates per IP per hour | P0 |
| FR-EST-17 | Emailed estimates are PDF attachments generated server-side, branded, containing all assumptions and the disclaimer | P1 |

#### 4.9.1 Rate engine specification

```
base        = rateCard.rate[projectType][tier]        // ₹/sq ft, {min, max}
regional    = rateCard.multiplier.locality[locality]  // e.g. Baner 1.08
floors      = 1 + (floors - 1) * 0.03                 // upper floors ~3% cheaper/costlier
addons      = Σ rateCard.addon[k].costPerUnit * qty   // absolute ₹, not per sq ft
soil/site   = rateCard.siteFactor[condition]          // default 1.00

subtotalMin = area * base.min * regional * floors
subtotalMax = area * base.max * regional * floors

structure   = subtotal * rateCard.split.structure     // 0.37
finishes    = subtotal * rateCard.split.finishes      // 0.33
mep         = subtotal * rateCard.split.mep           // 0.15
designPM    = subtotal * rateCard.split.designPM      // 0.08
contingency = subtotal * rateCard.split.contingency   // 0.07

total       = subtotal + addons
mostLikely  = totalMin + (totalMax - totalMin) * rateCard.likelyBias   // 0.5 default
confidence  = f(count of comparable completed projects, input bounds)
```

**Constraints**
- Splits must sum to 1.00; validated on rate-card save.
- Every rate card is versioned with an `effectiveFrom` date. Historical estimates store their `rateCardVersion` so any past estimate is exactly reproducible — required for dispute defence.
- Default rate bands are seeded from published 2026 India benchmarks (`design.md` R-11) and **must be overwritten with the business's real numbers before launch**. **[DECISION REQUIRED]**
- The engine is a pure function with no I/O, unit-tested with a fixture suite of ≥40 input/output pairs.

### 4.10 AI Design Assistant

| ID | Requirement | Priority |
|---|---|---|
| FR-AI-01 | 5-step flow per `design.md` §5.3 | P0 |
| FR-AI-02 | Accepts JPEG, PNG, HEIC up to 10MB; client-side downscale to 1536px longest edge before upload | P0 |
| FR-AI-03 | Room type selection is mandatory and constrains the generation prompt | P0 |
| FR-AI-04 | Six style options, each illustrated with the business's own project photography | P0 |
| FR-AI-05 | Optional free-text constraint field, sanitised and length-capped at 200 characters | P0 |
| FR-AI-06 | Generation is asynchronous with a job queue; the client polls or subscribes for status | P0 |
| FR-AI-07 | Status messages reflect **real** backend job state; fabricated progress is prohibited | P0 |
| FR-AI-08 | Waits exceeding 20 seconds surface an "email me when ready" option (rung 4) | P0 |
| FR-AI-09 | Produces up to 3 variants; renders each as a before/after against the original photo | P0 |
| FR-AI-10 | Output images carry no third-party watermark and are framed in the brand's own identity | P0 |
| FR-AI-11 | A "what we'd change to build this for real" panel accompanies results | P1 |
| FR-AI-12 | "Get this costed" carries room type, area and tier into the estimator and attaches the generated image to any resulting lead | P0 |
| FR-AI-13 | Server-side moderation runs on every upload before generation; rejections use neutral language | P0 |
| FR-AI-14 | Detected faces are blurred before generation | P1 |
| FR-AI-15 | Explicit consent checkbox covering retention (30 days), non-use for training, and non-publication without written permission | P0 |
| FR-AI-16 | Quota: 3 generations per visitor per 24h; 10 with a verified email. Enforced server-side by IP + fingerprint | P0 |
| FR-AI-17 | On quota exhaustion (ours or the provider's), a curated moodboard from real projects is shown with an "email it tomorrow" option. Raw provider errors must never surface | P0 |
| FR-AI-18 | The AI provider is accessed through an abstraction interface so the model can be swapped without UI changes | P0 |
| FR-AI-19 | Uploads and generations are deleted 30 days after creation by a scheduled job, unless flagged `showcase` by an admin | P0 |
| FR-AI-20 | Every generation is persisted with source image reference, prompt, style, provider, model, latency, cost, and outcome | P0 |
| FR-AI-21 | API keys are server-side only and never reach the client | P0 |
| FR-AI-22 | A persistent disclaimer states the output is an indicative visualisation, not a construction drawing | P0 |

### 4.11 Admin

| ID | Requirement | Priority |
|---|---|---|
| FR-ADM-01 | Authenticated admin at `/admin`, `noindex, nofollow`, excluded from sitemaps | P0 |
| FR-ADM-02 | Role-based access per §3 permission matrix, enforced server-side on every action | P0 |
| FR-ADM-03 | Dashboard renders the six widgets in `design.md` §6.3, ordered as specified | P0 |
| FR-ADM-04 | Lead list with filters and saved views (New today, Needs response, Hot, Quoted, Won, Lost) | P0 |
| FR-ADM-05 | Lead detail drawer shows the complete visitor journey: pages viewed, estimates, shortlist, generations | P0 |
| FR-ADM-06 | One-tap call, WhatsApp and email actions from both list and detail | P0 |
| FR-ADM-07 | Lead status pipeline with a mandatory reason on `Lost` | P0 |
| FR-ADM-08 | Notes with author and timestamp; notes are append-only | P0 |
| FR-ADM-09 | CSV export of filtered leads | P1 |
| FR-ADM-10 | Project CRUD with a structured editor mirroring the project page sections; free-form page building is prohibited | P0 |
| FR-ADM-11 | Media manager with drag-drop upload to Cloudinary, reordering, and alt-text entry | P0 |
| FR-ADM-12 | Alt-text completion meter per project; publishing is blocked below 90% alt coverage | P1 |
| FR-ADM-13 | Draft/published state with a shareable preview link for drafts | P0 |
| FR-ADM-14 | Before/after pairing validates matching aspect ratios and offers a crop tool on mismatch | P0 |
| FR-ADM-15 | Testimonial CRUD; the `verified` flag requires a source URL | P0 |
| FR-ADM-16 | Journal editor (Tiptap) restricted to the approved block set, with SEO fields, live meta preview, OG preview, and scheduled publishing | P0 |
| FR-ADM-17 | Material CRUD | P1 |
| FR-ADM-18 | AI usage view: quota gauge with reset time, cost tracker, recent generations gallery, quality flagging, and manual controls (pause, per-visitor cap, provider switch) | P0 |
| FR-ADM-19 | Estimator submissions list with inputs, outputs, conversion status, and an aggregate view including abandonment-by-step | P0 |
| FR-ADM-20 | Rate-card editor with validation (splits sum to 1.00), `effectiveFrom` dating, and version history | P0 |
| FR-ADM-21 | Settings: business details, team, service areas, notification recipients and channels, integrations, SEO defaults | P0 |
| FR-ADM-22 | User management with role assignment and invitation by email (Owner only) | P0 |
| FR-ADM-23 | All destructive actions are soft-deletes with a 10-second undo toast; hard deletion runs after 30 days | P0 |
| FR-ADM-24 | Audit log of all mutations: actor, action, entity, timestamp, before/after diff | P1 |
| FR-ADM-25 | Admin is fully usable on a 375px viewport | P0 |
| FR-ADM-26 | Content-health widget flags projects without before/after, testimonials without linked projects, and journal inactivity | P1 |
| FR-ADM-27 | Global `⌘K` command palette | P2 |

---

## 5. DATA MODEL

MongoDB via Mongoose. All collections carry `createdAt`, `updatedAt`, and `deletedAt` (soft delete, indexed sparse).

### DM-01 · Project
```ts
{
  _id, slug (unique, indexed),
  title, subtitle,
  type: 'new-construction'|'renovation'|'interiors'|'commercial'|'single-service',
  status: 'draft'|'published',
  featured: boolean, featureOrder: number,

  locality: string (indexed), city, state,
  builtUpArea: number, plotArea: number, floors: number,
  budgetBand: 'under-25L'|'25-50L'|'50L-1Cr'|'1Cr+',
  actualCostPerSqft: number | null,          // optional, shown only if permitted
  structuralSystem: string,

  plannedDurationDays: number,
  actualDurationDays: number,
  startDate: Date, completionDate: Date (indexed),

  services: [ServiceRef],                     // indexed, drives service-page filtering
  styles: [string],

  brief: { clientProblem, ourApproach },      // rich text
  heroImage: CloudinaryAsset,
  gallery: [{ asset, alt, roomType, caption, order }],
  drawings: [{ asset, type:'plan'|'section'|'elevation', floor, svgOverlay? }],
  beforeAfter: [{ before, after, caption, scope, cost, durationWeeks, order }],
  behindTheWall: [{ asset, caption, specification, capturedAt, geo? , order }],
  timeline: [{ label, date, asset?, note }],
  materials: [MaterialRef],
  testimonial: TestimonialRef | null,

  seo: { title, description, ogImage, canonical? },
  viewCount: number, shortlistCount: number
}
```
Indexes: `{slug:1}` unique · `{status:1, featured:-1, featureOrder:1}` · `{type:1, locality:1, budgetBand:1}` · `{services:1}` · `{completionDate:-1}`

### DM-02 · Service
```ts
{
  _id, slug (unique), name, group: 'build'|'transform'|'finish'|'commercial',
  order: number, status,
  headline, definition, icon,
  scenarios: [{ title, body }],                    // "is this you?"
  included: [string], excluded: [string],          // excluded MUST be non-empty
  tiers: [{ name:'Essential'|'Signature'|'Bespoke',
            audience, specifications: [string],    // exactly 5
            rateKey: string,                       // resolves against rate card
            recommended: boolean }],
  avoidancePanel: [{ title, consequence, rupeeImpact }],
  process: [{ step, title, body, durationDays, paymentPoint: boolean }],
  faqs: [FAQRef],
  seo: {...}
}
```

### DM-03 · Lead
```ts
{
  _id,
  name, phone (indexed), whatsappOptIn: boolean, email?,
  projectType, locality, area?, timeline, budgetBand, message?,

  source: { page, referrer, utm:{source,medium,campaign,term,content}, device, browser },
  journey: {
    sessionId, pagesViewed: [{path, at, dwellMs}],
    estimateIds: [EstimateRef],
    shortlistItems: [{type:'project'|'image', ref}],
    generationIds: [GenerationRef],
    firstSeenAt, totalSessions
  },

  status: 'new'|'contacted'|'visit-booked'|'visit-done'|'quoted'|'won'|'lost',
  lostReason?: string,                          // required when status = lost
  assignedTo: UserRef?,
  notes: [{ body, author, at }],                // append-only
  statusHistory: [{ from, to, by, at }],
  firstResponseAt?: Date,                       // powers the median-response metric
  siteVisitAt?: Date,
  isCommercial: boolean,
  spamScore: number
}
```
Indexes: `{createdAt:-1}` · `{status:1, createdAt:-1}` · `{phone:1}` · `{assignedTo:1, status:1}`

### DM-04 · Estimate
```ts
{
  _id, sessionId (indexed),
  inputs: { projectType, locality, city, area, floors, tier, addons:[string] },
  outputs: {
    min, max, mostLikely, perSqft,
    breakdown: { structure:{min,max}, finishes:{...}, mep:{...},
                 designPM:{...}, contingency:{...} },
    confidence: 'high'|'medium'|'low', comparableProjectCount: number
  },
  assumptions: { rateCardVersion, regionalMultiplier, baseRate, commodityRates },
  narration: string?,                            // LLM output, nullable
  completed: boolean, abandonedAtStep: number?,
  contactCaptured: boolean, leadId: LeadRef?,
  sentVia: ['email'|'whatsapp'],
  ip_hash, userAgent
}
```

### DM-05 · Generation
```ts
{
  _id, sessionId (indexed),
  sourceImage: CloudinaryAsset, sourceImageDeleteAt: Date (TTL index),
  roomType, style, freeText?,
  prompt: string,                                // the exact prompt sent
  provider: string, model: string,
  status: 'queued'|'moderating'|'generating'|'complete'|'failed'|'quota-exceeded',
  variants: [{ asset, order }],
  latencyMs: number, costPaise: number,
  moderationResult: { passed: boolean, reason? },
  qualityFlag: 'good'|'poor'|null,               // admin-set
  showcase: boolean,                             // exempts from TTL deletion
  errorCode?, leadId?: LeadRef,
  ip_hash, fingerprint
}
```

### DM-06 · RateCard
```ts
{
  _id, version: number, effectiveFrom: Date, active: boolean,
  rates: { [projectType]: { [tier]: { min, max } } },      // ₹/sq ft
  localityMultipliers: { [locality]: number },
  siteFactors: { [condition]: number },
  addons: [{ key, label, unit, costPerUnit }],
  splits: { structure, finishes, mep, designPM, contingency }, // must sum to 1.00
  commodityRates: { steelPerKg, cementPerBag, sandPerBrass, bricksPerThousand },
  likelyBias: number,
  createdBy: UserRef
}
```

### DM-07 · Testimonial
```ts
{ _id, clientName, clientPhoto?, quote, rating: 1-5,
  project: ProjectRef?, services: [ServiceRef], locality,
  date: Date, source: 'google'|'direct'|'video',
  sourceUrl?,                                   // required when verified = true
  verified: boolean, video?: CloudinaryAsset,
  featured: boolean, order: number, status }
```

### DM-08 · Article
```ts
{ _id, slug (unique), title, excerpt, category, tags: [string],
  author: UserRef, reviewedBy: UserRef?,
  heroImage, blocks: [Block],                   // typed union, approved set only
  readTimeMinutes, status, publishedAt: Date, scheduledFor: Date?,
  seo: {...}, viewCount, relatedServices: [ServiceRef] }
```

### DM-09 · Material
```ts
{ _id, slug, name, category, tier, brand, grade,
  macroImage, textureMaps?: { albedo, normal, roughness },   // 3D explorer
  unitCost, unit, rationale, alternative: { name, tradeoff },
  usedIn: [ProjectRef], status, order }
```

### DM-10 · Other collections
`User` (Better Auth managed + `role`, `phone`, `photo`, `bio`, `tenureFrom`) ·
`FAQ` `{question, answer, category, services[], order, status}` ·
`Locality` `{slug, name, city, notes, soilType, commonTypologies, status}` ·
`SiteSettings` (singleton: business details, stats, notification config, integrations, SEO defaults, AI config) ·
`AuditLog` `{actor, action, entity, entityId, diff, at}` ·
`Subscriber` `{email, source, confirmedAt, unsubscribedAt}`

---

## 6. API SURFACE (Route Handlers & Server Actions)

Server Actions are preferred for form mutations (progressive enhancement, no client fetch code). Route Handlers are used where a stable HTTP endpoint is needed (webhooks, polling, embeds, feeds).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/leads` | none + rate limit | Create a lead (also exposed as a Server Action) |
| POST | `/api/estimate` | none + rate limit | Compute and persist an estimate |
| POST | `/api/estimate/narrate` | none + rate limit | LLM narration; failure is non-blocking |
| POST | `/api/estimate/send` | none + rate limit | Email/WhatsApp an estimate; captures contact |
| GET | `/api/estimate/[id]/pdf` | none | Branded estimate PDF |
| POST | `/api/design/upload` | none + quota | Signed Cloudinary upload; returns an asset ref |
| POST | `/api/design/generate` | none + quota | Enqueue a generation job |
| GET | `/api/design/status/[id]` | none | Poll job status |
| POST | `/api/design/notify` | none | Register for "email me when ready" |
| GET | `/api/reviews/google` | none, cached 6h | Proxied Google Business Profile reviews |
| GET | `/api/search` | none | Site search |
| POST | `/api/subscribe` | none + rate limit | Newsletter |
| POST | `/api/shortlist/share` | none | Create a short URL for a shortlist |
| GET | `/api/og/[type]/[id]` | none | Dynamic OG image generation |
| POST | `/api/webhooks/cloudinary` | signed | Media processing callbacks |
| POST | `/api/cron/cleanup` | signed | TTL deletion of uploads/generations |
| POST | `/api/cron/digest` | signed | Daily lead digest email |
| ALL | `/api/admin/*` | session + role | Admin CRUD (mostly Server Actions) |

**Conventions:** all inputs validated with Zod on the server regardless of client validation · errors return `{error: {code, message}}` with the message safe to display · no stack traces or provider errors ever reach the client · all mutating endpoints check origin.

---

## 7. AI INTEGRATION SPECIFICATION

### 7.1 Provider abstraction (INT-01)
```ts
interface ImageGenerationProvider {
  readonly name: string;
  readonly model: string;
  generate(input: {
    sourceImageUrl: string;
    roomType: RoomType;
    style: StyleKey;
    constraints?: string;
    variantCount: number;
  }): Promise<{ images: Buffer[]; latencyMs: number; costPaise: number }>;
  checkQuota(): Promise<{ remaining: number|null; resetsAt: Date|null }>;
}
```
#### Provider evaluation (August 2026)

The controlling requirement for room redesign is **geometry preservation**: the output must keep the room's walls, windows, ceiling height and camera viewpoint, and change only finishes, furniture, lighting and decor. A model that produces a beautiful but *different* room is worthless here — the client's whole question is "what would **my** room look like."

That splits the field into two technical approaches:

- **Instruction-based editing** (Gemini Nano Banana, FLUX.1 Kontext, Qwen-Image-Edit) — you give it the photo and a sentence. Best geometry preservation, least engineering effort. **Recommended.**
- **Diffusion + structural conditioning** (SDXL + ControlNet depth/MLSD) — the classic RoomGPT recipe. MLSD is a line-segment detector built for architectural straight lines, so it holds walls well, but it needs a preprocessing pipeline and much more tuning.

| Option | Cost | Quality for this job | Licence | Verdict |
|---|---|---|---|---|
| **Gemini 2.5 Flash Image ("Nano Banana")** | Free tier, ~500 req/day API, 250k TPM, resets midnight PT | **Best.** Native instruction editing, strong at "change the style, keep the room" | Google API ToS | **Primary.** Best quality-per-effort at zero cost. |
| **Cloudflare Workers AI** | **10,000 Neurons/day, free, ongoing — not a trial. No card required. Resets 00:00 UTC.** Overage $0.011/1k Neurons | Good. Hosts SD 1.5 img2img, SD inpainting, SDXL-Lightning, FLUX. Geometry needs a low-denoise + prompt-anchoring strategy | Per-model | **Secondary — and strategically the most important choice we make.** It is the only *genuinely free, ongoing, no-card* image API in the 2026 landscape, and it is a different company from Google, so a Google quota cut cannot take both out. |
| **Qwen-Image / Qwen-Image-Edit** (Alibaba) | Paid per-image via DeepInfra / fal / SiliconFlow, roughly ₹1–3 per image | Very good. 2K native output, strong instruction following | **Apache 2.0 — fully commercial-permissive** | **Paid escape hatch.** The licensing is the cleanest of any model available. Switch to this when volume justifies spend. |
| **FLUX.1 Kontext [dev]** | Free weights; paid via fal/Replicate | Excellent instruction editing, best-in-class structure preservation | ⚠️ **Non-commercial licence on [dev]** — commercial use requires Kontext Pro/Max or a paid licence | **Do not use [dev] in production.** Flagged because it is the most-recommended model online and the licence trap is easy to miss. |
| **SDXL + ControlNet (MLSD/depth)** | Free if self-hosted; GPU cost otherwise | Best geometry control, but heaviest engineering | Open | **Not v1.** Revisit only if instruction models prove insufficient. |
| **Replicate** | **No free tier.** Pay-per-use, small signup credit | Model-dependent | — | Convenient for prototyping, not for a free product. |
| **Hugging Face Inference Providers** | Free tier ≈ **$0.10/month** credits; PRO $9/mo ≈ $2 credits | Model-dependent | — | **Not viable at volume.** Useful for evaluation only. |
| **fal.ai / Together** | Trial credits only | Good | — | Prototyping. |

#### The recommended chain (INT-01a)

```
1. Gemini 2.5 Flash Image     ← free, best quality       (until daily cap)
2. Cloudflare Workers AI      ← free, ongoing, no card   (until neuron cap)
3. Qwen-Image-Edit  [OPTIONAL]← paid, Apache 2.0         (admin-enabled only)
4. Curated moodboard          ← zero dependency          (never fails)
```

**Why a chain and not one provider:** the December 2025 free-tier cuts (reported up to 92% on some Gemini models) proved that a single free provider is not a foundation. Two *independent companies* plus a zero-dependency fallback means the feature degrades but never breaks. This is the whole reason `ImageGenerationProvider` (§7.1) exists as an interface rather than a direct API call.

**Operational requirements arising from this:**
- Cloudflare "ships new Workers AI models weekly and **retires older ones without notice**" — the model ID must be a configuration value in admin, never a hard-coded constant, and a model-not-found error must fall through to the next provider rather than surfacing.
- Quota state is **read at runtime**, never assumed.
- Provider order and per-provider enable/disable are admin-editable without a deploy (FR-ADM-18).
- Every generation records which provider served it, so quality can be compared per provider in the admin AI usage view.
- Budget line to consider: at ~₹2/image via Qwen, 1,500 generations/month ≈ ₹3,000/month. That is the realistic cost of removing free-tier risk entirely. **[DECISION REQUIRED]**

### 7.2 Prompt construction
Prompts are assembled server-side from templates. The user's free text is inserted only into a constrained slot and never as raw instruction:

```
Restyle this {roomType} photograph in a {styleName} interior style.
STRICT: preserve the room's existing architecture — wall positions,
window and door locations, ceiling height, and camera viewpoint must
not change. Change only furniture, finishes, colour, lighting and decor.
Style reference: {styleDescription}
Client constraints: {sanitisedUserText}
Output: photorealistic, natural daylight, architectural photography,
no text, no watermark, no people.
```
Prompt templates are versioned and stored so any past generation is reproducible and prompt changes can be A/B evaluated.

### 7.3 Estimator narration (INT-02)
A small, cheap text model produces the "what moves this number" explanation. It receives the *computed* figures as facts and is instructed to explain, never to calculate. Temperature ≤0.4. Output length-capped. **If narration fails, the estimate renders without it** — FR-EST-07.

### 7.4 Moderation (INT-03)
Every upload passes a moderation check before generation: NSFW, minors, violence, and personal-identity content. On rejection: a neutral message ("we can only work with photographs of rooms and interiors"), no generation, and an incident log entry.

### 7.5 Cost control
- Per-visitor caps enforced server-side (FR-AI-16).
- A global daily cap configurable in admin, defaulting below the provider's free quota so we hit *our* limit first and can present our own message.
- Every generation records `costPaise` even when zero, so a future migration to a paid tier has a baseline.
- Alert to the owner's email when 80% of the daily cap is reached.

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### 8.1 Performance

| ID | Requirement |
|---|---|
| NFR-PERF-01 | LCP < 2.0s on a mid-tier Android over 4G, on the home, service, and project pages |
| NFR-PERF-02 | INP < 200ms; CLS < 0.05 |
| NFR-PERF-03 | Shared first-load JS < 130KB gzipped; per-route additional < 90KB |
| NFR-PERF-04 | GSAP, Lenis, Three.js and the estimator engine are dynamically imported and absent from the shared bundle |
| NFR-PERF-05 | Fonts: ≤3 self-hosted woff2 files, ≤190KB total, `display: swap`, critical weights preloaded |
| NFR-PERF-06 | First-viewport image weight ≤1.4MB; full-page ≤3.5MB |
| NFR-PERF-07 | Lighthouse mobile: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95 |
| NFR-PERF-08 | Project and journal pages use ISR with a 3600s revalidation; services and process are fully static |
| NFR-PERF-09 | Third-party scripts (PostHog, GA4, Maps) load after idle or on interaction, never on the critical path |
| NFR-PERF-10 | Budgets are enforced in CI; a build exceeding any budget fails |
| NFR-PERF-11 | Mongoose connections are cached globally across serverless invocations |
| NFR-PERF-12 | The 3D canvas pauses when off-screen or when the document is hidden; `dpr` capped at 1.75 |

### 8.2 Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | HTTPS only; HSTS with `max-age=31536000; includeSubDomains; preload` |
| NFR-SEC-02 | CSP with `default-src 'self'`, explicit allowlists for Cloudinary, PostHog, GA4 and fonts; `frame-ancestors 'none'`; nonce-based inline scripts |
| NFR-SEC-03 | Additional headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera/mic/geolocation except where used |
| NFR-SEC-04 | All input validated server-side with Zod; all output escaped; rich-text sanitised with an allowlist on save **and** on render |
| NFR-SEC-05 | Rate limits: leads 5/hour/IP · estimates 20/hour/IP · generations 3/24h/visitor · auth 5 attempts/15min/IP with exponential backoff |
| NFR-SEC-06 | Admin sessions expire after 7 days idle; 2FA (TOTP) mandatory for Owner, optional for others |
| NFR-SEC-07 | All secrets in environment variables; no secret in the client bundle; AI keys server-side only |
| NFR-SEC-08 | File uploads validated by magic bytes, not extension; size-capped; served from Cloudinary, never from the application origin |
| NFR-SEC-09 | MongoDB Atlas IP allowlist restricted to Vercel egress; database user has least privilege |
| NFR-SEC-10 | NoSQL injection prevented: all queries use parameterised Mongoose methods; no user input reaches an operator position |
| NFR-SEC-11 | Admin routes protected by middleware; every Server Action independently re-checks role — never trust the client |
| NFR-SEC-12 | Dependency scanning in CI; automated security updates |
| NFR-SEC-13 | Audit log for all admin mutations (FR-ADM-24) |
| NFR-SEC-14 | Soft delete with 30-day retention before hard delete |

### 8.3 Privacy & compliance (India DPDP Act 2023)

| ID | Requirement |
|---|---|
| NFR-PRIV-01 | Privacy policy stating what is collected, why, retention periods, and third-party processors |
| NFR-PRIV-02 | Consent obtained before non-essential analytics; consent state persisted and honoured |
| NFR-PRIV-03 | Uploaded room photos deleted after 30 days unless flagged showcase; stated at the point of upload |
| NFR-PRIV-04 | Explicit consent that uploads are not used for model training |
| NFR-PRIV-05 | A documented process for data access and deletion requests, with an email route published in the policy |
| NFR-PRIV-06 | IP addresses stored hashed, never in plaintext |
| NFR-PRIV-07 | Lead data retained 36 months after last contact, then anonymised |
| NFR-PRIV-08 | No sale or transfer of personal data to third parties; stated in the policy and in form microcopy |
| NFR-PRIV-09 | Cookie inventory documented and kept current |

### 8.4 Accessibility

| ID | Requirement |
|---|---|
| NFR-A11Y-01 | WCAG 2.2 Level AA across all public pages and the admin panel |
| NFR-A11Y-02 | Automated axe-core checks in CI on every route; zero critical or serious violations |
| NFR-A11Y-03 | Manual screen-reader pass (NVDA + VoiceOver) per phase |
| NFR-A11Y-04 | Complete keyboard operability, including the before/after slider, carousels, lightbox and 3D fallback |
| NFR-A11Y-05 | Full `prefers-reduced-motion` support |
| NFR-A11Y-06 | Usable at 200% zoom and at 320px width with no horizontal scroll |
| NFR-A11Y-07 | Video captions on all speech content |

### 8.5 SEO

| ID | Requirement |
|---|---|
| NFR-SEO-01 | All indexable content server-rendered |
| NFR-SEO-02 | Unique, hand-written title and meta description on every page |
| NFR-SEO-03 | Structured data per `design.md` §10.5; validated against Rich Results Test in CI |
| NFR-SEO-04 | Auto-generated sitemaps split by type, plus `robots.txt` |
| NFR-SEO-05 | Canonical URLs on every page; filter combinations handled per FR-PORT-05 |
| NFR-SEO-06 | `/admin/*`, `/shortlist`, `/api/*` are `noindex, nofollow` |
| NFR-SEO-07 | OG and Twitter cards on every page, with dynamically generated OG images for projects and articles |
| NFR-SEO-08 | Core Web Vitals within §8.1 budgets (a ranking factor) |
| NFR-SEO-09 | `LocalBusiness`/`GeneralContractor` schema with accurate NAP, hours, `areaServed` and geo |
| NFR-SEO-10 | No duplicate content across locality pages; each must contain genuinely locality-specific material |

### 8.6 Reliability & operations

| ID | Requirement |
|---|---|
| NFR-OPS-01 | Uptime target 99.9% |
| NFR-OPS-02 | Lead submission must never be lost: on database failure, write to a durable fallback queue and alert; the user always sees success if the data is safely captured |
| NFR-OPS-03 | Error tracking (Sentry) with alerting on lead-path errors |
| NFR-OPS-04 | Uptime monitoring on `/`, `/contact` and `/api/leads` at 5-minute intervals |
| NFR-OPS-05 | Automated daily MongoDB backups with 30-day retention; restore tested once before launch |
| NFR-OPS-06 | AI provider failures degrade gracefully and never surface as application errors |
| NFR-OPS-07 | Preview deployments for every pull request |
| NFR-OPS-08 | A documented rollback procedure, exercisable in under 5 minutes |
| NFR-OPS-09 | Daily lead digest email to the owner even when there are no leads (absence of the email signals a failure) |

### 8.7 Browser & device support

| Target | Support level |
|---|---|
| Chrome / Edge (last 2) | Full |
| Safari 16+ (iOS & macOS) | Full |
| Firefox (last 2) | Full |
| Samsung Internet (last 2) | Full — **significant share of this audience** |
| Chrome on Android 10+, 4GB RAM | Full, with 3D gated off |
| iOS Safari 15 | Functional, degraded motion |
| IE11 / legacy Edge | Not supported |

Device floor for testing: a 4GB-RAM mid-range Android at 360×640 on throttled 4G. **This device, not a MacBook, is the reference target for all performance decisions.**

---

## 9. INTEGRATIONS

| ID | Service | Purpose | Failure behaviour |
|---|---|---|---|
| INT-04 | Cloudinary | All image/video storage, transformation, delivery | Uploads fail with a clear admin message; existing media unaffected |
| INT-05 | Resend | Lead notifications, acknowledgements, estimate delivery, digests | Queue and retry 3× with backoff; alert on final failure. **A failed lead notification is a P0 incident.** |
| INT-06 | Google Business Profile | Live reviews and rating | Serve last-known cached values; never show an error |
| INT-07 | PostHog | Product analytics, funnels, session replay on the estimator | Silent failure; must never block rendering |
| INT-08 | GA4 | Search Console linkage, broad traffic reporting | Silent failure |
| INT-09 | WhatsApp (`wa.me` deep links) | Primary contact channel | Static links; no API dependency in v1 |
| INT-10 | Google Maps | Office location | Static map image until user interaction |
| INT-11 | Better Auth | Admin authentication | Standard auth failure handling |
| INT-12 | Upstash Redis | Rate limiting and job queue | Falls back to MongoDB TTL-based limiting |

**Note on WhatsApp:** v1 uses `wa.me` deep links only — zero cost, zero approval process, works immediately. The WhatsApp Business API (for automated outbound notifications) is a v1.1 consideration requiring business verification and per-message costs. **[DECISION REQUIRED]**

---

## 10. ACCEPTANCE CRITERIA (release gates)

The build is releasable only when **all** of the following hold:

1. All **P0** requirements implemented and verified.
2. Lighthouse mobile ≥90 / ≥95 / ≥95 / ≥95 on home, a service page, and a project page.
3. Zero critical or serious axe-core violations across all public routes.
4. All seven user journeys (`design.md` §4.16) completable end to end on a real mid-range Android device over throttled 4G.
5. Lead submission verified under: normal conditions, network failure, database failure, and duplicate submission.
6. Estimator verified against a 40-case fixture suite; every output reproducible from its stored `rateCardVersion`.
7. AI Design Assistant verified under: success, slow generation (>20s), moderation rejection, our quota exceeded, and provider quota exceeded.
8. Admin usable end to end on a 375px viewport by a non-technical user in an observed session.
9. Structured data validates without errors for all schema types.
10. Backup restore tested successfully.
11. All placeholder brand tokens replaced with real values; every published statistic verified as true by the business owner.
12. Rate card populated with the business's real rates and signed off by the owner.
13. Security headers verified; no secrets in the client bundle (verified by bundle inspection).
14. Privacy policy published and accurate to actual data handling.

---

## 11. RISKS

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| 1 | **AI free-tier quota cut or withdrawn** | High | **High** — precedent exists (Dec 2025) | Provider abstraction, our own lower cap, moodboard fallback, admin provider switch, budget line for a paid tier |
| 2 | **Photography remains inadequate** | High | Medium | Five-layer visual system that does not depend on photography; remediation plan (`design.md` §8.2) scheduled in Phase 2 |
| 3 | **Three.js/GSAP degrade mobile performance** | High | Medium | Hard capability gates, dynamic imports, CI performance budgets, mid-range Android as the reference device |
| 4 | **Published rates become stale or are quoted against us** | High | Medium | Versioned rate cards, ranges not point values, prominent disclaimers, quarterly review calendared |
| 5 | **Transparency commitments not upheld operationally** | High | Medium | The behind-the-wall protocol must be agreed with site teams *before* launch; if it cannot be sustained, remove the claim rather than break it |
| 6 | **MongoDB free tier causes lead-form failures** | **Critical** | Medium | Paid tier, connection caching, durable fallback queue (NFR-OPS-02) |
| 7 | **Leads not responded to quickly** | High | Medium | "Needs response" dashboard widget, notification within 60s, daily digest, published median response time creating internal accountability |
| 8 | **Scope creep from AI features** | Medium | High | Chatbot descoped in v1 (`design.md` §5.4); 3D limited to two surfaces; explicit out-of-scope list in §1.2 |
| 9 | **Locality pages penalised as doorway pages** | Medium | Medium | Ship only localities with real projects and genuinely specific content |
| 10 | **Owner does not adopt the admin panel** | High | Medium | Dashboard designed around the morning triage task; mobile-first admin; observed usability session as a release gate (§10.8) |

---

*End of SRS — see `implementationplan.md` for delivery phasing.*
