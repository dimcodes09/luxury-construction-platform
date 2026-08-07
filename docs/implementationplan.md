# IMPLEMENTATION PLAN
## {{BRAND_NAME}} (working name: ZYVORA) — Premium Construction & Interiors Platform

**Version** 1.0 · **Date** 2026-08-07
**Companion docs** `design.md`, `SRS.md`

---

## 0. HOW THIS PLAN IS STRUCTURED

Thirteen phases. Each phase specifies **Objectives · Dependencies · Effort · Deliverables · Acceptance criteria · Risks**.

**Effort** is expressed in **person-days** for a team of: 1 designer (D), 2 full-stack engineers (E1, E2), 1 content/photography lead (C), with the business owner (O) available for review. Adjust proportionally for a different team shape.

**Total: 148 person-days ≈ 12 calendar weeks** with that team, assuming content is not the bottleneck. Content is almost always the bottleneck — which is why Phase 2 runs early and in parallel. (Per-phase effort is itemised below and totalled in the summary table.)

### Critical path
```
P0 Foundations ─┬─ P1 Brand ─── P3 Design System ─┬─ P5 Home ─┬─ P6 Services ─┐
                │                                  │           │              │
                └─ P2 Content & Photography ───────┘           └─ P7 Portfolio ┤
                                                                               │
                        P4 Data & Infra ─── P8 Estimator ── P9 Design Studio ──┤
                                                                               │
                                                    P10 Admin ── P11 SEO+Perf ─┴─ P12 Launch
```
**Phase 2 (content & photography) is the true critical path.** Engineering will outrun content. Start it on day one.

### Parallelisation
| Weeks | D | E1 | E2 | C |
|---|---|---|---|---|
| 1–2 | P1 Brand | P0 Foundations | P4 Data & Infra | P2 Content |
| 3–4 | P3 Design System | P3 (build) | P4 / P8 engine | P2 Content |
| 5–6 | P5 Home design | P5 Home build | P8 Estimator | P2 Photography |
| 7–8 | P6/P7 design | P6 Services | P7 Portfolio | P2 Copy |
| 9–10 | P9/P10 design | P9 Design Studio | P10 Admin | P2 Journal |
| 11 | QA | P11 SEO & Perf | P11 | Content load |
| 12 | Launch support | P12 | P12 | P12 |

---

## PHASE 0 — FOUNDATIONS

### Objectives
Establish the repository, environments, and quality gates so that every later phase inherits enforcement rather than relying on discipline.

### Dependencies
None. Starts day one.

### Effort — **5 person-days**
| Task | Days |
|---|---|
| Next.js 15 + TypeScript strict + Tailwind 4 + shadcn/ui scaffold | 1 |
| Repo hygiene: ESLint, Prettier, Husky, commitlint, conventional commits | 0.5 |
| Vercel project, preview deployments, environment variables per environment | 0.5 |
| MongoDB Atlas cluster, cached connection helper, seed script harness | 1 |
| Cloudinary account, upload presets, named transformations per aspect ratio | 0.5 |
| CI pipeline: typecheck, lint, unit test, build, Lighthouse CI, axe-core, bundle-size budget | 1 |
| Sentry, error boundaries, structured logging | 0.5 |

### Deliverables
- Running application on a preview URL.
- CI pipeline that **fails the build** on: type errors, lint errors, bundle budget breach, Lighthouse regression, critical/serious axe violations.
- `README` with local setup, environment variable inventory, and branching model.
- `.env.example` with every required variable documented.

### Acceptance criteria
- [ ] `main` deploys automatically; every PR gets a preview URL
- [ ] A deliberately oversized dependency added to a PR causes CI to fail on the bundle budget
- [ ] A deliberate `any` causes CI to fail
- [ ] MongoDB connection survives 20 consecutive serverless invocations without exhausting the pool
- [ ] Sentry captures a deliberately thrown error from both server and client

### Risks
Deferring CI enforcement to "later" — it never happens, and the performance budgets in `SRS.md` §8.1 become unachievable retroactively. **Enforce from commit one.**

---

## PHASE 1 — BRAND

### Objectives
Lock the verbal and visual identity so every later decision has a reference. Resolve the placeholder brand.

### Dependencies
Phase 0 (repo). Requires **owner availability** for the name/positioning decision and the open questions in `design.md` §10.7.

### Effort — **8 person-days**
| Task | Days |
|---|---|
| Workshop with owner: positioning, differentiation commitments, §10.7 answers | 1 |
| Name resolution and lockup (or adoption of the real name with a descriptor) | 0.5 |
| Wordmark, monogram plate, datum-line device, clear-space and misuse rules | 2 |
| Colour system finalisation and contrast verification | 1 |
| Type pairing test: Fraunces / Inter / JetBrains Mono at real sizes on real devices | 1 |
| Custom craft icon set — 18 icons | 1.5 |
| Voice and tone guide with 20 worked before/after copy examples | 1 |

### Deliverables
- Brand guidelines document (can be a section appended to `design.md`).
- Logo files: SVG, favicon set, OG default, WhatsApp avatar, app icons.
- Verified colour tokens with a contrast matrix.
- Icon set as an optimised SVG sprite.
- Voice guide with the banned-word list and the CTA lexicon (`design.md` §10.1, §10.3).

### Acceptance criteria
- [ ] Owner has signed off the positioning statement and can repeat it unprompted
- [ ] All transparency commitments (published rates, payment milestones, behind-the-wall protocol) are **confirmed operationally deliverable** — not just approved as marketing
- [ ] Every colour pair in `design.md` §2.1.4 verified programmatically
- [ ] Wordmark legible at 96px and at 24px (monogram) on a real phone
- [ ] `design.md` §10.7 open questions all answered, or explicitly deferred with an owner

### Risks
**The highest-risk item in the entire project sits here:** if the business cannot actually deliver the transparency commitments, the whole strategy collapses and must be reworked before design proceeds. Surface this in the workshop, not at launch.

---

## PHASE 2 — CONTENT & PHOTOGRAPHY *(runs in parallel from week 1 — the real critical path)*

### Objectives
Produce every asset and every word. Engineering can build empty pages; it cannot ship them.

### Dependencies
Phase 1 for voice and visual grade. Content production begins immediately regardless.

### Effort — **24 person-days** (C, with D support)
| Task | Days |
|---|---|
| Content audit: what exists, what's usable, what's missing | 1 |
| Photography remediation shoots 1–7 (`design.md` §8.2) | 7 |
| Photo processing: house grade, vertical correction, crops, exports | 3 |
| Establish and document the ongoing site photo protocol with site teams | 0.5 |
| Project write-ups: 12 projects × brief, approach, facts, captions | 5 |
| Service copy: 9 services × full page (`design.md` §4.6) | 4 |
| Process content: 38 steps, 9 payment milestones, deliverables per step | 1.5 |
| About, team bios, credentials, honest-numbers section | 1 |
| Journal: 6 launch articles, cost guides prioritised | — *(see note)* |
| FAQ: 60 questions across categories | 1 |
| Materials: 40 entries with brand, grade, cost, rationale | — *(bundled with shoot 1)* |
| Testimonial collection with specific prompts and Google review links | 1 |

> **Journal articles** are budgeted separately at 1 day each (6 days) and may extend past launch. Ship with 4; the remaining 2 land in week 13.

### Deliverables
- Processed image library: ≥350 images, correctly named, aspect-ratio compliant, alt text written.
- Process film (90s) and one project film.
- All page copy in structured markdown ready for import.
- 12 project write-ups, 9 service pages, 60 FAQs, 40 materials, ≥15 testimonials.
- Documented site photo protocol adopted by site teams.

### Acceptance criteria
- [ ] Every project has ≥12 images with ≥40% detail crops
- [ ] Every project has ≥1 before/after pair with cost and duration
- [ ] ≥6 projects have behind-the-wall sets with technical captions and dates
- [ ] Zero stock photography anywhere
- [ ] Every image has meaningful alt text
- [ ] All copy passes the banned-word check
- [ ] Every published statistic verified as true by the owner, in writing
- [ ] ≥10 testimonials have a verifiable source URL

### Risks
Chronic underestimation. **If Phase 2 slips, launch slips** — no engineering effort compensates. Mitigate by cutting *scope of content* (launch with 8 projects instead of 12) rather than cutting quality.

---

## PHASE 3 — DESIGN SYSTEM

### Objectives
Build the token layer and the full component library so page construction becomes assembly, not invention.

### Dependencies
Phases 0 and 1.

### Effort — **14 person-days** (D 6, E1 8)
| Task | Days |
|---|---|
| Token implementation: CSS custom properties + Tailwind theme generation | 1 |
| Typography primitives, fluid scale, optical alignment utility, balance utility | 1 |
| Primitives: Button, Link, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Chip, Badge, Avatar, Tooltip, Skeleton, Divider | 3 |
| Composites: Card, Field, FormRow, Stepper, Tabs, Accordion, Dropdown, Popover, Modal, Sheet, Toast, Table, Pagination, Breadcrumb, EmptyState | 3 |
| Domain: ProjectCard, ServiceCard, TestimonialCard, StatBand, ProcessStep, MaterialSwatch, ArticleCard, TeamCard, FAQItem, ShortlistButton | 2 |
| **BeforeAfter** (full spec, `design.md` §3.14 — treat as its own mini-project) | 1.5 |
| BehindTheWall, CostRangeBar | 1 |
| Shell: Header, services panel, MobileNav, Footer, ContactDock, StickyCTABar | 2 |
| Motion provider, reduced-motion kill switch, Lenis integration, GSAP context hook | 1 |
| Storybook (or a `/dev/components` route) with every component in every state | 1.5 |

### Deliverables
- Complete component library, typed, with all seven states per interactive component.
- Motion system with the four approved patterns (`design.md` §7.2).
- Component gallery documenting every variant and state.
- Dev-only grid overlay (`Ctrl+G`).

### Acceptance criteria
- [ ] Zero raw hex values or arbitrary pixel values in component code (lint-enforced)
- [ ] Every interactive component has default, hover, focus-visible, active, loading, success, disabled
- [ ] All hover styles wrapped in `@media (hover: hover) and (pointer: fine)`
- [ ] BeforeAfter: touch drag works without blocking vertical page scroll; keyboard operable; idle hint fires once; works with JS disabled
- [ ] `prefers-reduced-motion` disables all motion via the single global switch
- [ ] Component gallery passes axe with zero critical/serious violations
- [ ] Shared bundle still under 130KB with the library present

### Risks
Building components speculatively that no page needs. **Build only what Part 3 of `design.md` lists — nothing else.**

---

## PHASE 4 — DATA & INFRASTRUCTURE

### Objectives
Models, persistence, media pipeline, auth, email, analytics — everything the pages will consume.

### Dependencies
Phase 0.

### Effort — **12 person-days** (E2)
| Task | Days |
|---|---|
| Mongoose schemas for all 16 collections (`SRS.md` §5) with indexes | 2.5 |
| Zod schemas shared client/server, derived from the same source | 1 |
| Cloudinary integration: signed uploads, transformations, deletion, webhook | 1.5 |
| Better Auth setup: roles, sessions, 2FA, middleware guard | 2 |
| Resend integration: 5 transactional templates, retry with backoff | 1.5 |
| Rate limiting (Upstash + MongoDB fallback) | 1 |
| PostHog + GA4 with consent gating, typed event helper | 1 |
| Seed scripts and fixture data for local development | 1 |
| Cron jobs: TTL cleanup, daily digest | 0.5 |

### Deliverables
- All collections with indexes and validated schemas.
- Working auth with role enforcement at the middleware **and** action level.
- Media upload pipeline end to end.
- Email templates: lead notification, lead acknowledgement, estimate delivery, generation-ready, daily digest.
- Typed analytics helper enforcing the event taxonomy (`design.md` §10.6).

### Acceptance criteria
- [ ] Every collection seeds and queries correctly; index usage verified with `explain()`
- [ ] Role matrix enforced server-side; a Manager cannot reach a rate-card mutation even by direct request
- [ ] Rate limits verified by test
- [ ] Emails deliver to Gmail and Outlook without landing in spam (SPF/DKIM/DMARC configured)
- [ ] Analytics fire only after consent
- [ ] Lead write succeeds under a simulated database timeout via the fallback queue (`SRS.md` NFR-OPS-02)

### Risks
Email deliverability is routinely discovered too late. **Configure and test SPF/DKIM/DMARC in this phase, not at launch.**

---

## PHASE 5 — HOME

### Objectives
Build the highest-traffic, highest-stakes page and prove the performance budgets hold with real motion and real media.

### Dependencies
Phases 2 (hero assets, stats), 3, 4.

### Effort — **10 person-days** (D 3, E1 7)
| Task | Days |
|---|---|
| High-fidelity design of all 10 sections, mobile and desktop | 3 |
| Hero: typographic entrance, video/poster strategy, LCP optimisation | 1.5 |
| Sections S02–S06 | 2 |
| S07 inline mini-estimator with state hand-off to `/estimate` | 1 |
| S08 process strip: GSAP horizontal pin (desktop) + vertical timeline (mobile) | 1 |
| S09 Google reviews integration with caching and fallback | 0.5 |
| S10 + closing CTA band | 0.5 |
| Performance tuning to budget | 0.5 |

### Deliverables
Fully responsive homepage, all analytics events wired, mini-estimator hand-off working.

### Acceptance criteria
- [ ] **LCP < 2.0s on a mid-range Android over throttled 4G** — measured on the real device, not simulated
- [ ] CLS < 0.05 with fonts and video loading
- [ ] Lighthouse mobile Performance ≥90
- [ ] Stat band counts once and never re-triggers
- [ ] Mini-estimator carries state into `/estimate` without re-entry
- [ ] Google review block renders cached values when the API fails
- [ ] All 10 sections legible and correctly spaced at 320px
- [ ] Full keyboard traverse without a trap

### Risks
The hero video is the most likely cause of an LCP failure. **The poster image must be the LCP element.** If the budget cannot be met, ship a still image — a fast still beats a slow video on every commercial metric.

---

## PHASE 6 — SERVICES

### Objectives
Nine service pages plus three hubs from one template — the primary organic-search entry surface.

### Dependencies
Phases 2 (service copy), 3, 4, 8 (rate card for tier ranges — build the template first, wire prices when the engine lands).

### Effort — **9 person-days** (D 2, E2 7)
| Task | Days |
|---|---|
| Template design (one worked example, fully specified) | 2 |
| Template build: 13 sections, all conditional | 3 |
| Pricing tier module wired to the rate card | 1 |
| "What you avoid" loss-framed panel | 0.5 |
| Occupancy Timeline module (renovation) | 0.5 |
| Group hubs + services index + comparison table | 1 |
| Commercial services page | 1 |

### Deliverables
13 pages, FAQ schema per page, inline estimator embedded, filtered project modules.

### Acceptance criteria
- [ ] All 9 services render fully with real content
- [ ] Excluded-scope list is non-empty on every service and visually equal to inclusions
- [ ] Changing the rate card updates every service page's tier ranges without a deploy
- [ ] `FAQPage` schema validates on all 9
- [ ] Related projects filter correctly by service tag with no empty modules
- [ ] Every page has a unique hand-written title and meta description

### Risks
Nine near-identical pages read as thin content to search engines. **Each page needs genuinely distinct copy, distinct FAQs and distinct projects** — enforced in the Phase 2 content review.

---

## PHASE 7 — PORTFOLIO

### Objectives
Portfolio index with filtering, and the 13-section project detail page — the highest-dwell surface for researching visitors.

### Dependencies
Phases 2 (project content and imagery), 3, 4.

### Effort — **11 person-days** (D 3, E1 8)
| Task | Days |
|---|---|
| Index design + project page design | 3 |
| Index: filters as URL state, server-rendered, load-more | 2 |
| GSAP Flip transitions on filter change | 0.5 |
| Project page sections 1–4 (hero, facts, brief, drawings) | 2 |
| Sections 5–8 (before/after, behind-the-wall, gallery+lightbox, materials) | 2 |
| Sections 9–13 (timeline, testimonial, cost context, related, CTA) | 1 |
| Sticky rail, shortlist, share, spec-sheet PDF | 1.5 |

### Deliverables
`/work` with six working filters, 12 project pages, lightbox, shortlist persistence, spec-sheet generation.

### Acceptance criteria
- [ ] Filter state survives share, refresh, and back navigation
- [ ] Filtered pages are server-rendered and indexable per FR-PORT-05
- [ ] No empty sections render when data is missing
- [ ] Before/after works on touch without blocking scroll
- [ ] Lightbox is fully keyboard operable and traps focus correctly
- [ ] Shortlist persists across sessions and survives a schema version bump
- [ ] Spec-sheet PDF generates with correct branding and captures contact
- [ ] Planned vs actual duration displayed on every project

### Risks
Twelve projects with uneven content will expose the conditional-section logic. Test with a deliberately sparse project fixture.

---

## PHASE 8 — AI COST ESTIMATOR

### Objectives
The primary conversion tool. Deterministic, auditable, honest.

### Dependencies
Phases 3, 4. **Requires the owner's real rate card** — this is a hard blocker.

### Effort — **11 person-days** (D 2, E2 9)
| Task | Days |
|---|---|
| Flow and result-screen design | 2 |
| Rate engine as a pure function + 40-case fixture suite | 2 |
| Rate card model, admin editor, versioning, validation | 1.5 |
| 5-step flow with URL state and resumability | 2 |
| Result screen: CostRangeBar, breakdown, inclusions/exclusions, assumptions | 2 |
| LLM narration with templated fallback | 1 |
| Email/WhatsApp delivery + branded PDF | 1 |
| Embeddable compact widget | 0.5 |
| Persistence of complete and abandoned runs | 0.5 |

### Deliverables
`/estimate`, embeddable widget, rate-card admin, estimate PDF, full persistence including abandonment step.

### Acceptance criteria
- [ ] 40/40 fixture cases produce expected outputs
- [ ] Any stored estimate is exactly reproducible from its `rateCardVersion`
- [ ] Result is displayed **before** any contact request — verified by manual walkthrough
- [ ] Exclusions render with equal visual weight and cannot be empty
- [ ] LLM outage leaves numbers unaffected; templated narration appears
- [ ] Splits validation rejects a rate card that doesn't sum to 1.00
- [ ] Abandonment step recorded correctly for each of the 5 steps
- [ ] Widget works embedded in an article, a service page, and a project page with correct prefill
- [ ] Rate limit enforced at 20/hour/IP

### Risks
The owner may resist publishing rates. **This is the single most valuable trust asset on the site** — if it is refused, escalate before building, because the estimator's differentiation disappears and the feature becomes a generic calculator.

---

## PHASE 9 — AI DESIGN STUDIO

### Objectives
Room redesign from a photo, built to fail safely under volatile free-tier quotas.

### Dependencies
Phases 3, 4. Provider account and key.

### Effort — **12 person-days** (D 2, E1 10)
| Task | Days |
|---|---|
| Flow, queue experience and quota-exhaustion design | 2 |
| Provider abstraction interface + Gemini adapter | 2 |
| Upload: client downscale, signed upload, format handling incl. HEIC | 1.5 |
| Moderation pass + face blurring | 1.5 |
| Job queue, status polling, real backend-driven status messages | 2 |
| Prompt template system, versioned | 1 |
| Results: variants as before/after, download, save, share | 1.5 |
| "Get this costed" hand-off + attaching generations to leads | 0.5 |
| Quota enforcement, moodboard fallback, "email me tomorrow" | 1 |
| TTL cleanup job | 0.5 |

### Deliverables
`/design-studio`, provider abstraction with one adapter, queue with honest states, quota fallback, admin AI usage view integration.

### Acceptance criteria
- [ ] Success path produces 3 variants rendered as before/after against the original
- [ ] Status messages reflect real job state — verified by inspecting backend events
- [ ] Waits over 20s surface the email-capture option
- [ ] Moderation rejects test NSFW and face-containing images with neutral messaging
- [ ] Our quota (3/24h) enforced server-side; bypass attempts via cleared storage fail
- [ ] Provider quota exhaustion shows the moodboard, never an API error
- [ ] Provider can be switched from admin without a deploy
- [ ] Uploads deleted after 30 days by the cron job (verified with a shortened TTL in staging)
- [ ] No API key present in the client bundle (verified by bundle inspection)
- [ ] "Get this costed" prefills the estimator and attaches the image to the resulting lead

### Risks
**Highest-uncertainty phase.** Output quality is not fully controllable. Mitigation: the "what we'd change to build this for real" panel converts imperfect output into demonstrated expertise. If output quality is unacceptable after tuning, **ship the feature behind a `Beta` label rather than delaying launch** — or defer it to week 14 and launch without it. The site's core value does not depend on it.

---

## PHASE 10 — ADMIN

### Objectives
A back office the owner will actually open every morning.

### Dependencies
Phases 4, 7, 8, 9 (admin surfaces the data those phases produce).

### Effort — **14 person-days** (D 2, E2 12)
| Task | Days |
|---|---|
| Admin shell, nav, command palette, responsive behaviour | 1.5 |
| Dashboard: 6 widgets in the specified order | 2 |
| Leads: table, filters, saved views, detail drawer with full journey | 3 |
| Lead actions: call/WhatsApp/email, status pipeline, notes, export | 1.5 |
| Portfolio manager: structured editor, media manager, before/after pairing + crop | 3 |
| Testimonials, materials, FAQ CRUD | 1 |
| Journal editor (Tiptap, restricted blocks) with SEO fields and previews | 2 |
| AI usage view, estimator submissions view, rate-card editor | 1.5 |
| Settings, users, roles, invitations | 1 |
| Soft delete with undo, audit log | 1 |

### Deliverables
Complete admin panel, mobile-usable, role-enforced.

### Acceptance criteria
- [ ] **A non-technical user completes lead triage, publishes a project, and writes an article in an observed session without assistance** — this is the real test, and it is a release gate
- [ ] Fully usable at 375px
- [ ] Lead detail shows the complete journey including estimates and generations
- [ ] Before/after upload rejects mismatched aspect ratios and offers a crop
- [ ] Publishing blocked below 90% alt-text coverage
- [ ] Every destructive action undoable for 10 seconds
- [ ] Role matrix enforced server-side on every action
- [ ] Rate-card edit creates a new version; historical estimates remain reproducible
- [ ] Content-health widget correctly flags gaps

### Risks
Admin is routinely under-budgeted and then rushed, producing something the owner abandons — after which the site goes stale and the whole investment decays. **Protect this budget.** The observed usability session is not optional.

---

## PHASE 11 — SEO, PERFORMANCE & ACCESSIBILITY HARDENING

### Objectives
Bring every route within budget and to standard, with real content loaded.

### Dependencies
Phases 5–10 complete with real content.

### Effort — **9 person-days** (E1 4, E2 4, D 1)
| Task | Days |
|---|---|
| Structured data across all types, validated | 1.5 |
| Sitemaps, robots, canonicals, filter-page indexation rules | 1 |
| Dynamic OG image generation for projects and articles | 1 |
| Metadata audit: unique title/description on every route | 0.5 |
| Locality pages (6) with genuinely specific content | 1.5 |
| Performance: bundle analysis, dynamic import audit, image audit, third-party deferral | 2 |
| Accessibility: full axe sweep, manual NVDA + VoiceOver pass, keyboard walkthrough of all 7 journeys | 1.5 |

### Deliverables
Validated structured data, sitemaps, OG images, locality pages, all budgets met, accessibility report.

### Acceptance criteria
- [ ] Lighthouse mobile ≥90/95/95/95 on home, a service page, a project page, `/estimate`, an article
- [ ] Zero critical or serious axe violations on all public routes
- [ ] All structured data validates in the Rich Results Test
- [ ] All seven journeys completable keyboard-only
- [ ] Shared JS under 130KB; no route over 90KB additional
- [ ] Usable at 200% zoom and 320px with no horizontal scroll
- [ ] Every route has a unique title and meta description
- [ ] Locality pages contain no templated duplication

### Risks
Discovering a structural performance problem this late is expensive. Mitigate by measuring continuously from Phase 5 — this phase should be tuning, not rescue.

---

## PHASE 12 — TESTING, LAUNCH & HANDOVER

### Objectives
Verify everything, migrate, launch, and make the business self-sufficient.

### Dependencies
All prior phases.

### Effort — **9 person-days** (all)
| Task | Days |
|---|---|
| Cross-browser/device matrix incl. mid-range Android and Samsung Internet | 1.5 |
| Failure-mode testing: DB down, email down, AI down, network loss mid-form | 1 |
| Load test on lead and estimate endpoints | 0.5 |
| Security review: headers, secrets in bundle, role bypass attempts, NoSQL injection, upload validation | 1.5 |
| Backup and restore rehearsal | 0.5 |
| Content freeze, final data load, statistic verification with owner sign-off | 1 |
| Analytics verification: every event firing with correct properties | 0.5 |
| DNS, redirects from any legacy URLs, Search Console, GBP linkage | 0.5 |
| Owner training: 2 sessions + a recorded walkthrough + a one-page cheat sheet | 1 |
| Launch day monitoring and hotfix window | 1 |

### Deliverables
Test report, security review, trained owner, live site, monitoring and alerting active, 30-day support plan.

### Acceptance criteria
All 14 release gates in `SRS.md` §10 satisfied, plus:
- [ ] Lead submitted from a real phone on real mobile data arrives in admin and triggers notification within 60s
- [ ] Every published statistic signed off in writing by the owner
- [ ] Owner independently publishes a project and responds to a lead, unassisted
- [ ] Backup restored successfully into a staging environment
- [ ] Uptime monitoring alerting to a real phone number
- [ ] 301 redirects in place for every legacy URL

### Risks
Launching before content is genuinely complete. **If content is short, launch with fewer projects — never with placeholder content.** One "Lorem ipsum" or one stock photo undermines every trust claim the site makes.

---

## PHASE 13 — POST-LAUNCH (weeks 13–16, ongoing)

### Objectives
Learn from real behaviour and improve what the data says is broken.

### Effort — **~4 days/month ongoing**

| Week | Activity |
|---|---|
| 13 | Daily funnel review; fix drop-offs; remaining journal articles |
| 14 | Session-replay review of estimator abandonment; iterate the weakest step |
| 15 | First A/B test (recommended: hero headline, and estimator CTA placement) |
| 16 | Review lead quality with the sales team; adjust form fields to what actually helps them |
| Monthly | New projects published, 2 journal articles, rate-card review, Core Web Vitals check |
| Quarterly | Rate card update, content-health sweep, accessibility re-audit, dependency updates |

### Deferred backlog (v1.1+), prioritised
1. **Client project portal** — live progress, photos, payment status for existing clients. Highest-value follow-on; also the strongest referral generator.
2. **Grounded Answer Assistant** (`design.md` §5.4) doubling as site search.
3. **WhatsApp Business API** for automated lead follow-up.
4. **Hindi / Marathi locale** — depends on audience data.
5. **Matterport-style real walkthroughs** of completed homes (recommended over any 3D configurator).
6. **Materials 3D explorer** if not shipped in v1.
7. **Referral programme** surface — 69% of hires come from referrals; there is currently no digital mechanism for this and it is a significant gap.

---

## SUMMARY

| Phase | Effort (person-days) | Calendar weeks |
|---|---|---|
| 0 · Foundations | 5 | 1 |
| 1 · Brand | 8 | 1–2 |
| 2 · Content & Photography | 24 | 1–10 (parallel) |
| 3 · Design System | 14 | 3–4 |
| 4 · Data & Infrastructure | 12 | 2–4 |
| 5 · Home | 10 | 5–6 |
| 6 · Services | 9 | 7–8 |
| 7 · Portfolio | 11 | 7–8 |
| 8 · AI Cost Estimator | 11 | 5–7 |
| 9 · AI Design Studio | 12 | 9–10 |
| 10 · Admin | 14 | 9–11 |
| 11 · SEO / Perf / A11y | 9 | 11 |
| 12 · Testing & Launch | 9 | 12 |
| **Total** | **148** | **12 weeks** |

*(148 person-days across a 4-person team over 12 weeks ≈ 37 days each, allowing for review, meetings and slack.)*

### If the timeline must compress to 8 weeks
Cut in this order, and no other:
1. AI Design Studio → post-launch (Phase 9, 12 days)
2. Materials library and 3D explorer → post-launch (~3 days)
3. Locality pages → post-launch (1.5 days)
4. Commercial services page → post-launch (1 day)
5. Gallery page → merge into portfolio (1 day)
6. Reduce to 8 projects instead of 12 (~2 days content)

**Never cut:** the estimator, the process page, behind-the-wall, before/after, the admin lead workflow, or performance and accessibility budgets. Those are the conversion engine and the reason the site exists.

---

*End of implementation plan.*
