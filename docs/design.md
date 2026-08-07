# DESIGN.MD
## ZYVORA — Design System & Experience Specification
**Version** 1.0 · **Date** 2026-08-07 · **Owner** Principal Product Design
**Status** Approved for implementation · **Companion docs** `SRS.md`, `implementationplan.md`

---

## HOW TO READ THIS DOCUMENT

| Part | Contents |
|---|---|
| **Part 0** | Research findings, strategy, and the reasoning behind every decision |
| **Part 1** | Brand foundation — name, positioning, voice, visual thesis |
| **Part 2** | Design tokens — colour, type, space, grid, radius, elevation, motion |
| **Part 3** | Component library — every component, every state |
| **Part 4** | Page-by-page layout specification (public site) |
| **Part 5** | AI feature experience design |
| **Part 6** | Admin panel design |
| **Part 7** | Motion, GSAP, Three.js, Lenis |
| **Part 8** | Imagery, video, illustration, 3D strategy |
| **Part 9** | Responsive, accessibility, performance, dark mode |
| **Part 10** | Content, copy, and SEO design rules |

> **BRAND PLACEHOLDER NOTICE**
> `ZYVORA` is a working brand name selected for strategic fit (see §1.1). Every occurrence lives behind the token `{{BRAND_NAME}}` in implementation. Swapping the real business name, city, and founding year is a single find-and-replace across `lib/brand.ts`. Nothing in this design system depends on the literal string.
> **Fill these in:** `{{BRAND_NAME}}`, `{{CITY}}`, `{{STATE}}`, `{{FOUNDED_YEAR}}`, `{{PHONE_E164}}`, `{{WHATSAPP_E164}}`, `{{EMAIL}}`, `{{GSTIN}}`, `{{OFFICE_ADDRESS}}`, `{{GOOGLE_PLACE_ID}}`.

---
---

# PART 0 — RESEARCH & STRATEGY

## 0.1 What the research actually says

This section is the evidence base. Every design decision downstream cites back to a finding here by ID.

### R-01 · Trust beats price as the primary purchase blocker
Homeowners' number one fear is not cost — it is hiring someone who disappears mid-project, does poor work, or is uninsured. Federation of Master Builders research found **19% of homeowners had postponed work entirely because they did not trust available builders**, and one in five households was actively discouraged from hiring.

**Design implication:** The hero section's job is not to look beautiful. Its job is to answer *"can I trust these people with ₹40 lakh and 14 months of my life?"* within 5 seconds. Beauty is the delivery mechanism, not the message.

### R-02 · Social proof is decisive and must be *verifiable*
**86% of homeowners read reviews before picking a contractor. 69% hire someone they've used before or that a friend recommended.** Live review feeds (Google Business Profile) outperform hand-copied testimonial text because they prove the praise is current and unfiltered.

**Design implication:** Testimonials must carry a verifiable provenance chip — reviewer name, project link, date, and where possible a Google review deep-link. A testimonial with no project attached is treated as low-credibility and rendered in a visually secondary style.

### R-03 · The research phase has moved earlier and gone silent
Homeowners now gather information much sooner and evaluate contractors *quietly*, without making contact, for weeks or months. The 2026 buying process prioritises trust, clear communication, and visible proof of credibility before any conversation.

**Design implication:** This is the single biggest strategic insight in this document. The site must be designed for a **lurker**, not a lead. Most valuable visitors will never fill in a form on visit one. Therefore:
- Every piece of information a lurker needs must be *on the site*, not gated behind "contact us for details."
- We need low-commitment conversion steps (save a project, download a spec sheet, get an estimate) that capture identity *before* the visitor is ready to talk.
- Returning-visitor recognition matters (see §4.13, Journey J-02).

### R-04 · Vague CTAs are the top conversion killer on contractor sites
"Learn More" and "Submit" measurably underperform specific, outcome-named actions. Every page must guide to one obvious next step.

**Design implication:** We ban the words *Learn More*, *Submit*, *Click Here*, and *Get in Touch* from the entire product. See §10.3 for the approved CTA lexicon.

### R-05 · Speed, clarity and trust beat visual complexity
The highest-converting contractor sites prioritise load speed and immediate clarity over elaborate design. More than half of traffic is mobile.

**Design implication — and the central tension of this project:** The brief asks for Three.js, GSAP, and a premium scroll experience. Research says complexity kills conversion. **We resolve this by making motion earn its place**: no animation ships unless it either (a) communicates craftsmanship/precision, or (b) clarifies information. Decorative motion is cut. Three.js appears on exactly **two** surfaces (§7.4), never on mobile-critical paths, and never blocking LCP.

### R-06 · Loss framing justifies premium pricing
People are more motivated to avoid losses than to achieve gains. Framing price around what the client *avoids* — delays, rework, cost overruns, poor craftsmanship — makes higher rates feel justified.

**Design implication:** The pricing/packages page is architected around avoided loss, not included features. Feature lists are secondary. See §4.6.

### R-07 · Authenticity signals outperform stock polish
Homeowners want to see the actual team, actual site vehicles, actual local projects. Authenticity removes the uncertainty of hiring a stranger.

**Design implication:** This is enormously convenient given our asset constraint (§0.3). Imperfect real photography of real people *outperforms* perfect stock imagery. We design a system that celebrates raw, documentary-style photography rather than one that requires magazine-grade renders.

### R-08 · 2026 visual language
Current direction: generous whitespace and editorial minimalism; typography as the hero element replacing imagery (also faster to load); high-contrast serifs signalling editorial polish and luxury; kinetic type responding to scroll; "maximalist minimalism" — bold expressive elements inside clean functional structure; scroll effects that guide rather than overwhelm.

**Design implication:** Typography-as-hero is *exactly* the right answer for a business with weak photography. This is our primary aesthetic strategy, not a compromise.

### R-09 · Luxury interior/architecture site conventions that work
Observed across award-winning studio sites: big bold imagery on long homepages with heavy whitespace; dark backgrounds used specifically to make photography glow; minimal streamlined navigation; awards displayed as a quiet band low on the page; behind-the-scenes video giving a glimpse of process.

**Design implication:** Dark-first surfaces for portfolio contexts. Minimal nav. Process video is high-priority content (§8.3).

### R-10 · Before/after comparison UX
Handle centred by default; explicit *Before* / *After* labels; a subtle idle animation prompting the drag; identical dimensions and framing for both images; touch support; compressed images.

**Design implication:** Fully specified as a first-class component in §3.14 — this is a signature moment, not a plugin.

### R-11 · Cost benchmarks (India, 2026) — grounding for the AI Estimator
Construction, per sq ft built-up:

| Tier | Range (₹/sq ft) |
|---|---|
| Budget / Economy | 1,200 – 1,800 |
| Standard / Mid-range | 1,800 – 2,800 |
| Premium | 2,800 – 4,500 |
| Ultra-premium / Luxury | 4,500+ |

National average band ₹1,500–3,500. Tier-1 metros ₹2,200–4,500; Tier-2/3 ₹1,200–2,800. Interiors run ₹1,200–5,000+ per sq ft depending on tier and materials; design fees alone start at ₹50–200 per sq ft. **Critical:** per-sq-ft construction rates normally cover structure, basic finishing and MEP only — interiors, furnishing and landscaping are additional. Most competitor calculators hide this, which is why homeowners feel misled later.

**Design implication:** Our estimator's differentiator is **honesty about exclusions**. See §5.2 — the "What this does NOT include" panel is given equal visual weight to the number itself. This is counterintuitive but is our strongest trust play.

### R-12 · Free-tier AI image generation reality
Gemini 2.5 Flash Image ("Nano Banana") allows image generation on a free API tier at 1024×1024, historically ~500 requests/day, with free-tier TPM capped around 250,000 and daily quotas resetting at midnight Pacific. **Free-tier quotas were cut sharply (reported up to 92% on some models) in December 2025** — so quotas are volatile and must never be treated as a stable contract. Most consumer "free" AI interior tools either require a card or watermark output.

The wider 2026 landscape has narrowed: most "free image API" listings are trials, sandboxes, or dead paths. Two exceptions matter. **Cloudflare Workers AI gives 10,000 Neurons/day free on an ongoing basis with no credit card**, hosting SD img2img, SD inpainting, SDXL-Lightning and FLUX — making it the only genuinely free, always-on option. And **Qwen-Image / Qwen-Image-Edit ships under Apache 2.0**, the cleanest commercial licence of any capable model, available cheaply through several inference providers. **FLUX.1 Kontext [dev], despite being the most-recommended editing model online, is non-commercial licensed** and must not be used in production.

**Design implication:** the Design Assistant is built on a *chain* of two independent free providers plus a zero-dependency moodboard fallback, not on one vendor. Full evaluation in `SRS.md` §7.1.

**Design implication:** The Design Assistant must be built quota-defensively: server-side only, per-visitor rate limiting, a queue with an honest wait state, graceful degradation to a curated moodboard when quota is exhausted, and a provider abstraction so the model can be swapped without touching the UI. Never let an external quota failure look like *our* product breaking. See §5.3 and SRS §7.

---

## 0.2 What is outdated, and what we will not do

| Anti-pattern | Why it fails | Our replacement |
|---|---|---|
| Full-width hero carousel of stock villas | Zero information, hurts LCP, feels like every competitor | Typographic hero + one authentic hero asset (§4.1) |
| "We are the best construction company in {{CITY}}" | Unsubstantiated claim, triggers scepticism | A specific, falsifiable claim with proof adjacent |
| Orange/gold gradient + hard-shadow buttons | Reads mid-2010s, cheapens the brand | Flat brass accent, hairline borders, no gradients on UI |
| Rotating client-logo strip | Meaningless for residential clients | Named projects with locations and dates |
| Cluttered mega-menu of 30 services | Decision paralysis | 3-group nav, 9 services grouped into 3 intents (§3.9) |
| Cost calculator that outputs a single big number | Feels like a sales trick; sets up disappointment | Range + confidence + exclusions + assumptions (§5.2) |
| "Contact us" as the only CTA | Too high commitment for a lurker (R-03) | Commitment ladder of 5 CTA tiers (§0.5) |
| Chat widget popping open at 3 seconds | Universally hated, hurts CLS and trust | Persistent, quiet, user-initiated dock (§3.11) |
| Auto-playing music or full-screen intro loaders | Vanity, kills bounce rate on mobile | Sub-400ms first paint, no preloader on repeat visits (§7.6) |
| Testimonials as anonymous italic quotes | Reads fabricated | Attributed, project-linked, dated, photo-backed (§3.13) |
| Endless parallax on every section | Motion sickness, jank on mid-range Android | Motion budget, 4 approved patterns only (§7.2) |
| Watermarked / stock "AI room design" | Looks cheap, undermines the premium claim | Owned generation pipeline, clean output, our frame (§5.3) |

## 0.3 The asset constraint, reframed as strategy

**Confirmed constraint:** few photos, poor quality.

This would sink a conventional image-first luxury site. We therefore adopt a **five-layer visual system** where photography is only one layer and never load-bearing:

1. **Typography as primary visual** (R-08) — oversized editorial serif carries the emotional weight.
2. **Material & texture layer** — macro crops of real materials (teak grain, terrazzo, brushed brass, lime plaster, marble edge). These are *cheap to shoot well* on a phone with natural light and read as luxurious. A 60mm macro of a real joinery corner outperforms a bad wide shot of a whole room.
3. **Technical drawing layer** — floor plans, elevations, section drawings, dimension callouts rendered as vector line art in Brass on Basalt. This communicates engineering rigour, costs nothing to produce from existing CAD, and is *completely absent* from competitor sites. **This is our strongest visual differentiator.**
4. **3D layer** — a single Three.js spatial element and a 3D material-explorer (§7.4), used sparingly.
5. **Photography layer** — documentary, high-grain-tolerant, always processed through a unified grade (§8.1) so inconsistent source quality becomes a deliberate house style.

**Companion deliverable:** §8.2 contains a prioritised **Photography Remediation Plan** — a 3-day, low-budget shot list that lifts the asset library to a usable baseline, ranked by conversion impact per rupee.

## 0.4 Positioning: premium *and* mid-market without diluting either

Confirmed positioning is a mix — dream-home clients alongside standard renovations. The failure mode is looking too expensive for the mid-market and too cheap for the premium client. Three mechanisms resolve it:

1. **Tier the offer, not the brand.** One visual identity, three named tiers (§4.6): **Essential**, **Signature**, **Bespoke**. The brand always looks premium; the *packages* create accessibility. Apple sells a ₹40k iPhone SE and a ₹1.8L Pro on one identity — same logic.
2. **Publish honest ranges, never single prices.** R-11 shows the ranges are public knowledge anyway. Concealing them signals something to hide and repels the mid-market; publishing them with clear assumptions signals confidence and repels no one.
3. **Segment at the fork, not the door.** The homepage does not ask "what's your budget?" The estimator does, at step 4, after value has already been delivered.

## 0.5 The commitment ladder — our core conversion architecture

Because the highest-value visitors research silently (R-03), a single "Contact Us" CTA leaks almost all of them. We instead offer five rungs, each demanding slightly more:

| Rung | Action | Data captured | Placement |
|---|---|---|---|
| **1 · Zero commitment** | Browse projects, read process, watch a build film | Anonymous analytics only | Everywhere |
| **2 · Micro-commitment** | Save a project to a **Shortlist** (local, no login) | Local intent signal, no PII | Every project card |
| **3 · Value exchange** | Run the **AI Cost Estimator** → see result *before* asking for anything | Project type, area, city, tier | Global, header + all service pages |
| **4 · Soft identity** | Email/WhatsApp the estimate or a materials spec sheet to yourself | Name + one channel | After estimator result, after shortlist ≥ 2 |
| **5 · Full lead** | Book a site visit / consultation with a real slot | Full contact + project brief + timeline | Contact, sticky CTA, post-estimate |

**Rule:** never present rung 5 before the visitor has been offered a rung 3 value exchange on that page. **Rule:** the estimator *always* shows the result before asking for contact details. Gating the number is the most common and most damaging mistake in this category — it converts a trust-building moment into a bait-and-switch.

## 0.6 Audience segments and their decisive questions

| Segment | Emotional driver | The question that decides it | Where we answer it |
|---|---|---|---|
| First-time home builder | Fear of the unknown; fear of being cheated | "What actually happens, in what order, and when do I pay?" | Process page with payment-milestone map (§4.7) |
| Renovating homeowner | Disruption anxiety; "will I live in a building site?" | "How long will my house be unusable?" | Renovation service page: Occupancy Timeline module |
| Premium interiors client | Taste validation; status | "Do these people have *taste*, or just tools?" | Portfolio art direction + material library (§4.4) |
| Family building a dream home | Legacy, emotion, joint decision-making | "Will my spouse/parents agree, and can I show them this?" | Shareable project pages + Shortlist share link |
| Commercial client | Downtime cost, compliance, predictability | "Can you deliver on a fixed date, with documentation?" | Commercial track (§4.14) — different tone, SLA table |
| Office renovation client | Staff disruption, phasing | "Can you work nights/weekends and in phases?" | Commercial track, Phasing module |
| Villa owner | Bespoke expectations, privacy | "Will you customise, and will you keep it confidential?" | Bespoke tier + NDA note |
| Apartment owner | Society rules, lift access, permissions | "Do you know how to handle my society's rules?" | Apartment FAQ cluster + society-NOC checklist download |

## 0.7 What creates hesitation — and the exact antidote

| Hesitation | Antidote component | Location |
|---|---|---|
| "The price will balloon" | Payment milestone map + written change-order policy + published escalation clause | §4.7, §4.6 |
| "They'll vanish mid-project" | Live project tracker screenshots, team page with faces + tenure, registration/GST proof | §4.2, §4.7 |
| "They won't finish on time" | Delivered-on-time counter with *actual* project dates, honest delay disclosure | §4.1 stat band |
| "Quality will be hidden behind paint" | **Behind-the-Wall** module: photos of waterproofing, conduiting, plumbing before closure | §4.4 — a signature differentiator |
| "I don't know what I'm signing" | Downloadable sample contract + sample BOQ | §4.7 |
| "Am I overpaying?" | Estimator with published rate assumptions | §5.2 |
| "Is anyone real here?" | Named human on every CTA, WhatsApp with a person's name and photo | §3.11 |
| "Will they understand my style?" | AI Design Assistant + material library | §5.3, §4.4 |

## 0.8 Competitive differentiation summary

Ranked by defensibility:

1. **The Behind-the-Wall module** — publishing concealed-works photography (waterproofing membranes, conduit runs, plumbing pressure tests) before closure. No competitor does this. It converts the industry's biggest fear into our biggest proof. Costs nothing but discipline on site.
2. **Technical-drawing visual language** — plans and sections as decorative/structural graphics. Free from existing CAD, instantly signals engineering credibility, and solves the photography gap.
3. **An honest estimator** — publishing exclusions and assumptions alongside the range.
4. **AI room redesign** with clean, unwatermarked output framed in our identity.
5. **Payment milestone transparency** — publishing the payment schedule publicly.
6. **Materials library** — a browsable catalogue of the actual materials used, with grades and brands.

---
---

# PART 1 — BRAND FOUNDATION

## 1.1 The name — ZYVORA

**Confirmed name:** ZYVORA
**Confirmed descriptor:** Construction • Interiors • Renovation

### 1.1.1 Honest assessment of the name

ZYVORA is a **coined name** — an invented word with no prior meaning. That is a deliberate and defensible choice, but it comes with a specific trade-off that must shape every design decision downstream.

**What a coined name gives us**

| Advantage | Why it matters here |
|---|---|
| **Fully ownable** | Trademarkable, domain-available, no competitor named anything similar. "Shree Construction" is unownable; ZYVORA is ours permanently. |
| **No category baggage** | It doesn't sound like a contractor, which is exactly what the brief asked for. It sits comfortably next to Apple/Stripe/Linear rather than next to local builders. |
| **Spans all three business lines equally** | "Zyvora Constructions" would have trapped us. ZYVORA covers construction, interiors *and* renovation without favouring one — critical, because our positioning is a single accountable party for the whole build. |
| **Scales geographically** | Nothing ties it to one city or language. |
| **Short, high-contrast, memorable** | Three syllables, `Z` and `V` are low-frequency letters, so it sticks. |

**What a coined name costs us — and this is the important part**

A coined name carries **zero inherent meaning**. "Sthapati" or "Bhoomi" would have told a visitor something in the first half-second. ZYVORA tells them nothing. It also reads slightly *tech/pharma* rather than *built environment* — `Zy-` and `-ora` are patterns common in software and medicine.

**Therefore, three non-negotiable consequences for this design system:**

1. **The descriptor lockup is permanent, not optional.** The wordmark almost never appears alone. `ZYVORA` + `Construction • Interiors • Renovation` is the primary mark. The descriptor is doing the semantic work the name cannot.
2. **The visual identity must carry 100% of the category meaning.** This raises the importance of the technical-drawing layer, the material photography, and the monospace/dimension language (§0.3). With a coined name, materiality *is* the brand.
3. **Every first-impression surface must state what we do within the first line of copy** — the homepage hero, the OG description, the meta title, the WhatsApp preview. We can never assume the name did that job.

> **Recommendation:** keep ZYVORA. The trade-off is worth it, and the mitigations above are already built into this design system. But do not weaken the descriptor lockup to "look cleaner" — that is the single most likely way to damage this brand.

### 1.1.2 The lockup

**Primary (default everywhere):**
```
ZYVORA
Construction • Interiors • Renovation
```
- Wordmark: Fraunces 300, all caps, `+0.08em` tracking.
- Descriptor: Inter 500, `label` role (12px), `+0.10em` tracking, all caps, colour `--text-muted` (or `brass-300` on dark).
- Descriptor width is optically matched to the wordmark width (letterspace the descriptor to fit — this is a classic architectural-studio lockup and reads instantly as considered).
- Vertical gap between wordmark baseline and descriptor cap-height: `0.6 × descriptor cap-height`.
- **Bullet separators are `•` (U+2022)**, never `|`, `/`, or `-`.

**Horizontal variant** (header at ≥1280px, email signatures):
`ZYVORA` `│` `Construction • Interiors • Renovation` — separated by a 1px vertical hairline in `--border-hairline`, 16px padding either side.

**Compact variant** (mobile header, ≤640px): wordmark only. This is the *only* context where the descriptor may be dropped, and only because the hero headline immediately below states the category.

**Pronunciation:** `zy-VOR-ah` (`/zaɪˈvɔːrə/`). Publish this once in the About page footnote — coined names get mispronounced, and a mispronounced brand doesn't get referred verbally. Referral is 69% of hires in this category (R-02), so verbal transmissibility is a commercial concern, not a vanity one.

### 1.1.3 The Z monogram — a genuine asset

The letter `Z` is the most structurally expressive letter in the Latin alphabet: two horizontals joined by a diagonal. That is, precisely, **a braced frame** — the diagonal member that stops a rectangular structure from racking. It is the single most fundamental idea in structural engineering, and it is sitting inside our name for free.

**Monogram plate specification**
```
┌─────────────────┐   1:1 square, radius-sm
│  ─────────────  │   Top chord   — 1.5px brass hairline
│      ╱          │
│    ╱            │   Diagonal brace — 2.5px, brass-500
│  ╱              │
│  ─────────────  │   Bottom chord — 1.5px brass hairline
└─────────────────┘   1px hairline border, basalt-900 fill
```
- The `Z` is drawn as a **structural diagram**, not as a typographic letter: distinct chord and brace weights, mitred joints, and — at sizes ≥64px — small node dots at the two joints, exactly as a truss diagram would render them.
- This makes the monogram simultaneously a letter and an engineering drawing. It reinforces the technical-drawing visual language (§0.3, layer 3) and gives the coined name the categorical meaning §1.1.1 says it lacks.
- **Uses:** favicon, app icon, WhatsApp avatar, video play affordance, admin nav, loading indicator, watermark on downloadable PDFs, and as an oversized `basalt-100` background graphic on section breaks.

**Animated variant (loading / route progress):** the top chord draws, then the brace, then the bottom chord — 900ms total, `--ease-standard`, looping. It reads as *a structure being assembled*. This is the one place a branded loading animation is justified, because it is under 1KB of SVG and communicates the brand thesis in one second.

### 1.1.4 Naming the sub-brands
| Surface | Name | Note |
|---|---|---|
| Cost estimator | **ZYVORA Estimate** | Plain. Not "AI Estimator" — see §5.1 principle 6 |
| Room redesign | **ZYVORA Studio** | Not "AI Design Assistant" |
| Blog | **The Zyvora Journal** | Sentence case in body copy |
| Tiers | Essential · Signature · Bespoke | Never prefixed with the brand name |
| Client shortlist | **My Shortlist** | Never "ZYVORA Shortlist" — it's the user's, not ours |

## 1.2 Positioning statement

> For families and businesses in {{CITY}} who will only build once, {{BRAND_NAME}} is the builder that shows you what's behind the wall. We publish our process, our prices and our concealed work — because the only real luxury in construction is not having to worry.

**Category:** Turnkey construction and interiors.
**Frame of reference:** Not "a contractor." A *single accountable party* for the whole build.
**Point of difference:** Radical transparency, executed beautifully.
**Reason to believe:** Published payment milestones, published rate assumptions, published concealed-works photography, named team.

## 1.3 Brand personality

| Trait | Expression in the product | Explicit anti-pattern |
|---|---|---|
| **Precise** | Real dimensions, dates and quantities in copy. Monospace numerals. | Rounded marketing figures ("100+ happy families") |
| **Unhurried** | Long scroll, generous whitespace, no urgency timers | Countdowns, "3 slots left" |
| **Candid** | We state limitations and exclusions plainly | Hedging, "starting from ₹999*" |
| **Warm** | Human faces, first names, plain Indian-English | Corporate third-person ("The company strives to…") |
| **Restrained** | Brass used at <5% of surface area | Gold gradients, gloss, glow |

## 1.4 Voice and tone

**Principles**

1. **Lead with the fact, follow with the feeling.** *"Handover in 11 months. That's one monsoon, not three."*
2. **Use second person.** *Your* home, *your* budget. Never "the client."
3. **Numbers over adjectives.** Not "highly experienced" — "{{FOUNDED_YEAR}}. 61 homes. 4 we'd do differently, and we'll tell you which."
4. **Short sentences. Indian-English, not American.** Lakh and crore, not million. Sq ft, not square footage.
5. **Never apologise for price. Explain it.**

**Tone modulation by surface**

| Surface | Tone |
|---|---|
| Homepage hero | Confident, spare, declarative |
| Service pages | Explanatory, practical, reassuring |
| Project pages | Editorial, third-person, restrained |
| Process page | Instructional, precise, calming |
| Estimator | Neutral, factual, non-salesy |
| Forms & errors | Plain, helpful, never blaming the user |
| Admin | Terse, functional, information-dense |

## 1.5 Logo & identity system (specification for the identity designer)

- **Primary mark:** wordmark only, set in the display serif, letterspaced `+0.06em`, all caps. No pictorial logo in v1 — an icon requires equity we don't yet have and usually reads as clip-art in this category.
- **Secondary mark:** a **monogram plate** — the letter `S` cut into a 1:1 square with a 1px Brass hairline border, used as favicon, app icon, WhatsApp avatar, and the video-play affordance.
- **Signature graphic device — "the datum line":** a 1px horizontal rule with a small tick and a monospace label, borrowed from architectural drawings. Used to caption sections, mark stat bands, and separate content. This device is the connective tissue of the whole identity and appears on every page.
  ```
  ────────────┬──────────────────────────────
              │ 01 — SELECTED WORK
  ```
- **Clear space:** minimum of the wordmark's cap-height on all sides.
- **Minimum size:** 96px wide (digital). Below that, use the monogram plate.
- **Never:** apply gradients, drop shadows, outlines, or rotation to the wordmark; place it on a busy photograph without a scrim.

---
---

# PART 2 — DESIGN TOKENS

All tokens are defined as CSS custom properties on `:root` and consumed through the Tailwind theme. **No raw hex values, no arbitrary pixel values, anywhere in component code.** This is enforced by lint rule (see `implementationplan.md` Phase 4).

## 2.1 Colour

### 2.1.1 Philosophy
Luxury in this category reads as **restraint plus warmth**. Pure black (`#000`) reads digital and cold; pure white (`#fff`) reads clinical and cheap. Our neutrals are warm — every neutral has a yellow/red bias. Accent usage is severely capped: **Brass may occupy no more than 5% of any viewport.** Scarcity is what makes a metallic read as precious rather than gaudy.

Colour psychology rationale:
- **Warm off-black (Basalt)** — gravity, permanence, and it makes mediocre photography look intentional. Dark surfaces are how luxury interior sites make images glow (R-09).
- **Warm paper (Lime Wash)** — reads as plaster and daylight; strongly associated with finished, lived-in interiors rather than software.
- **Brass** — the single accent. Metal, craft, hardware, hand-finished. Distinct from the orange/gold gradients that saturate this category.
- **Kota** (deep slate-green) — Indian stone reference; used for secondary surfaces and quiet UI.
- **Blueprint** (desaturated ink blue) — reserved *exclusively* for the technical layer: drawings, dimensions, estimator UI, specs. This colour separation is a semantic signal — when the user sees Blueprint, they are looking at engineering truth, not marketing.

### 2.1.2 Core ramps

```
/* NEUTRAL — warm */
--basalt-950: #0B0B09   /* deepest bg, dark mode canvas          */
--basalt-900: #0E0E0C   /* primary dark surface                  */
--basalt-800: #161613   /* raised dark surface / cards           */
--basalt-700: #21211D   /* dark borders, hairlines               */
--basalt-600: #3A3A34   /* disabled text on dark                 */
--basalt-500: #5C5C53   /* muted text on dark                    */
--basalt-400: #8A8A7E   /* secondary text on dark                */
--basalt-300: #B5B5A8   /* tertiary                              */
--basalt-200: #D9D6CC   /* light borders                         */
--basalt-100: #EAE7DE   /* light raised surface                  */
--basalt-050: #F5F2ED   /* LIME WASH — primary light surface     */
--basalt-000: #FBFAF7   /* highest light surface / input fields  */

/* INK — text on light */
--ink-900: #14140F      /* headings                              */
--ink-700: #33332B      /* body                                  */
--ink-500: #63635A      /* secondary / captions                  */
--ink-300: #97978C      /* placeholder / disabled                */

/* BRASS — the accent. Use sparingly. */
--brass-700: #7D6229    /* pressed state, text on light          */
--brass-600: #96762F    /* accessible accent text on light (AA)  */
--brass-500: #B08D3F    /* BASE — rules, ticks, icon accents     */
--brass-400: #C7A65C    /* hover on dark                         */
--brass-300: #DCC48F    /* accent text on dark (AA on basalt-900)*/
--brass-100: #F0E6CE    /* tint fills                            */

/* KOTA — secondary surface */
--kota-800: #2A322E
--kota-600: #3A423E
--kota-400: #64706A
--kota-200: #C3CBC6

/* BLUEPRINT — technical layer only */
--blueprint-700: #1E3550
--blueprint-500: #2B4B6F
--blueprint-300: #7C9BBA
--blueprint-100: #DCE6EF

/* SEMANTIC */
--success-600: #3E7A56   --success-100: #E1F0E7
--warning-600: #B4741F   --warning-100: #FBEEDA
--danger-600:  #A63A2E   --danger-100:  #F8E3E0
--info-600:    #2B4B6F   --info-100:    #DCE6EF
```

### 2.1.3 Semantic aliases (what components actually consume)

| Token | Light | Dark |
|---|---|---|
| `--bg-canvas` | `basalt-050` | `basalt-950` |
| `--bg-surface` | `basalt-000` | `basalt-900` |
| `--bg-raised` | `#FFFFFF` | `basalt-800` |
| `--bg-inverse` | `basalt-900` | `basalt-050` |
| `--bg-technical` | `blueprint-100` | `blueprint-700` |
| `--text-primary` | `ink-900` | `basalt-050` |
| `--text-secondary` | `ink-700` | `basalt-300` |
| `--text-muted` | `ink-500` | `basalt-400` |
| `--text-accent` | `brass-600` | `brass-300` |
| `--text-inverse` | `basalt-050` | `ink-900` |
| `--border-hairline` | `basalt-200` | `basalt-700` |
| `--border-strong` | `ink-900` | `basalt-050` |
| `--border-accent` | `brass-500` | `brass-500` |
| `--focus-ring` | `brass-600` | `brass-400` |
| `--overlay-scrim` | `rgba(11,11,9,0.62)` | `rgba(11,11,9,0.76)` |

### 2.1.4 Contrast compliance (verified)

| Pair | Ratio | Verdict |
|---|---|---|
| `ink-900` on `basalt-050` | 15.6:1 | AAA |
| `ink-700` on `basalt-050` | 10.9:1 | AAA |
| `ink-500` on `basalt-050` | 5.3:1 | AA (body ok, AAA fail — captions only ≥14px) |
| `basalt-050` on `basalt-900` | 14.8:1 | AAA |
| `basalt-300` on `basalt-900` | 8.9:1 | AAA |
| `brass-600` on `basalt-050` | 4.6:1 | AA (≥16px or bold) |
| `brass-500` on `basalt-050` | 3.4:1 | **Large text & non-text only** — never body copy |
| `brass-300` on `basalt-900` | 8.1:1 | AAA |
| `brass-500` on `basalt-900` | 5.1:1 | AA |

**Hard rule:** `brass-500` is a *graphic* colour (rules, ticks, icon strokes, borders). For text on light, always `brass-600` or darker.

### 2.1.5 Colour usage budget per viewport

| Role | Max coverage |
|---|---|
| Neutral surface | 70–90% |
| Photography / media | 10–40% |
| Brass accent | **≤5%** |
| Blueprint | ≤15% in *editorial* contexts, and only where genuinely technical. **Exception:** surfaces whose entire purpose is engineering output — the estimator (§5.2), the homepage estimator band (S07), and project fact tables — may go full-bleed Blueprint. The cap exists to stop Blueprint leaking into marketing sections, not to limit it where it is the correct semantic surface. |
| Semantic (success/danger) | Only in feedback states |

## 2.2 Typography

### 2.2.1 Families

| Role | Typeface | Rationale | Loading |
|---|---|---|---|
| **Display** | **Fraunces** (variable: `opsz`, `wght`, `SOFT`, `WONK`) | High-contrast old-style serif with an optical-size axis — at display sizes it becomes genuinely editorial (R-08); at small sizes it stays legible. Open-source, so no licence risk for a small business, and variable so we ship one file. | `next/font/local`, subset latin, `display: swap`, preloaded |
| **Text / UI** | **Inter Variable** | Neutral grotesk with excellent Indian-English rendering, tabular figure support, and huge language coverage. Recedes so the serif can perform. | `next/font/local`, subset latin + latin-ext |
| **Technical / numerals** | **JetBrains Mono** (weights 400, 500) | Used for dimensions, costs, dates, spec codes, datum labels. Monospace numerals are the single cheapest signal of engineering precision and are a core identity device. | `next/font/local`, subset latin + numerals |
| **Devanagari (optional Phase 11)** | **Noto Serif Devanagari** / **Noto Sans Devanagari** | If a Hindi/Marathi locale is added. Metrics-matched pairing to the Latin. | Lazy, per-locale |

**Paid upgrade path (optional, not required):** if budget appears, swap Display for *PP Editorial New* or *Ogg* and Text for *Söhne*. The token structure makes this a one-file change. Do not do this in v1 — Fraunces is genuinely excellent and licence-free.

**Font budget:** ≤ 3 files, ≤ 190KB total woff2, all self-hosted. No Google Fonts CDN (privacy + an extra connection on the critical path).

### 2.2.2 Type scale (fluid)

Ratio: **1.200 (minor third)** at mobile → **1.333 (perfect fourth)** at desktop. Widening the ratio on large screens creates the editorial drama luxury requires without breaking mobile hierarchy.

| Token | Mobile (375) | Desktop (1440) | `clamp()` | Family / weight / tracking / leading |
|---|---|---|---|---|
| `display-xxl` | 48px | 132px | `clamp(3rem, 1.2rem + 9.2vw, 8.25rem)` | Fraunces 300, `opsz 144`, `-0.03em`, `0.92` |
| `display-xl` | 40px | 96px | `clamp(2.5rem, 1.3rem + 5.1vw, 6rem)` | Fraunces 300, `opsz 120`, `-0.025em`, `0.95` |
| `display-lg` | 32px | 68px | `clamp(2rem, 1.2rem + 3.4vw, 4.25rem)` | Fraunces 400, `opsz 72`, `-0.02em`, `1.02` |
| `heading-xl` | 28px | 48px | `clamp(1.75rem, 1.2rem + 2.3vw, 3rem)` | Fraunces 400, `-0.015em`, `1.1` |
| `heading-lg` | 24px | 36px | `clamp(1.5rem, 1.2rem + 1.3vw, 2.25rem)` | Fraunces 400, `-0.01em`, `1.15` |
| `heading-md` | 20px | 28px | `clamp(1.25rem, 1.1rem + 0.6vw, 1.75rem)` | Inter 600, `-0.01em`, `1.25` |
| `heading-sm` | 18px | 22px | `clamp(1.125rem, 1.05rem + 0.3vw, 1.375rem)` | Inter 600, `-0.005em`, `1.3` |
| `body-lg` | 18px | 20px | `clamp(1.125rem, 1.08rem + 0.2vw, 1.25rem)` | Inter 400, `0`, `1.65` |
| `body-md` | 16px | 17px | `clamp(1rem, 0.98rem + 0.1vw, 1.0625rem)` | Inter 400, `0`, `1.7` |
| `body-sm` | 14px | 15px | `—` | Inter 400, `0`, `1.6` |
| `caption` | 13px | 13px | `—` | Inter 400, `0.01em`, `1.45` |
| `label` | 12px | 12px | `—` | Inter 500, `0.08em`, `1.3`, **uppercase** |
| `datum` | 11px | 12px | `—` | JetBrains Mono 400, `0.1em`, `1.2`, **uppercase** |
| `numeral-xl` | 40px | 72px | `clamp(2.5rem, 1.6rem + 3.8vw, 4.5rem)` | JetBrains Mono 300, `-0.02em`, `1.0`, `tnum` |
| `numeral-md` | 20px | 24px | `—` | JetBrains Mono 500, `0`, `1.2`, `tnum` |

### 2.2.3 Typographic rules

- **Measure:** body text `max-width: 68ch`; long-form article body `72ch`; display headings `≤16ch` on desktop, `≤20ch` mobile. Never full-bleed body text.
- **Widow/orphan control:** last two words of every heading joined with a non-breaking space via a `<Balance>` text-wrap utility (`text-wrap: balance` with a JS fallback for headings only — never on body, it's expensive).
- **Numerals:** `font-variant-numeric: tabular-nums` on every price, date, dimension, and stat. Non-negotiable — proportional figures in a stat band look amateur.
- **All-caps:** only `label` and `datum` roles, and always with `+0.08em` tracking minimum.
- **Italics:** Fraunces italic for pull-quotes and image captions only. Never for emphasis in body — use weight.
- **Hyphenation:** off for headings, `auto` for justified article body (which we do not use — body is always ragged-right; justification with hyphenation creates rivers at our measure).
- **Ligatures:** `liga` + `dlig` on display sizes only.
- **Optical alignment:** display headings that begin with a quote, `A`, `V`, `W`, `T`, `Y`, or `J` get a negative left inset (`--optical-inset: -0.06em`) so the type block aligns to the grid optically rather than mathematically. This is a detail almost nobody implements and it separates a real design system from a template.

## 2.3 Spacing

Base unit **4px**. Primary rhythm **8px**. Named scale (never use arbitrary values):

```
--space-0:   0
--space-1:   4px      --space-2:   8px      --space-3:  12px
--space-4:  16px      --space-5:  20px      --space-6:  24px
--space-8:  32px      --space-10: 40px      --space-12: 48px
--space-16: 64px      --space-20: 80px      --space-24: 96px
--space-32: 128px     --space-40: 160px     --space-48: 192px
--space-64: 256px
```

### Vertical rhythm — section padding

| Breakpoint | Standard section | Feature section | Editorial break |
|---|---|---|---|
| `sm` (<640) | `--space-16` (64) | `--space-20` (80) | `--space-24` (96) |
| `md` (≥768) | `--space-20` (80) | `--space-24` (96) | `--space-32` (128) |
| `lg` (≥1024) | `--space-24` (96) | `--space-32` (128) | `--space-40` (160) |
| `xl` (≥1280) | `--space-32` (128) | `--space-40` (160) | `--space-48` (192) |

**Why so generous:** whitespace is the cheapest luxury signal available and it costs zero kilobytes (R-08). Cramped padding is the fastest way to look mid-market. The risk is excessive scroll on mobile, which is why mobile padding is roughly half of desktop.

### Component internal spacing

| Component | Padding |
|---|---|
| Button (md) | `12px 24px` |
| Button (lg) | `16px 32px` |
| Card | `24px` mobile / `32px` desktop |
| Input | `14px 16px` |
| Modal | `24px` mobile / `40px` desktop |
| Nav bar | `16px 24px` mobile / `20px 40px` desktop |
| Table cell | `12px 16px` |

## 2.4 Grid & layout

### 2.4.1 Containers

| Token | Max width | Use |
|---|---|---|
| `container-full` | 100vw | Full-bleed media, hero, 3D canvas |
| `container-wide` | 1600px | Portfolio grids, gallery |
| `container-base` | 1360px | **Default page container** |
| `container-narrow` | 1040px | Forms, process, estimator |
| `container-prose` | 720px | Blog body, legal, long-form |

Horizontal gutters: `20px` (<640) → `32px` (≥768) → `48px` (≥1024) → `64px` (≥1440).

### 2.4.2 Column grid

| Breakpoint | Columns | Gutter |
|---|---|---|
| `<640` | 4 | 16px |
| `640–1023` | 8 | 24px |
| `1024–1439` | 12 | 24px |
| `≥1440` | 12 | 32px |

### 2.4.3 The asymmetric editorial grid — signature layout device

Standard 12-column symmetry reads corporate. Our signature layout offsets content into a **7 / 5** or **5 / 7** split with a **1-column bleed**, echoing architectural plan drawings. Applied to: project intros, service page headers, about page, blog headers.

```
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │10 │11 │12 │
│ ◄──── heading, cols 1–5 ────► │               │
│                   │ ◄──── body, cols 7–11 ──► │
│ ◄──────────── media, cols 1–8, bleeds left ───┤
```

**Rule:** any page using the asymmetric grid must return to symmetry for its conversion section. Asymmetry creates interest; symmetry creates trust. Forms and CTAs are always centred and symmetric.

### 2.4.4 Baseline grid
An 8px baseline grid governs vertical rhythm. Display type is exempt (optical placement wins over mathematical). A dev-only overlay toggled with `Ctrl+G` renders both the column and baseline grid.

## 2.5 Radius, borders, elevation

```
--radius-none: 0        /* default for most surfaces */
--radius-sm:   2px      /* inputs, chips, small controls */
--radius-md:   4px      /* cards, images */
--radius-lg:   8px      /* modals, sheets */
--radius-full: 9999px   /* avatars, pills, icon buttons only */
```

**Philosophy:** near-square. Architecture is orthogonal; large radii read as consumer-app friendly, not built. `radius-full` is restricted to avatars and the WhatsApp dock.

**Borders:** the system is **hairline-first**. `1px solid var(--border-hairline)` is the default separator. On screens ≥2dppx, hairlines render at `0.5px` via a `transform: scaleY(0.5)` pseudo-element for genuine optical fineness.

**Elevation:** we largely reject drop shadows — architecture has no drop shadows, and shadow-heavy UI reads as 2016 Material. Separation is achieved with **borders, background steps, and space**. Only three shadows exist:

```
--shadow-sheet:  0 1px 2px rgba(11,11,9,.04), 0 8px 24px rgba(11,11,9,.06);  /* dropdowns, popovers */
--shadow-modal:  0 2px 8px rgba(11,11,9,.08), 0 32px 64px rgba(11,11,9,.14); /* modals, sheets */
--shadow-lift:   0 1px 1px rgba(11,11,9,.03), 0 12px 32px rgba(11,11,9,.10); /* card hover ONLY */
```

## 2.6 Motion tokens

```
--dur-instant: 80ms      /* state flips: checkbox, toggle */
--dur-fast:    160ms     /* hover, focus */
--dur-base:    280ms     /* most transitions */
--dur-slow:    480ms     /* panels, sheets, reveals */
--dur-cinema:  900ms     /* hero and scene transitions */

--ease-standard: cubic-bezier(0.32, 0.72, 0, 1);   /* the house curve */
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1);    /* entrances */
--ease-in:       cubic-bezier(0.7, 0, 0.84, 0);    /* exits */
--ease-inout:    cubic-bezier(0.65, 0, 0.35, 1);
--ease-linear:   linear;                            /* scroll-linked only */
```

`--ease-standard` is the house curve: a fast start with a very long, gentle settle. It reads as *weight* — objects that have mass and come to rest. This is the motion equivalent of the brand's "unhurried" trait. Bouncy/elastic easing is **banned** — it reads playful and undermines engineering credibility.

## 2.7 Z-index scale

```
--z-base:        0
--z-raised:      10    /* sticky section headers */
--z-sticky-cta:  30    /* mobile bottom CTA bar */
--z-header:      40
--z-dock:        50    /* WhatsApp / contact dock */
--z-drawer:      60    /* mobile nav, filter drawer */
--z-modal:       70
--z-toast:       80
--z-devtools:    90
```

## 2.8 Iconography

- **Library:** **Lucide** (ships with shadcn/ui) as the base, with a **custom 18-icon craft set** drawn in-house.
- **Grid:** 24×24, **1.25px stroke** (not the default 2px — a finer stroke reads more precise and pairs with our hairlines), butt caps, miter joins, no fills.
- **Custom craft set** (these do not exist in any icon library and are a real identity asset): trowel, plumb-bob, spirit level, brick-bond, rebar cross-section, waterproof-membrane layer, conduit run, false-ceiling section, modular-cabinet elevation, paint-roller, tile-layout, staircase-section, column-footing, window-jamb detail, joinery-dovetail, MEP-riser, load-path arrow, monsoon/water-drop-on-slab.
- **Sizes:** `16 / 20 / 24 / 32`. Below 16px, icons are banned — use a label.
- **Colour:** icons inherit `currentColor`. Brass icons only for accent moments, never in dense UI.
- **Never:** filled icons, duotone, emoji, or icons without an adjacent text label in navigation or CTAs.

## 2.9 Token file structure

```
styles/
  tokens/
    color.css        — ramps + light/dark semantic aliases
    typography.css   — families, scale, features
    space.css
    layout.css       — containers, grid, breakpoints
    radius.css
    shadow.css
    motion.css
    z-index.css
  globals.css        — resets, base element styles, focus, selection
```
Tailwind's theme is generated *from* these CSS variables so both `class="text-brass-500"` and `var(--brass-500)` resolve to a single source of truth.

---
---

# PART 3 — COMPONENT LIBRARY

## 3.0 Component hierarchy

```
FOUNDATION      tokens · reset · typography primitives · icon · datum-line
PRIMITIVES      Button · Link · Input · Textarea · Select · Checkbox · Radio · Switch
                Slider · Chip · Badge · Avatar · Tooltip · Skeleton · Spinner · Divider
COMPOSITES      Card · Field · FormRow · Stepper · Tabs · Accordion · Dropdown · Popover
                Modal · Sheet · Toast · Table · Pagination · Breadcrumb · EmptyState
DOMAIN          ProjectCard · ServiceCard · TestimonialCard · MaterialSwatch · StatBand
                BeforeAfter · ProcessStep · CostRangeBar · BehindTheWall · TeamCard
                ArticleCard · FAQItem · ShortlistButton · TrustBar · GalleryMasonry
SECTIONS        Hero · SectionHeader · SplitFeature · MarqueeStrip · CTABand · FooterMega
SHELL           Header · MobileNav · ContactDock · StickyCTABar · Footer · PageTransition
ADMIN           AdminShell · DataTable · KPICard · LeadDrawer · MediaUploader · RichEditor
```

**Rule:** a component may only import from layers above it. Domain components never import other domain components except through `children`. This prevents the coupling that makes design systems rot.

## 3.1 Button

### Variants

| Variant | Use | Light appearance | Dark appearance |
|---|---|---|---|
| `primary` | The single most important action on a screen. **Max one per viewport.** | `bg: ink-900`, `text: basalt-050`, no border | `bg: basalt-050`, `text: ink-900` |
| `secondary` | Supporting action | transparent bg, `1px solid ink-900`, `text: ink-900` | transparent, `1px solid basalt-050` |
| `accent` | Conversion actions only (Book a visit, Get estimate) | `bg: brass-600`, `text: basalt-000` | `bg: brass-500`, `text: basalt-950` |
| `ghost` | Tertiary, in-toolbar | transparent, `text: ink-700`, hover `bg: basalt-100` | transparent, `text: basalt-300` |
| `link` | Inline text action | `text: brass-600`, animated underline | `text: brass-300` |
| `whatsapp` | The WhatsApp channel only | `bg: #128C7E`, white text, WhatsApp glyph | same |
| `danger` | Destructive, admin only | `bg: danger-600`, white | same |

### Sizes

| Size | Height | Padding | Type | Icon |
|---|---|---|---|---|
| `sm` | 36px | `8px 16px` | `body-sm` 500 | 16 |
| `md` | 44px | `12px 24px` | `body-md` 500 | 20 |
| `lg` | 54px | `16px 32px` | `body-lg` 500 | 20 |
| `xl` | 64px | `20px 40px` | `heading-sm` | 24 |

**All interactive targets are ≥44×44px including on desktop.** `sm` buttons get an invisible expanded hit area via `::after`.

### States (every variant implements all seven)

| State | Treatment |
|---|---|
| `default` | As specified |
| `hover` | Background darkens/lightens by one ramp step. **Transform: none.** Buttons do not lift or scale — that reads consumer-app. Instead, an **inset 1px brass hairline** wipes in from the left over `--dur-fast`. This is a signature detail. |
| `focus-visible` | `outline: 2px solid var(--focus-ring); outline-offset: 3px`. Never removed. |
| `active` | Background steps one further; `transform: translateY(0.5px)` — a barely perceptible press |
| `loading` | Label stays in place at 40% opacity, a 16px spinner cross-fades in centre. **Width is locked** to prevent layout shift. `aria-busy="true"`. |
| `success` | Label swaps to a check + confirmation word for 1600ms, then reverts. Used on estimator send, shortlist save. |
| `disabled` | 38% opacity, `cursor: not-allowed`, `aria-disabled`. **Never `pointer-events: none`** — the tooltip explaining *why* must remain reachable. |

### Rules
- Label is a verb phrase naming the outcome. See §10.3 lexicon.
- Icons trail the label for forward motion (`→`), lead for object actions (`⤓ Download`).
- A `primary` and an `accent` button never appear in the same viewport — it creates a two-headed CTA and measurably reduces clicks on both.
- Buttons never contain more than 4 words.

## 3.2 Link

Inline links use an **animated underline**: `background-image: linear-gradient(currentColor, currentColor)` with `background-size: 0% 1px` → `100% 1px` on hover, `--dur-base --ease-standard`, origin left. Underline sits at `88%` of the line box with a 2px `text-decoration-skip-ink` equivalent gap. Visited state is not styled on marketing pages (it fragments the palette) but *is* styled in the blog index.

## 3.3 Inputs & form controls

### Text input
- Height 52px, padding `14px 16px`, `radius-sm`, `bg: basalt-000` (light) / `basalt-800` (dark).
- Border: `1px solid basalt-200`; focus: `1px solid ink-900` + `2px` brass outline offset `2px`.
- **Label is always visible and above the field.** Floating labels are banned — they fail for autofill, screen readers, and older users, and this audience skews 30–60.
- Placeholder gives an *example*, never repeats the label: label "Built-up area", placeholder "e.g. 2400".
- Optional fields are marked `(optional)`; required fields carry no asterisk. Marking the minority is clearer.
- Helper text sits below in `caption / text-muted`. Error text replaces it in `danger-600` with a 16px alert icon, and the field border goes `danger-600`.
- **Numeric inputs** (area, budget, phone) use `inputmode="numeric"` and the JetBrains Mono family so digits align. Area and budget inputs render a live-formatted suffix (`2,400 sq ft`, `₹42.5 L`) inside the field, right-aligned, in `text-muted`.

### Textarea
Min-height 132px, `resize: vertical`, character counter appears at 80% of limit.

### Select
Native `<select>` on mobile (system pickers are better than anything we'd build). Custom listbox on `≥1024` via shadcn `Select`, matching input metrics, `--shadow-sheet`, max-height 320px with scroll.

### Checkbox / Radio
20×20, `radius-sm` (checkbox) / `radius-full` (radio), `1.5px` border. Checked: `bg: ink-900` with a `basalt-050` glyph. The whole label row is a hit target, min height 44px.

### Slider (used in the estimator)
Track 2px `basalt-200`, filled portion `brass-500`, thumb 24px `radius-full` `bg: basalt-000` with `1.5px ink-900` border and `--shadow-sheet`. Value renders above the thumb in `numeral-md`. **A numeric input is always paired with every slider** — sliders alone are imprecise and frustrating on a cost tool where the user often knows their exact area.

### Field (composite)
`Label → Control → HelperOrError`. Vertical gaps `8px / 6px`. `FormRow` lays 1–3 Fields on a row at `≥768`, always stacking below.

### Form design rules
1. **One column.** Multi-column forms measurably slow completion. Exception: paired short fields (city + pincode).
2. **Progressive disclosure.** Never show more than 6 fields at once; use the Stepper.
3. **Ask for contact details last**, and only after value has been given (§0.5).
4. **Never ask for what we can infer** — city from IP (editable), project type from the page they came from.
5. **Inline validation on blur, never on keystroke.** Re-validate on keystroke only *after* a field has already errored.
6. **Phone is the primary channel, email secondary.** In this market WhatsApp beats email. The contact field defaults to phone with a WhatsApp opt-in checked by default and clearly labelled.
7. **Every form states what happens next and when**: "We'll call within one working day. We don't share your number."

## 3.4 Card

Base: `bg: --bg-raised`, `1px solid --border-hairline`, `radius-md`, `overflow: hidden`. **No shadow at rest.** Hover (pointer devices only): `--shadow-lift` + border → `basalt-300`, `--dur-base`. Media inside scales `1.0 → 1.03` with the parent clipping. Content never moves.

Variants: `default`, `bordered` (no bg, hairline only — for dense grids), `elevated` (admin), `media` (image-dominant), `flush` (no padding).

## 3.5 Navigation — Header

### Structure (desktop ≥1024)
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ZYVORA          Work   Services   Process   About   Journal    [Estimate]│
└──────────────────────────────────────────────────────────────────────────┘
```
- Height 84px at top → **collapses to 64px** on scroll-down past 120px, with `bg: rgba(canvas, 0.82)` + `backdrop-filter: blur(16px) saturate(140%)` and a bottom hairline. Reveals fully on scroll-up (directional header). Never fully hidden — the CTA must always be one click away.
- Wordmark left, nav centred-right, one `accent` CTA far right.
- **Only 5 nav items.** Research shows decision paralysis in this category; 9 services collapse into a single "Services" panel.
- Active item carries a 1px brass underline offset 6px.
- **Services opens a panel, not a dropdown**: a full-width, 380px-tall sheet that slides down over `--dur-slow`, containing three intent columns (see §3.9) plus a fourth "Explore" column and a featured project thumbnail on the right. Closes on `Esc`, outside click, or route change. Focus is trapped while open.
- **The "Explore" column solves an IA gap:** `/materials`, `/gallery` and `/process` are high-value pages that a 5-item nav cannot hold and that a footer link will not surface. They live here, in the panel's fourth column, with one-line descriptors.
- **Live rating chip.** Immediately left of the CTA sits a small chip: `★ 4.9` + review count, linking to `/reviews`. Rendered in `datum` type with a brass star.
  **Why this is in the header and not the footer:** 86% of homeowners read reviews before choosing a contractor (R-02), and a rating visible on *every* page — not just the homepage — is one of the cheapest persistent trust signals available. It also makes `/reviews` reachable in one click from anywhere, which a footer link does not achieve. Hidden below 1280px, where the CTA takes priority.
- Header colour is **context-aware**: on dark hero sections it renders inverted, transitioning at the intersection boundary via `IntersectionObserver`, not scroll position (robust to variable hero heights).

### Mobile (<1024)
- Height 64px. Wordmark left; a `Call` icon button and a hamburger right. **The phone icon is in the header on mobile** — a meaningful share of mobile visitors want to call immediately, and burying it costs leads.
- Menu opens a **full-screen drawer** from the right: items stagger in at 40ms intervals, `display-lg` type, generous 64px rows. Bottom of the drawer holds phone, WhatsApp, and the estimator CTA plus the office address.
- Body scroll locked; `inert` applied to the page behind; focus trapped; `Esc` closes.

## 3.6 Sticky CTA bar (mobile only)
Appears after 40% scroll on all pages except Contact. Height 64px, `z-sticky-cta`, `bg: basalt-900`, top hairline brass. Two actions split 50/50: **`WhatsApp`** and **`Get estimate`**. Hides while the mobile drawer or any modal is open. Respects `env(safe-area-inset-bottom)`.

**Why WhatsApp first:** for this audience and market, WhatsApp is the lowest-friction, highest-response channel, and the message is pre-filled with the page context — `"Hi, I'm looking at your Villa at Prabhat Road project."` This gives the sales team instant context and dramatically raises reply quality.

## 3.7 Contact Dock (desktop)
Bottom-right, 56px circular, `bg: #128C7E`, WhatsApp glyph. On hover it expands left to a 280px pill showing a **real team member's face, first name, and role**: *"Priya · Client Relations — usually replies in 20 min."* Named humans convert better than a generic bubble (R-07, R-01). Never auto-opens. Dismissible; dismissal persists 30 days.

## 3.8 Footer (mega)

Four zones, `bg: basalt-950`, `text: basalt-300`, generous `--space-32` vertical.

```
ZONE 1  ── Conversion band ────────────────────────────────────────────────
        display-lg: "Building in {{CITY}}? Let's talk about your site."
        [Book a site visit]   [WhatsApp us]        ← primary + whatsapp
ZONE 2  ── Link matrix (4 cols desktop / 2 tablet / accordion mobile) ─────
        SERVICES (9)   |  COMPANY (6)  |  RESOURCES (6)  |  CONTACT
        each service   |  About        |  Journal        |  Address block
        with a 1-line  |  Process      |  Cost guides    |  Phone (tel:)
        descriptor     |  Team         |  FAQ            |  WhatsApp
                       |  Careers      |  Materials      |  Email
                       |  Reviews      |  Downloads      |  Hours
                       |  Contact      |  Sitemap        |  Map link
ZONE 3  ── Trust band ─────────────────────────────────────────────────────
        GSTIN · Registration no. · Insurance · Google rating (live) ·
        Associations · Serving: {{CITY}} + 6 named localities
ZONE 4  ── Legal ──────────────────────────────────────────────────────────
        © {{FOUNDED_YEAR}}–2026 {{BRAND_NAME}} · Privacy · Terms · Admin
```

- Zone 3 is doing real work: GSTIN and registration numbers are the cheapest, highest-impact legitimacy signals available and are absent from most competitor footers (R-01).
- The locality list in Zone 3 is also our **local SEO surface** — each locality links to a location landing page (§10.5).
- `Admin` link in Zone 4 is a plain text link, `text-muted`, no styling emphasis. It is `noindex, nofollow`.

## 3.9 Service grouping (information architecture)

Nine services is too many for a nav. They collapse into three **intent** groups, because visitors arrive with an intent, not a service name:

| Group | Visitor's words | Services inside |
|---|---|---|
| **Build** | "I have a plot" | House Construction · Turnkey Home Solutions |
| **Transform** | "I have a house that needs work" | Home Renovation · Waterproofing · Painting · Electrical Work |
| **Finish** | "I want it to look beautiful" | Interior Design · Modular Kitchen · False Ceiling |

Each group has a hub page; each service has its own page. This preserves SEO (nine indexable service pages) while presenting three choices.

## 3.10 ProjectCard

```
┌────────────────────────────────┐
│                                │  16:10 image, object-cover
│         [image]          [♡]   │  ♡ = shortlist, top-right, appears on hover
│                                │     (always visible on touch)
├────────────────────────────────┤
│ 04 — RESIDENTIAL          ─┤   │  datum line, brass tick
│ Ridgeline House                │  heading-md
│ Baner · 3,850 sq ft · 2025     │  caption, text-muted, tabular nums
│ Construction + Interiors       │  label, brass-600
└────────────────────────────────┘
```

- **Metadata is the point.** Locality, area, year, and scope answer "is this like my project?" — the only question a portfolio visitor is actually asking. Competitor cards show a title and nothing else.
- Hover: image scales 1.03, a brass hairline draws left→right beneath the datum line, and the title shifts `2px` right. Entire card is one link; the shortlist heart is a nested button with `stopPropagation`.
- Sizes: `lg` (2-up feature), `md` (3-up grid), `sm` (4-up / related).
- Loading: a skeleton with the exact 16:10 ratio reserved — zero CLS.

## 3.11 ServiceCard

Two variants.

**`overview`** (used on hub pages, 3-up): custom craft icon 32px brass → `heading-md` title → 2-line plain-English description → price-from range in `numeral-md` → `From ₹1,850/sq ft` → `Explore →` link. Border hairline; hover fills `bg` with `basalt-100`.

**`deep`** (used on the services index, alternating full-width rows): asymmetric grid, left column heading + body + 3 bullet outcomes + CTA, right column a material macro or a technical drawing. Alternates side every row.

## 3.12 StatBand

A full-width band, `bg: basalt-900`, containing 3–4 stats separated by vertical hairlines.

```
────────────┬───────────────────────────────────────────────────
            │  61          │  11.4 mo      │  4.9 / 5    │  0
            │  homes       │  median       │  Google     │  disputes
            │  delivered   │  handover     │  61 reviews │  in 8 years
```

- Numerals in `numeral-xl` JetBrains Mono, brass-300; labels in `label`.
- Numbers **count up** once on first view (`IntersectionObserver`, 900ms, `--ease-out`), never repeat, disabled under `prefers-reduced-motion`.
- **Rule: every stat must be true and specific.** "0 disputes in 8 years" is powerful; "100+ happy customers" is noise. Where a number is unflattering, we publish it anyway with context — this is the transparency positioning made concrete and it is disproportionately persuasive (R-01).

## 3.13 TestimonialCard

```
┌─────────────────────────────────────────────────┐
│ "They sent photos of the waterproofing before   │  body-lg, Fraunces
│  they tiled over it. Nobody does that."         │  regular (not italic)
│                                                 │
│ ─────────────────────────────────────────────   │  hairline
│ [photo]  Anjali & Rohit Deshpande               │  heading-sm
│  40px    Ridgeline House, Baner · Mar 2025      │  caption
│          ★★★★★  Verified Google review ↗        │  brass, links out
└─────────────────────────────────────────────────┘
```

- **Provenance chip is mandatory** (R-02). A testimonial without a linked project or verifiable source renders in a visually demoted style (no photo, muted border) — this creates internal pressure to only collect verifiable ones.
- The quote is pulled to a **specific** claim, not a generic compliment. In content guidelines we instruct that testimonials be solicited with specific prompts ("what surprised you?") rather than "leave a review."
- Video testimonials use the same card with a 16:9 poster and a monogram-plate play button.

## 3.14 BeforeAfter (signature component)

Full specification, since this is a conversion moment (R-10).

**Anatomy**
- Container: aspect `4:3` mobile, `16:9` desktop, `radius-md`, `overflow: hidden`.
- Two images, identical dimensions, identical framing, identical crop. **Enforced at upload** — the admin uploader rejects a pair with mismatched aspect ratios and offers a crop tool (SRS FR-ADM-14).
- After image is the base layer; Before image is clipped via `clip-path: inset(0 X% 0 0)`.
- Handle: 2px vertical `basalt-000` line, full height, with a 44px circular grab control centred, `bg: basalt-000`, `1px ink-900` border, containing `⟷` in `ink-900`.
- Labels: `BEFORE` top-left, `AFTER` top-right, `label` type, `bg: rgba(11,11,9,0.6)`, `backdrop-blur(8px)`, 8px padding, 12px inset. **Always visible** — never on hover only.

**Behaviour**
- Handle starts at **50%**.
- **Idle hint:** on first entering the viewport, the handle animates 50% → 62% → 44% → 50% over 1400ms `--ease-inout`, once only. This is the single most important detail — without it a large share of users never discover the interaction (R-10).
- Drag: pointer events (mouse + touch unified). `touch-action: pan-y` so vertical page scroll still works on mobile — a very common bug in off-the-shelf sliders.
- Hover on desktop optionally tracks the cursor (opt-in per instance; off by default because it steals control).
- **Keyboard:** handle is `role="slider"`, `tabindex="0"`, `aria-valuenow`, `aria-label="Reveal before image"`. `←/→` move 2%, `Shift+←/→` 10%, `Home`/`End` jump to 0/100.
- **Reduced motion:** idle hint suppressed; a static 50/50 split with both labels.
- **Fallback / no-JS:** renders the two images stacked with captions.

**Performance**
- Both images `next/image`, `sizes` accurate, `quality={72}`, AVIF+WebP, lazy unless above the fold. Preload only the After image.
- The clip-path updates via a CSS custom property written in a `requestAnimationFrame` loop — never React state per pointer-move.

**Content rule:** every before/after pair carries a one-line caption naming *what changed and what it cost* — "Kitchen re-planned, 128 sq ft · ₹4.6 L · 5 weeks." A slider without cost context is entertainment; with it, it's a sales tool.

## 3.15 BehindTheWall (differentiator component)

A horizontally-scrolling strip of concealed-works photography with technical captions.

```
────────────┬────────────────────────────────────────────────────────
            │ 03 — WHAT YOU WON'T SEE AGAIN
            │
   [ img ]      [ img ]      [ img ]      [ img ]      [ img ]
   Bathroom     Conduit      Slab         Plumbing     Chajja
   membrane     routing      reinforcement pressure    waterproofing
   ─────────    ─────────    ─────────    test         ─────────
   2-coat       25mm FR PVC  Fe550 8mm    3 bar /      APP membrane
   polyurethane concealed    @150 c/c     24 hr        4mm
   ↑ dated + geotagged on each image
```

- Each image carries a **date stamp and geotag chip**, reinforcing that these are real site records, not stock.
- Captions in `datum` (JetBrains Mono) with real specifications.
- Scroll-snap on mobile; GSAP horizontal scroll on desktop (§7.3).
- Appears on: every project page, the Process page, and the Waterproofing/Electrical service pages.

## 3.16 CostRangeBar (used by the estimator)

A horizontal bar showing the estimate as a **range with a confidence band**, never a point value.

```
₹38.4 L                                                    ₹47.2 L
├──────────────░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░──────────────┤
               ▲ most likely ₹42.8 L
   ─── Structure ─── Finishes ─── MEP ─── Contingency (7%)
```
- The shaded band is the 60% confidence region; the whiskers extend to the full range.
- Below it, a segmented stacked bar breaks the number into Structure / Finishes / MEP / Contingency, each hoverable for its own sub-range.
- Numerals `numeral-xl` mono, colour `blueprint-500` (technical layer — signalling this is engineering output, not marketing).

## 3.17 MaterialSwatch

96×96 macro photograph of a real material, `radius-sm`, with a hover overlay revealing name, brand, grade, and which projects used it. Grid of these forms the Materials Library (§4.11). Cheap to produce (phone macro, north light) and a strong luxury signal.

## 3.18 ProcessStep

Numbered vertical timeline with a persistent brass rule. Each step: `datum` number → `heading-md` title → body → **duration chip** → **payment chip** → optional "what you receive" list. The duration and payment chips are the trust payload (§0.7).

## 3.19 FAQItem (Accordion)
Hairline-separated rows, no boxes. Trigger row: `heading-sm` left, a 20px `+`→`×` rotating icon right, 24px vertical padding, entire row clickable, min-height 64px. Content expands with a height transition `--dur-base`. **First item open by default** on FAQ pages (demonstrates the affordance), all closed when embedded in another page. Proper `<details>/<summary>` semantics so content is in the DOM for SEO and Ctrl+F, with JS enhancing the animation. Emits FAQPage structured data.

## 3.20 Skeletons, loading, empty & error states

### Loading philosophy
**No full-page spinners. No preloaders.** Loading is communicated by skeletons that match final layout exactly, so nothing shifts. A route transition shows a 2px brass progress bar at the top of the viewport (indeterminate, `--ease-linear`), nothing more.

| Surface | Loading treatment |
|---|---|
| Project grid | 6 skeleton cards, exact 16:10 ratio, shimmer `1600ms` |
| Project page | Hero image blurhash placeholder → full image cross-fade `--dur-slow` |
| Estimator result | The CostRangeBar renders its frame immediately; numerals count from 0; assumption list fades in |
| AI redesign | Dedicated queue experience (§5.3) — never a spinner |
| Admin table | 8 skeleton rows |
| Blog | Skeleton cards |

**Shimmer:** a 12% white gradient sweeping left→right over 1600ms. Disabled under `prefers-reduced-motion` (static grey block instead).

### Empty states
Every empty state has three parts: an illustration (a technical line drawing from our craft set), a plain sentence explaining *why* it's empty, and one action.

| Context | Message | Action |
|---|---|---|
| Portfolio filter, no match | "No projects match those filters yet. We've built 61 homes — try widening the area range." | `Clear filters` |
| Shortlist empty | "Nothing saved yet. Tap ♡ on any project to keep it here." | `Browse work` |
| Search, no result | "Nothing for '{query}'. Try 'kitchen', 'waterproofing', or 'cost'." | 3 suggested links |
| Admin leads, none | "No enquiries yet today. Your last lead came in 4 hours ago." | `View all leads` |
| Blog category empty | "We haven't written about this yet. Tell us what you'd like to know." | `Ask a question` |
| AI quota exhausted | "We've hit today's limit on design generations. Here's a curated moodboard instead — and we'll email your generation when it's ready tomorrow." | `Email it to me` |

### Error states
| Error | Treatment |
|---|---|
| Form validation | Inline, field-level, `danger-600`, plain language, focus moves to first error |
| Network failure on submit | Toast + the form **retains all values** + a `Retry` button + a WhatsApp fallback link. Never lose a user's typed brief. |
| 404 | Full editorial page: `display-xl` "This page was demolished." + 4 links (Work, Services, Estimator, Contact) + site search |
| 500 | Same layout, `"Something failed on our side."` + phone number in `display-lg`. When the site breaks, the phone number becomes the interface. |
| Image failure | Alt text on a `basalt-100` field with a hairline border and the monogram plate — never a broken-image glyph |
| AI provider down | Honest message + fallback moodboard + offer to email the result later |

## 3.21 Toast
Bottom-centre mobile / bottom-right desktop, `radius-md`, `--shadow-sheet`, 4px leading semantic bar, auto-dismiss 5s (never for errors), `aria-live="polite"` (`assertive` for errors), max 3 stacked.

## 3.22 Hover-state rules (system-wide)

| Element | Hover |
|---|---|
| Button | Background step + inset brass hairline wipe. No transform. |
| Card | `--shadow-lift`, border darkens, inner media `scale(1.03)` |
| Project card | Above + title translates `2px` right + brass rule draws in |
| Inline link | Underline wipes in from left |
| Nav item | Brass underline wipes in from left |
| Image in gallery | `scale(1.02)` + scrim lightens |
| Table row (admin) | `bg: basalt-100` |
| Material swatch | Overlay fades in from bottom, `--dur-fast` |
| Icon button | `bg: basalt-100` circle fades in |

**All hover styles are wrapped in `@media (hover: hover) and (pointer: fine)`.** Applying hover on touch causes sticky states — a common and very visible bug.

---
---

# PART 4 — PAGE SPECIFICATIONS

## 4.0 Sitemap

```
/                             Home
/work                         Portfolio index (filterable)
/work/[slug]                  Project detail
/services                     Services index (3 groups)
/services/build               Group hub
/services/transform           Group hub
/services/finish              Group hub
/services/house-construction
/services/turnkey-home-solutions
/services/home-renovation
/services/waterproofing
/services/painting
/services/electrical-work
/services/interior-design
/services/modular-kitchen
/services/false-ceiling
/process                      How we build
/materials                    Materials library
/about                        Company + team
/journal                      Blog index
/journal/[slug]               Article
/journal/category/[slug]      Category
/gallery                      Full image gallery
/reviews                      All testimonials + live Google feed
/faq                          FAQ hub
/estimate                     AI Cost Estimator
/design-studio                AI Design Assistant (room redesign)
/shortlist                    Saved projects
/contact                      Contact + booking
/locations/[locality]         Local SEO landing pages
/downloads/[slug]             Gated resources (sample BOQ, checklists)
/legal/privacy · /legal/terms
/admin/*                      Admin panel (noindex)
```

---

## 4.1 HOME — `/`

**Objective:** In 5 seconds, establish that this is a serious, transparent builder. In 60 seconds, prove it. Route every segment to their next step.
**Primary KPI:** estimator starts + WhatsApp taps. **Secondary:** scroll depth to §S07, project card clicks.
**Length:** long scroll (10 sections). Long homepages perform well in this category (R-09) *because* the visitor is researching, not buying.

### S01 · Hero — "The claim"
```
┌──────────────────────────────────────────────────────────────────────────┐
│  [header, inverted]                                                       │
│                                                                           │
│   ────────────┬────────────────────────────────                           │
│               │ {{CITY}} · SINCE {{FOUNDED_YEAR}}         (datum, brass)  │
│                                                                           │
│   We show you what's                                    display-xxl       │
│   behind the wall.                                      Fraunces 300      │
│                                                         cols 1–7          │
│                                                                           │
│                      Turnkey construction and interiors.  body-lg         │
│                      Published prices. Published process. cols 8–12       │
│                      Photographed before we close it up.                  │
│                                                                           │
│                      [Get a cost estimate]  [See our work →]              │
│                                                                           │
│                                                                           │
│   ──────────────────────────────────────────────────────────────────────  │
│   61 homes · 11.4 mo median handover · 4.9★ (61) · 0 disputes  (StatBand) │
└──────────────────────────────────────────────────────────────────────────┘
   Background: full-bleed video (muted, 8s loop) or single hero still,
   with a bottom-weighted scrim gradient. bg: basalt-950.
```

**Decisions & rationale**
- **Typographic hero, not photographic** (R-08 + §0.3). The headline carries the meaning; media is atmosphere. This also means the hero works on day one with mediocre footage.
- **The headline is the positioning, verbatim.** "We show you what's behind the wall" is concrete, memorable, falsifiable, and impossible for a competitor to copy without changing how they operate. It beats "Building dreams since 2018" on every axis.
- **Hero media:** priority order — (1) a slow 8-second locked-off shot of a real craftsman's hands working, (2) a slow push-in on a finished detail, (3) a single high-quality still. Never a slideshow, never fast cuts. Under 1.2MB, `poster` served as AVIF, `preload="none"` with the poster preloaded so **LCP is the poster image, not the video**.
- **Two CTAs, deliberately unequal.** `Get a cost estimate` is `accent`; `See our work` is `link` with an arrow. The estimator is rung 3 of the commitment ladder and is the highest-value first action.
- **StatBand inside the hero fold on desktop**, immediately below on mobile. Putting verifiable numbers within the first screen directly attacks R-01.
- **Mobile:** hero is `100svh` (not `vh` — avoids the iOS toolbar jump), headline drops to `display-xl`, video is replaced by the still below 768px to protect data and LCP.
- **Scroll cue:** a 24px brass vertical rule that draws downward on a 2s loop, with `datum` label `SCROLL`. Suppressed under reduced motion.

### S02 · The problem, named
An editorial full-width band, `bg: basalt-050`, single centred column at `container-narrow`.

> `display-lg`: **Most people building a home are quietly terrified.**
> `body-lg`: Not of the cost. Of not knowing. Of a number that moves. Of work sealed behind plaster before anyone checked it. Of a builder who stops answering.
> Then a hairline, then: `heading-md`: **So we built the company around removing the not-knowing.**

**Why this section exists and why it's second:** naming the visitor's fear before selling anything is the highest-trust opening move available (R-01). It signals we understand them. Almost no competitor does this; they all open with "Our Services." Risk: sounds negative. Mitigation: it resolves within the same viewport into our answer.

### S03 · The three proofs
3-up grid at `container-base`, each a `bordered` Card with a custom craft icon.

| Proof | Content | Links to |
|---|---|---|
| **A published price** | "Our rate card is on this site. Run the estimator and see the same ranges we quote from." | `/estimate` |
| **A published process** | "38 steps, 9 payment milestones, one page. Read it before you call us." | `/process` |
| **A published record** | "We photograph waterproofing, conduit and steel before we close it. Every project." | `/work` |

Each proof is a *checkable claim*. The section converts abstract trust into three verifiable artefacts — this is the entire brand strategy compressed into one viewport.

### S04 · Selected work
```
────────────┬──────────────────────────────────────────  01 — SELECTED WORK
            │ Six of sixty-one.                          heading-xl
            │                          [All 61 projects →]
┌───────────────────────────┐  ┌───────────────────────────┐
│  ProjectCard lg           │  │  ProjectCard lg           │
└───────────────────────────┘  └───────────────────────────┘
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Card md    │ │ Card md    │ │ Card md    │ │ Card md    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```
- Two feature cards then four standard — an asymmetric rhythm that reads editorial rather than catalogue.
- Deliberately labelled "Six of sixty-one" — quantity as a credibility signal without a boastful adjective.
- Cards stagger in on scroll: 60ms interval, `y: 24px → 0`, `opacity 0 → 1`, `--dur-slow --ease-out`, once only.
- Mobile: horizontal scroll-snap carousel with a progress rule, showing 1.15 cards so the cut edge signals more content.

### S05 · Before / after
Single full-width `BeforeAfter` at `container-wide`, dark surface so the images glow (R-09), with three thumbnail pairs beneath to switch the active comparison. Caption carries scope, cost and duration (§3.14).

### S06 · Services, as intents
Three columns matching §3.9 (Build / Transform / Finish). Each column: an oversized `display-lg` numeral in `basalt-200` behind the content, the group name, a plain-language question ("I have a plot", "I have a house that needs work", "I want it to look beautiful"), the services listed as links, and `From ₹x/sq ft`.

**Decision:** grouping by intent rather than listing nine services is the single biggest IA improvement over competitors. A first-time builder does not know whether they need "turnkey" or "construction" — but they know they have a plot.

### S07 · The estimator invitation
Full-width `bg: blueprint-700` (the technical layer signals a tool, not a pitch). A **live mini-estimator** embedded directly in the homepage: three controls only — project type, area, city — and a `Get the range →` button that carries state into `/estimate`.

**Why inline rather than a link:** starting the interaction in place raises completion dramatically compared to a link to a tool page. Three fields is low enough friction to be an impulse action. This is the primary conversion mechanism of the homepage.

### S08 · Process, compressed
A horizontal 5-step strip (Consult → Design → Estimate → Build → Handover) with durations, on `bg: basalt-050`. Desktop: GSAP horizontal pin-scroll (§7.3). Mobile: vertical timeline. CTA: `Read the full 38-step process →`.

### S09 · Testimonials + live Google rating
Two-up `TestimonialCard`s (one text, one video) beside a **live Google Business Profile rating block** showing the aggregate score, review count, and the three most recent reviews with dates (R-02). Cached server-side for 6 hours.

### S10 · Journal teaser + closing CTA band
Three `ArticleCard`s (most-read cost guides perform best here), then the closing CTA band on `bg: basalt-900`:

> `display-lg` "Tell us about your site."
> body: "Send us the plot dimensions or a photo of the room. We'll come back with a plan and a range — no obligation, no sales call."
> `[Book a site visit]` `[WhatsApp us]`

**Why "Tell us about your site" and not "Contact us":** it names an action the visitor can actually do and lowers perceived commitment (R-04).

---

## 4.2 ABOUT — `/about`

**Objective:** convert "a company" into "these specific people."

| Section | Layout | Notes |
|---|---|---|
| Hero | Asymmetric: `display-xl` statement left cols 1–6; a wide team photograph bleeding right cols 6–12 | Real team photo on a real site, not a studio shot (R-07) |
| Origin | `container-prose`, editorial, first-person from the founder, with the founder's signature as an SVG | First-person is disarming; corporate third-person is the category default and reads evasive |
| The standard we hold | 5 numbered commitments, each with a hairline and a measurable definition ("we respond to every message within one working day — here's our median: 3h 20m") | Commitments with metrics are credible; without them they're wallpaper |
| Team | Grid of `TeamCard`s: photo, name, role, years with the company, one specific line ("Anil has poured every slab we've laid since 2019") | Tenure attacks the "they'll vanish" fear directly (§0.7) |
| Credentials | GSTIN, registration, insurance, associations, certifications — as a scannable table, with document thumbnails openable in a lightbox | Showing the actual documents is rare and disproportionately convincing |
| Numbers | Full `StatBand` including an honest one ("2 projects ran over 60 days. Here's why.") linking to a written explanation | Publishing a failure is the strongest trust signal on the entire site. High risk, high return — recommended. |
| Workshop / site | Photo strip of the actual office, storage yard, vehicles | R-07 |
| CTA band | Standard | |

---

## 4.3 PORTFOLIO INDEX — `/work`

**Objective:** let a visitor find a project like theirs in under 20 seconds.

```
────────────┬──────────────────────────────────  02 — WORK
            │ Sixty-one homes, offices and                heading-xl
            │ renovations across {{CITY}}.
            
[ All ] [ New construction ] [ Renovation ] [ Interiors ] [ Commercial ]   ← type chips
Locality ▾   Area ▾   Budget ▾   Year ▾   Style ▾            [ 61 results ]  ← filter row
────────────────────────────────────────────────────────────────────────────
┌──────────┐ ┌──────────┐ ┌──────────┐
│ card     │ │ card     │ │ card     │       3-up desktop · 2-up tablet
└──────────┘ └──────────┘ └──────────┘       1-up mobile
                    ...
                [ Load more ]   ← button, not infinite scroll
```

**Decisions**
- **Filters are URL state** (`/work?type=renovation&locality=baner`) so results are shareable, back-button-safe, and indexable. Filtered combinations with ≥6 results get `<link rel=canonical>` to themselves and are allowed in the sitemap; thin combinations canonicalise to `/work`.
- **Budget filter uses bands, not sliders** (`Under ₹25L`, `₹25–50L`, `₹50L–1Cr`, `₹1Cr+`) — publishing project budgets is unusual and directly serves the "am I overpaying?" hesitation.
- **`Load more` button, not infinite scroll.** Infinite scroll breaks the footer (which carries our trust band and local SEO links) and destroys the back button. Non-negotiable.
- Mobile filters open in a bottom `Sheet` with an apply button showing the live result count.
- Grid animates on filter change with FLIP (GSAP Flip), `--dur-base` — this is one of the few places elaborate motion earns its cost because it maintains object permanence.
- **Empty state** per §3.20.

---

## 4.4 PROJECT DETAIL — `/work/[slug]`

The most important page on the site for a researching visitor. Structured as an editorial case study.

| # | Section | Layout & content |
|---|---|---|
| 1 | **Hero** | Full-bleed image, `70svh`. Overlaid at bottom-left: `datum` "04 — RESIDENTIAL", `display-xl` project name, `caption` locality · area · year. Scrim gradient bottom. |
| 2 | **Fact table** | Immediately below the fold — a `blueprint` technical panel with: Type, Built-up area, Plot area, Floors, Duration (planned vs actual), Scope, Budget band, Structural system, Completion date. **Planned vs actual duration side by side is the trust payload.** Monospace throughout. |
| 3 | **The brief** | Asymmetric grid. Left: `heading-xl` the client's problem in their words. Right: our approach, 3 paragraphs. `container-base`. |
| 4 | **Drawings** | Floor plan + section rendered as brass line art on `basalt-900`, with dimension callouts. Interactive: hover a room to see its area. **This is the differentiator layer (§0.3) and costs nothing — the CAD already exists.** |
| 5 | **Before / after** | 2–4 `BeforeAfter` pairs with cost+duration captions |
| 6 | **Behind the wall** | `BehindTheWall` strip (§3.15) — concealed works with specs and dates |
| 7 | **Gallery** | Masonry, 8–20 images, opens a lightbox. Mixed scales: wide establishing shots alongside macro details. **Rule: at least 40% of images must be detail crops** — this makes a small, imperfect library look intentional and abundant. |
| 8 | **Materials used** | Grid of `MaterialSwatch`es with brands and grades, linking to `/materials` |
| 9 | **Timeline** | Horizontal milestone strip with actual dates and 5 progress photos |
| 10 | **Client testimonial** | Full-width, `bg: basalt-900`, single quote, `display-lg`, attributed with photo and Google link |
| 11 | **Cost context** | "This project cost ₹X per sq ft in {{year}}. Run the estimator for today's range on a similar build." → inline estimator prefilled with this project's type and area. **Highest-converting module on the page** — the visitor is already imagining themselves in this project. |
| 12 | **Next / related** | 3 related projects matched by type + area band |
| 13 | **CTA band** | Prefilled: "Building something like Ridgeline House?" |

**Sticky rail (desktop ≥1280):** a right-hand 240px rail with a mini fact summary, `♡ Shortlist`, `Share`, `⤓ Download spec sheet (PDF)`, and `Ask about this project` (opens WhatsApp prefilled with the project name). The spec-sheet download is a rung-4 commitment capture.

---

## 4.5 SERVICES INDEX — `/services` and group hubs

**Index:** hero statement, then three group blocks (Build / Transform / Finish) as alternating full-width `ServiceCard deep` rows. Then a comparison table of all nine services (scope, typical duration, typical range, whether we do it standalone or only within a turnkey contract — **admitting what we don't do standalone is a trust signal**). Then FAQ, then CTA.

**Group hub** (e.g. `/services/transform`): group statement, the 3–4 services in that group as `overview` cards, a relevant project trio, group-specific FAQ, CTA.

---

## 4.6 SERVICE DETAIL — `/services/[service]` (template)

A single template, populated per service. Nine instances.

| # | Section | Content spec |
|---|---|---|
| 1 | Hero | Asymmetric. `display-xl` outcome-framed title ("A kitchen that survives twenty monsoons" — not "Modular Kitchen"). Sub: plain definition of the service. Right: material macro or craft drawing. Two CTAs. |
| 2 | Is this you? | 3 short scenarios in the visitor's words. Self-identification beats feature lists for relevance. |
| 3 | What's included / not included | **Two adjacent columns of equal visual weight.** The "not included" column is the differentiator (R-11) — every competitor hides it and every client discovers it later, angrily. |
| 4 | Price | Three tiers — **Essential / Signature / Bespoke** — as three columns. Each: range per sq ft, a one-line "who it's for", 5 defining specifications (actual brands and grades, not adjectives), and typical total for a 1,500 sq ft example. Signature is visually marked as recommended. |
| 5 | **What you avoid** | Loss-framed panel (R-06): "What a ₹200/sq ft cheaper quote usually costs later" — 4 items with real consequences and rupee figures. This is the page's persuasion engine and should sit directly after price. |
| 6 | Process | 5–7 steps specific to this service, with durations and payment points |
| 7 | Work | 3–6 filtered projects |
| 8 | Materials | Swatches specific to this service |
| 9 | Before/after | 1–2 pairs |
| 10 | Testimonials | 2, filtered to this service |
| 11 | FAQ | 8–12 service-specific questions, emits `FAQPage` schema |
| 12 | Estimator | Inline, prefilled with this service type |
| 13 | CTA band | Service-specific |

**Per-service headline direction (outcome, never category):**

| Service | Headline direction |
|---|---|
| House Construction | "Built once. Built right. Documented throughout." |
| Turnkey Home Solutions | "One contract. One number. One person accountable." |
| Home Renovation | "Your house, improved — and you can still live in it." |
| Waterproofing | "The work you'll never see, and never think about again." |
| Painting | "Twelve coats of preparation. Two of paint." |
| Electrical Work | "Every circuit mapped, labelled and handed to you." |
| Interior Design | "Rooms that look like the people who live in them." |
| Modular Kitchen | "A kitchen that survives twenty monsoons." |
| False Ceiling | "Level, silent, and serviceable in ten years." |

---

## 4.7 PROCESS — `/process`

**Objective:** eliminate the first-time builder's core fear (§0.6). Likely the second-highest-dwell page on the site.

- **Hero:** `display-xl` "Thirty-eight steps. Nine payments. No surprises." + a `⤓ Download the full process as PDF` (rung-4 capture).
- **Phase navigator:** sticky left rail (desktop) / sticky top chips (mobile) with 5 phases; scroll-spy highlights the current phase.
- **Phase sections:** each phase is a `ProcessStep` timeline. Every step carries: number, title, what happens, **who does it (named role)**, duration, **what you receive** (drawing, report, photo set), and whether a payment falls here.
- **Payment milestone map:** a full-width horizontal bar showing all 9 payments as proportional segments against the project timeline, with percentages and triggers. Interactive: hover a segment for the release condition. **This single module addresses the #1 financial fear and virtually no competitor publishes it.**
- **Change orders:** a plain-language explanation of how scope changes are priced and approved, with a sample change-order form download.
- **What can go wrong:** an honest section listing the 4 most common causes of delay (municipal approvals, monsoon, client-side material selection delays, design changes mid-build) and exactly how each is handled contractually. **Recommended despite the apparent risk** — pre-empting objections is more persuasive than avoiding them, and it filters out clients who would have become disputes.
- **Documents you receive:** a checklist of the 12 documents handed over at completion.
- CTA band.

---

## 4.8 CONTACT — `/contact`

Two-column at `≥1024`; stacked below.

**Left — the form (progressive, 4 steps):**

| Step | Fields | Note |
|---|---|---|
| 1 | What are you planning? (5 large radio cards) | Visual, one tap |
| 2 | Where? (locality) · Area (sq ft) · Timeline (4 chips) | Prefill locality from IP, editable |
| 3 | Budget band (5 chips incl. "not sure yet") | "Not sure yet" is mandatory — forcing a budget guess causes abandonment |
| 4 | Name · Phone (+ WhatsApp toggle, on by default) · Email (optional) · Anything else (textarea) | **Contact details last** (§0.5) |

- A 4-segment progress rule sits above the form. Back navigation preserves state. State persists in `sessionStorage` against accidental refresh.
- **Success state is a page, not a toast:** confirms what was received, states who will call and by when, gives the direct WhatsApp link, and offers `Run the estimator while you wait →`. Keeping a converted lead engaged raises show-up rates.
- Under the form: "We reply to every enquiry within one working day. Median response so far: 3h 20m."

**Right — the alternatives:**
- Phone in `display-lg`, tappable.
- WhatsApp button with the team member's face and name.
- Office address + hours + an **embedded map loaded only on click** (a static map image placeholder until interaction — an unclicked Google Maps iframe is often the single heaviest asset on a contact page).
- "Prefer we come to you? Book a free site visit" → calendar slot picker.

---

## 4.9 JOURNAL — `/journal`, `/journal/[slug]`

**Index:** featured article (asymmetric, large), then a 3-up grid. Category chips: Cost & budgeting · Materials · Process · Design ideas · Case notes · Regulations. Newsletter capture is a single inline field, not a modal.

**Article page:**
- `container-prose` (720px), `body-lg`, `1.7` leading.
- Header: category `label`, `display-lg` title, author with photo, date, read time, and — distinctively — **"Reviewed by [name], Site Engineer"** on technical articles. Author expertise is both an E-E-A-T signal and a genuine trust signal.
- Reading progress: a 2px brass rule at the top of the viewport.
- Sticky share rail on desktop (WhatsApp first — it dominates sharing in this market).
- Rich content blocks available to the editor: pull-quote, cost table, spec callout, image with caption, before/after embed, checklist, warning callout, embedded estimator, project card embed.
- Related articles, then a **contextual CTA** matched to the article's category (a cost article ends at the estimator; a materials article ends at the materials library).
- Emits `Article` + `BreadcrumbList` schema.

---

## 4.10 GALLERY — `/gallery`

Masonry across all projects, filterable by room type (kitchen, bath, living, facade, staircase, detail) — **room-type filtering, not project filtering**, because a gallery visitor is looking for ideas, not case studies. Lightbox with keyboard nav, project attribution on every image, and a `See the full project →` link. Every image is shortlistable.

---

## 4.11 MATERIALS — `/materials`

A browsable catalogue of every material we actually use: grid of `MaterialSwatch`es, filterable by category (flooring, joinery, hardware, paint, sanitary, electrical, waterproofing) and tier (Essential/Signature/Bespoke). Each opens a detail sheet: macro photo, brand, grade, why we chose it, what it costs per unit, where it's been used, and the cheaper alternative we'd use in the Essential tier and why.

**Why this page exists:** it is unusually cheap to produce, ranks well for long-tail material queries, gives the sales team a linkable reference, and — most importantly — proves specification literacy. Nothing says "we know what we're doing" like publishing our actual bill of materials.

---

## 4.12 REVIEWS — `/reviews`
All testimonials, filterable by service and locality, alongside the live Google feed, aggregate rating, and a distribution bar (5★ through 1★ — showing the 1★s if any exist, with our written response). Emits `AggregateRating` schema. **Showing negative reviews with responses raises trust, not lowers it** (R-01/R-02).

---

## 4.13 SHORTLIST — `/shortlist`
Saved projects and gallery images, stored in `localStorage` (no account required — rung 2). Actions: `Share this shortlist` (generates a short URL, capturing intent data), `Email it to me` (rung 4), and `Discuss these with us` (rung 5, prefilling the enquiry with the saved items so the sales conversation starts with taste already established).

---

## 4.14 COMMERCIAL TRACK — `/services/commercial` (recommended addition)

**Identified as missing from the brief.** Commercial and office-renovation clients are named as target audiences but have no dedicated surface, and their decision criteria are entirely different (downtime cost, phasing, compliance, documentation, invoicing). Squeezing them into residential pages loses them.

Distinct page with: SLA table, phasing/after-hours capability, compliance and documentation list, a downloadable capability statement, GST invoicing note, and a different CTA (`Request a capability deck` rather than `Book a site visit`). Tone shifts from warm to precise.

---

## 4.15 LOCATION PAGES — `/locations/[locality]`

Six to twelve pages, one per served locality. Each: locality-specific hero, projects filtered to that locality, locality-specific considerations (soil type, society rules, common building typologies, municipal ward specifics), local testimonials, and a map. Emits `LocalBusiness` schema with `areaServed`.

**Warning against the obvious mistake:** these must contain genuinely locality-specific content. Templated pages with the name swapped are treated as doorway pages and will be penalised. Ship only the localities where we have real projects and real knowledge — six good pages beat thirty thin ones.

---

## 4.16 USER JOURNEYS

### J-01 · First-time home builder (primary, cold)
```
Google "house construction cost per sq ft {{CITY}}"
  → /journal/house-construction-cost-guide   [reads 4 min]
  → inline estimator in article               [rung 3 — enters area + locality]
  → sees range + exclusions panel             [trust event: we told them what's NOT included]
  → "how do I know you won't overrun?"        → /process
  → payment milestone map                     [trust event]
  → /work filtered to their budget band
  → shortlists 2 projects                     [rung 2]
  → returns 6 days later (direct)             [R-03: silent evaluation]
  → /shortlist → "Discuss these with us"      [rung 5]
  → LEAD, arriving with type, area, locality, budget band, and 2 reference projects
```
**Design requirements this journey generates:** estimator embeddable in articles; exclusions panel prominent; process page linked from estimator results; shortlist persisting across sessions; enquiry form prefilled from shortlist.

### J-02 · Returning silent researcher
On a second visit, if a shortlist or a prior estimate exists, the homepage hero swaps its second CTA to **`Pick up where you left off →`**, and a dismissible bar offers to email the saved estimate. **No login. No aggressive personalisation.** The recognition must feel like a good shopkeeper's memory, not surveillance — hence: subtle, dismissible, permanently dismissible, and never mentioning anything the user didn't do on this device.

### J-03 · Comparison shopper (has 3 quotes)
Enters via `/services/[x]`, scans price tiers, needs to justify our number. Path: price tiers → **What you avoid** panel (R-06) → materials library (specification comparison) → behind-the-wall → reviews.
**Requirement:** a `⤓ Download comparison sheet` — a PDF listing our specification line by line so they can hold it against competing quotes. This is a high-intent capture and an extremely strong sales asset. **Recommended addition.**

### J-04 · Browser with no immediate intent
Enters via Instagram or Pinterest to `/gallery`. Shortlists images. Exits. Return path is the newsletter or a shared shortlist link. **Design requirement:** every gallery image must be independently shareable with an OG image carrying the project name and our wordmark.

### J-05 · Commercial client
Enters via search or referral, wants competence not warmth. Path: `/services/commercial` → capability deck download → contact with GST details. **Requirement:** separate lead type in admin with different routing and a different response SLA.

### J-06 · Renovation client, disruption-anxious
`/services/home-renovation` → Occupancy Timeline module ("weeks 1–3: kitchen unusable; weeks 4–6: one bathroom available") → before/after → estimator. **Requirement:** the Occupancy Timeline module — a renovation-specific component showing which parts of the home are usable in which weeks. Nobody publishes this. It directly answers the segment's decisive question.

### J-07 · AI Design Assistant explorer
`/design-studio` → uploads a room photo → picks a style → waits in queue → receives 3 variants → downloads → **"Get this costed"** → estimator prefilled with the room type and style tier → enquiry with the generated image attached to the lead.
**Requirement:** the generated image must flow through to the CRM record. A lead that arrives with a picture of what they want is worth several times a blank enquiry.

---

## 4.17 MOBILE LAYOUTS (390px) — the primary experience

Part 4's wireframes above are drawn at desktop because that is where the grid logic is clearest. **That is a documentation convenience, not a priority signal.** Roughly two-thirds of visitors arrive on a mid-range Android. These are the layouts that actually matter, specified at 390px.

**Universal mobile rules**
- Single column. Always. No exceptions on the public site.
- Horizontal page padding `20px`. Section vertical padding `64px` standard / `80px` feature.
- One idea per screen height. If a section needs two screens to make its point, it is two sections.
- Carousels use native `scroll-snap` with **1.15 cards visible** — the cut edge is what tells the user there is more. Never a JS carousel, never dots-only.
- Sticky CTA bar occupies the bottom `64px` after 40% scroll. **Every mobile layout must reserve that space** — `padding-bottom: calc(64px + env(safe-area-inset-bottom))` on the page wrapper. Content hidden behind the CTA bar is the most common mobile bug in this pattern.
- Tap targets ≥44px, ≥8px apart.

### Home — mobile
```
┌────────────────────────┐ 0
│ ZYVORA        ☎  ☰    │ 64px header
├────────────────────────┤
│                        │
│  {{CITY}} · SINCE 20XX │ datum, brass
│                        │
│  We show you           │ display-xl (40px)
│  what's behind         │ 3 lines max
│  the wall.             │
│                        │
│  Turnkey construction  │ body-md, 2 lines
│  and interiors.        │
│                        │
│  [ Get a cost estimate ]│ accent, full-width, 54px
│  See our work →        │ link
│                        │
│  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  │
├────────────────────────┤ 100svh
│ 61      11.4mo         │ StatBand: 2×2 grid,
│ homes   handover       │ NOT 4 across.
│ 4.9★    0              │ numeral-xl → 40px
│ 61 rev  disputes       │
├────────────────────────┤
│ S02 problem  (centred) │
│ S03 proofs   (stacked) │ 3 cards, full-width
│ S04 work     (carousel)│ 1.15 cards, snap
│ S05 before/after (4:3) │
│ S06 services (3 stacked)│ accordion-style
│ S07 estimator (3 fields)│ full-bleed blueprint
│ S08 process  (vertical)│ NOT horizontal scroll
│ S09 reviews  (carousel)│
│ S10 journal + CTA      │
├────────────────────────┤
│ Footer (accordions)    │
├────────────────────────┤
│ [WhatsApp] [Estimate]  │ 64px sticky, split 50/50
└────────────────────────┘
```
**Key mobile decisions:** hero uses `100svh` not `100vh` (avoids the iOS toolbar jump). Video is replaced by the still below 768px. StatBand is 2×2, because 4-across at 390px makes the numerals too small to carry authority. S08 becomes a vertical timeline — pinned horizontal scroll on touch is a usability failure.

### Project detail — mobile
```
┌────────────────────────┐
│ [hero image, 70svh]    │ scrim bottom
│                        │
│  04 — RESIDENTIAL      │ datum
│  Ridgeline House       │ display-lg (32px)
│  Baner · 3,850 · 2025  │ caption
├────────────────────────┤
│ FACTS                  │ blueprint panel
│ Built-up      3,850 sqft│ 2-col label/value
│ Duration      11 / 11.4 │ planned / actual
│ Budget        ₹50L–1Cr  │ mono, right-aligned
│ ...                     │
├────────────────────────┤
│ The brief (stacked)     │
│ Drawings (pinch-zoom)   │ full-bleed, tap to expand
│ Before/After (4:3)      │ ← the moment. Give it room.
│ Behind the wall (snap)  │ 1.15 cards
│ Gallery (2-col masonry) │ tap → lightbox
│ Materials (3-col swatch)│
│ Timeline (vertical)     │
│ Testimonial (full-width)│ dark surface
│ Cost context + estimator│
│ Related (carousel)      │
├────────────────────────┤
│ ♡ Save   ↗ Share  ⤓ PDF│ inline row, NOT a rail
└────────────────────────┘
```
**Note:** the desktop sticky rail has no mobile equivalent. Its actions become an inline row after the gallery, plus `♡` on the hero.

### Estimator — mobile (the highest-stakes mobile flow)
```
┌────────────────────────┐
│ ← Step 2 of 5          │ back + progress
│ ▓▓▓▓░░░░░░░░░░░░░░░░   │ 5-segment rule
├────────────────────────┤
│                        │
│ Where are you          │ heading-xl
│ building?              │
│                        │
│ [ Locality        ▾ ]  │ 52px input
│ [ City            ▾ ]  │
│                        │
│         (breathing room)│
│                        │
├────────────────────────┤
│ [ Continue → ]         │ fixed bottom, full-width
└────────────────────────┘
```
**One question per screen.** The CTA is fixed to the bottom, not at the end of the scroll — on a 5-step form, making the user scroll to continue is where abandonment happens. Inputs at ≥16px font-size to prevent iOS zoom-on-focus.

**Result screen, mobile:** the range and CostRangeBar first, full-width. Then inclusions/exclusions as **two stacked accordions, exclusions open by default** — this preserves the "equal weight" principle in a single column, and defaulting exclusions open is the honest choice. Then breakdown, then narration, then assumptions, then the two CTAs.

### Contact — mobile
Steps 1–4 stacked, one per screen, same fixed-bottom CTA as the estimator. Step 1's five project-type options are **large full-width cards with icons**, ~72px tall — not a dropdown. The phone number and WhatsApp button sit **above** the form, not below: a meaningful share of mobile visitors want to call, and making them scroll past a form to find the number costs leads.

### Portfolio index — mobile
Type chips scroll horizontally in a single row. All other filters collapse into one `Filters (2)` button opening a bottom `Sheet` with an apply button showing the live result count. Cards 1-up, full-width, 16:10.

---
---

# PART 5 — AI FEATURE EXPERIENCE DESIGN

## 5.1 AI principles for this product

1. **AI must produce something checkable.** A number with assumptions, or an image the user can see. Never a chat that gives vague advice — that reads as a gimmick and damages an engineering brand.
2. **Never gate the output.** Show the result, then offer to send it. Gating converts a trust moment into a bait-and-switch (§0.5).
3. **Show the working.** Every AI output displays its inputs and assumptions. This turns AI from a magic box into an engineering instrument, which is on-brand.
4. **Degrade honestly.** When a provider quota is exhausted (R-12), say so plainly and offer a real alternative. Never a generic error.
5. **AI output is never presented as a quote or a design deliverable.** Clear, non-scary disclaimers, positioned as a starting point for a conversation.
6. **No AI branding.** We do not say "Powered by Gemini." The visitor cares that it works, not what's underneath — and naming the provider invites "I could just use that myself."

---

## 5.2 AI COST ESTIMATOR — `/estimate`

**Objective:** deliver genuine value before asking for anything, and use radical honesty about exclusions as the trust weapon (R-11).

### Why "AI" here is real and not decoration
The estimate is produced by a **deterministic rate engine** (auditable, fast, free) whose output is then **narrated by an LLM** into a plain-language explanation tailored to the user's inputs. This split matters enormously:
- The **numbers** must be deterministic — an LLM hallucinating a price is a legal and commercial disaster.
- The **explanation** benefits from language generation: why this range, what drives it up or down, what to decide next.

**Recommended strongly over a pure-LLM estimator.** A pure-LLM estimator is non-reproducible, unauditable, and will eventually quote a number the business cannot honour.

### Flow (5 steps, one screen each on mobile, progressive on desktop)

| Step | Question | Control | Design notes |
|---|---|---|---|
| 1 | What are you building? | 5 large image radio cards | New house · Renovation · Interiors only · Single service · Commercial |
| 2 | Where? | Locality autocomplete + city | Drives the regional multiplier (R-11) |
| 3 | How big? | Number input + slider, sq ft; plus floors stepper | Paired input+slider (§3.3). Live conversion to sq m shown as a caption. |
| 4 | What standard? | 3 tier cards: Essential / Signature / Bespoke | Each card lists 4 defining specifications with real brands — not "premium quality" |
| 5 | Anything specific? | Optional chips: basement, lift, solar, home automation, landscaping, compound wall, borewell | Each visibly adds to the range in real time — this is a small delight moment and builds confidence in the model |

Progress: a 5-segment rule with step labels. Back preserves state. State is in the URL so a partially completed estimate is shareable and resumable.

### The result screen — the most important screen on the site

```
────────────┬───────────────────────────────────────────────────
            │ ESTIMATE · 2,400 SQ FT · SIGNATURE · BANER
            
            Your range                                  label
            ₹50.5 L  —  ₹62.2 L                        numeral-xl, blueprint
            ├────────░░░░░░░░░░░░░░░░░░░░░────────┤    CostRangeBar
                     ▲ most likely ₹56.4 L
            
            ₹2,348 per sq ft                            numeral-md
            Confidence: Medium — based on 14 similar    caption
            projects we've built in Baner since 2023.
            
┌─────────────────────────────┬─────────────────────────────────┐
│ WHAT THIS INCLUDES          │ WHAT THIS DOES NOT INCLUDE      │
│ ✓ Excavation & foundation   │ ✗ Furniture & loose furnishing  │
│ ✓ RCC structure (Fe550)     │ ✗ Landscaping & compound wall   │
│ ✓ Brickwork & plaster       │ ✗ Municipal approvals & fees    │
│ ✓ Waterproofing (all wet)   │ ✗ Borewell / water connection   │
│ ✓ Electrical & plumbing     │ ✗ Solar & home automation       │
│ ✓ Flooring & tiling         │ ✗ Escalation beyond 18 months   │
│ ✓ Doors, windows, painting  │ ✗ Soil treatment if rock found  │
└─────────────────────────────┴─────────────────────────────────┘
        ↑ EQUAL VISUAL WEIGHT. This is the trust play.

  ── The breakdown ────────────────────────────────────────────
  Structure          ₹18.7 L – 23.0 L    37%   ████████
  Finishes           ₹16.7 L – 20.5 L    33%   ███████
  MEP                ₹ 7.6 L –  9.3 L    15%   ███
  Design & PM        ₹ 4.0 L –  5.0 L     8%   ██
  Contingency        ₹ 3.5 L –  4.4 L     7%   ██
                     ─────────────────────────
                     ₹50.5 L – 62.2 L   100%

  ── What moves this number ───────────────────────────────────
  [LLM-generated, 3 short paragraphs, specific to these inputs]

  ── Our assumptions ──────────────────────────────────────────
  Rates as of Aug 2026 · Baner multiplier 1.08 · Signature tier
  ₹1,950–2,400/sq ft base · G+1 · No basement · Level plot ·
  Steel @ ₹68/kg, cement @ ₹410/bag  [ How we calculate → ]

  [ Email me this estimate ]   [ WhatsApp it to me ]           ← rung 4
  [ Book a site visit to firm this up ]                        ← rung 5
  
  Small print: This is an indicative range, not a quotation.
  A real quote needs a site visit and drawings. We've never
  quoted more than 8% above our estimate range.
```

### Design decisions and why
- **The number appears immediately, ungated.** Non-negotiable.
- **Exclusions get equal weight to inclusions.** This is counterintuitive and it is the single strongest trust move on the site (R-11). Competitors' calculators quote structure-only rates that clients later discover exclude interiors; our transparency directly converts their weakness.
- **Blueprint colour, monospace numerals.** The result reads as engineering output, not a sales page.
- **Confidence label grounded in real project counts.** "Based on 14 similar projects in Baner" is far more persuasive than a percentage.
- **Published assumptions with live commodity rates.** Publishing steel and cement rates is unusual, verifiable, and signals we have nothing to hide.
- **"We've never quoted more than 8% above our estimate range"** — if true, this is the most powerful sentence on the site. If not true, publish the real figure.
- **Range, never a point value.** A single number will be treated as a promise and will eventually be quoted back at us in a dispute.

### Failure & edge cases
| Case | Handling |
|---|---|
| Area outside our range (<400 or >20,000 sq ft) | Show a wider range with a low-confidence badge and a note that this size needs a conversation |
| Locality we don't serve | Show the estimate anyway with a note about travel/logistics loading, and capture the locality (valuable expansion data) |
| LLM narration unavailable | Numbers still render; narration falls back to a templated explanation. **The numbers never depend on the LLM.** |
| Abusive repeated submissions | Rate limit by IP + fingerprint; the numbers are public knowledge so this is low-risk |

---

## 5.3 AI DESIGN ASSISTANT — `/design-studio`

Upload a photo of a room or wall → receive an improved design of *that specific space*.

**Strategic note:** this is the highest-risk feature in the brief. Done well it is a powerful lead magnet that captures taste data. Done badly — watermarks, long silent waits, hallucinated geometry, "AI slop" output — it actively damages a premium engineering brand. The design below is built to fail safely.

### Flow

```
STEP 1  UPLOAD
        Large drop zone, ~2:1, hairline dashed border.
        "Photograph the whole room from a corner, in daylight, holding
         the phone level."  ← 3-icon micro-guide; input quality is the
         single biggest determinant of output quality, so we coach it.
        Camera capture enabled on mobile. Max 10MB, JPEG/PNG/HEIC.
        Client-side downscale to 1536px longest edge before upload.

STEP 2  WHAT IS THIS ROOM?
        Chips: Living · Bedroom · Kitchen · Bathroom · Dining ·
               Balcony · Facade · Single wall
        (Room type materially constrains the prompt and prevents
         the model from turning a bathroom into a lounge.)

STEP 3  PICK A DIRECTION
        6 style cards, each shown with OUR OWN project photography
        as the reference image — not stock:
        Warm Minimal · Contemporary Indian · Muted Luxe ·
        Natural Material · Classic Restraint · Bold Contrast
        + optional free-text: "keep the existing flooring", "add
          more storage", "we have two young children"

STEP 4  GENERATION  (the queue experience — see below)

STEP 5  RESULTS
        3 variants in a 3-up grid (1-up mobile carousel).
        Each: a BeforeAfter against the ORIGINAL PHOTO — reusing our
        signature component and making the transformation legible.
        Actions per variant: ⤓ Download · ♡ Save · ↗ Share ·
                             "Get this costed →"
        Below: "What we'd change to build this for real" — 3 practical
        notes from a real designer's checklist (templated, e.g.
        "the ceiling height shown needs 2.9m; yours is likely 3.0m").
        
        ↳ "Get this costed" carries room type + area + style tier into
          /estimate, and attaches the generated image to any resulting
          lead. THIS IS THE POINT OF THE FEATURE.
```

### The queue experience (design-critical)
Free-tier generation is slow and quota-limited (R-12). A spinner for 40 seconds loses the user. Instead:

- The uploaded photo remains on screen, dimmed, with a **brass scan line** sweeping vertically — a slow, precise, architectural motion (`3s` linear loop). Not a spinner.
- Above it, honest, changing status text driven by **real backend events**, never faked: `Reading your room →` `Understanding the light →` `Composing three directions →` `Rendering (2 of 3)`.
- A real progress indication where available; an honest elapsed timer where not.
- **Below 20s wait:** stay on the page. **Above 20s:** offer `Email me when it's ready` — which is a rung-4 capture and turns latency into a conversion opportunity.
- While waiting, the space below fills with 3 relevant real projects in that room type. Waiting time becomes browsing time.

### Quota exhaustion (will happen — design for it)
```
We've reached today's limit on new design generations.
(We cap these to keep the tool free for everyone.)

Here's a curated moodboard for a Warm Minimal living room from
our own projects  →  [6 real project images]

[ Email me my generation tomorrow ]   ← rung 4, and honest
[ Talk to a designer instead ]        ← rung 5
```
Framing the cap as *"so we can keep it free"* converts a limitation into a generosity signal. Never show a raw API error.

### Guardrails
| Risk | Mitigation |
|---|---|
| Uploads of people / faces / NSFW | Server-side moderation pass before generation; reject with a neutral message. Faces auto-blurred if detected in a room photo. |
| Copyright / privacy | Explicit consent checkbox: uploads deleted after 30 days unless saved; never used for training; never published without written permission. |
| Output looks unbuildable | The "What we'd change to build this for real" panel is mandatory — it converts a weakness into expertise. |
| Cost/quota abuse | 3 generations per visitor per 24h (fingerprint + IP), 10 with a verified email. Server-side only; the API key never reaches the client. |
| Model deprecation | Provider abstraction layer (SRS §7.3). UI is model-agnostic. |
| Output quality is poor | Human curation switch: admin can mark a generation as "showcase" for the gallery; nothing is auto-published. |

### Disclaimer (persistent, calm, small)
> Generated visualisation. Indicative of style and mood, not a construction drawing. Real designs are produced by our team after a site measurement.

---

## 5.4 AI CONCIERGE (recommended scope reduction)

The brief lists an "AI Design Assistant" separate from the room-redesign tool. **Recommendation: do not build a general-purpose chatbot in v1.** In this category a chatbot answers questions worse than the FAQ and worse than WhatsApp, and it dilutes the engineering-precision brand.

**Instead, build a narrow, retrieval-grounded Answer Assistant, launched in Phase 8b:**
- Scope-limited to our own content: services, process, materials, FAQ, projects, published rates.
- **Grounded only** — every answer cites the page it came from with a link. If it can't ground the answer, it says so and offers WhatsApp.
- Never quotes prices beyond the published ranges. Never commits to dates.
- Surfaced as a search-first interface (`⌘K` / a search field in the header), not a floating bubble. Users type a question, get an answer plus the source pages.
- **Why this is stronger:** it doubles as site search (which we need anyway), it's cheap, it can't hallucinate a price, and it improves SEO-adjacent internal linking. A chat bubble does none of that.

---
---

# PART 6 — ADMIN PANEL

## 6.1 Design philosophy for admin

The user is a small-business owner or an office manager, likely on a laptop, possibly on a phone from a site, probably not technically confident, and definitely busy. Admin design principles are the **inverse** of the marketing site:

- **Density over drama.** No animation beyond 160ms state changes. No serif display type — Inter throughout except numerals.
- **Everything reachable in ≤2 clicks from the dashboard.**
- **Destructive actions require confirmation and are always undoable for 10 seconds** (a toast with `Undo`) rather than guarded by a modal. Modals get click-through-blindness; undo actually protects data.
- **It must work on a phone.** Leads arrive at all hours and the owner will triage from a car.
- **No feature the owner won't use.** Every screen below has been pressure-tested against "will they open this twice?"

## 6.2 Shell

```
┌────────┬─────────────────────────────────────────────────────────┐
│ ZYV.   │  Dashboard                          [🔍]  [+ New]  [AP] │  56px topbar
├────────┼─────────────────────────────────────────────────────────┤
│ ◉ Dash │                                                         │
│ ✉ Leads│                    content                              │
│   (7)  │                                                         │  240px rail
│ ▣ Work │                                                         │  collapses to
│ ★ Revie│                                                         │  64px icons,
│ ✎ Journ│                                                         │  drawer on
│ ⬡ Mater│                                                         │  mobile
│ ◇ AI   │                                                         │
│ ⚙ Setti│                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```
Unread counts as brass badges. Global `⌘K` command palette for navigation and quick actions.

## 6.3 Dashboard — what the owner actually needs

Ordered by what they check first thing in the morning:

1. **New leads today** — a count and the actual list, inline, with one-tap `Call` / `WhatsApp` / `Mark contacted`. **Not a chart.** The dashboard's job is to make today's leads actionable in one screen.
2. **Needs your response** — leads older than 24h with no contact logged, in `warning`. This single widget will do more for revenue than every analytics feature combined.
3. **Four KPI cards** — Leads (7d), Estimator completions (7d), Design generations (7d), Median first-response time. Each with a sparkline and a week-over-week delta.
4. **Lead source breakdown** — a simple horizontal bar: organic / direct / social / referral / paid.
5. **Funnel** — Visitors → Estimator started → Estimator completed → Contact submitted, with conversion percentages between each. This is the one strategic chart worth having.
6. **Content health** — a short list of nudges: "3 projects have no before/after", "2 testimonials have no linked project", "no journal post in 34 days."

## 6.4 Leads

**List:** a dense `DataTable` — Date · Name · Phone · Type · Locality · Area · Budget · Source · Status · Owner. Filters: status, type, date range, source, assigned. Saved views: *New today*, *Needs response*, *Hot*, *Quoted*, *Won*, *Lost*.

**Detail (a right-hand drawer, not a page):**
- Contact block with `Call` / `WhatsApp` / `Email` as one-tap actions.
- **The full journey:** every page viewed, the estimate they ran (with full inputs and outputs), projects shortlisted, AI images generated. **This is the highest-value screen in the admin** — the owner opens a lead already knowing what the client wants and what they can afford.
- Timeline of notes and status changes, with a quick-add note field.
- Status pipeline: New → Contacted → Site visit booked → Site visit done → Quoted → Won / Lost, with a mandatory reason on Lost (this data compounds into real business insight).
- Convert to project (prefills a portfolio entry on completion).
- Export CSV.

## 6.5 Portfolio management
List with drag-to-reorder and a published/draft toggle. Editor is a structured form matching the project page sections (§4.4) — **not a free-form page builder.** Constraining the editor is what keeps the site looking designed a year from now. Media manager with drag-drop, auto-upload to Cloudinary, alt-text field with a **completion meter** (accessibility and SEO enforced through UI pressure, not policy), before/after pairing with aspect-ratio validation and a crop tool, and reorder. A live preview link for drafts.

## 6.6 Testimonials
Add/edit with mandatory fields: name, project link, date, source, rating. A `verified` toggle that requires a source URL. Video upload. Approve/reject queue if a public submission form is added later.

## 6.7 Journal
List with status, category, author, publish date, and views. Editor: a block-based rich editor (Tiptap) restricted to our approved block set (§4.9), plus SEO fields (meta title with a live pixel-width preview, meta description, OG image with a live social preview, canonical, schema type) and a scheduled-publish field.

## 6.8 Materials
Simple CRUD over the material library: photo, name, category, brand, grade, unit cost, tier, notes, linked projects.

## 6.9 AI usage
- Generations today / this month against quota, as a gauge with the reset time.
- Cost tracker (₹ if a paid tier is ever used).
- A gallery of recent generations with the source photo, style, and outcome — with a `Feature this` action.
- A quality flag: admin marks poor outputs, feeding prompt tuning.
- Manual controls: pause generation, change the daily per-visitor cap, switch provider.

## 6.10 Estimator submissions
Every estimate run, complete or abandoned, with inputs, outputs, and whether it converted. Aggregate view: most-requested area bands, most-requested localities, tier distribution, and **the abandonment step** — telling the owner exactly where the tool loses people. Rate-card editor with an effective-date field and version history, so historical estimates remain reproducible.

## 6.11 Analytics
Embedded PostHog panels rather than a rebuilt analytics UI: top pages, funnels, session recordings for the estimator flow, and a retention view. **Do not rebuild analytics.** Link out to GA4 for anything deeper.

## 6.12 Settings
Business details (feeding schema and the footer), team members with roles, service areas, rate card, notification preferences (who gets emailed/WhatsApped on a new lead, and how fast), integrations (Cloudinary, Resend, Google Business Profile, PostHog), and SEO defaults.

## 6.13 Roles
| Role | Access |
|---|---|
| Owner | Everything, including settings, rate card, and user management |
| Manager | Leads, portfolio, testimonials, journal, materials. No settings, no rate card. |
| Editor | Journal and testimonials only |

---
---

# PART 7 — MOTION, GSAP, THREE.JS, LENIS

## 7.1 Motion principles

1. **Motion must inform.** Every animation either shows a relationship, communicates state, or directs attention. Decoration is cut.
2. **Weight, not bounce.** Objects have mass; they accelerate quickly and settle slowly (`--ease-standard`). No elastic, no overshoot, no spring.
3. **One focal animation per viewport.** Multiple competing animations read cheap and cost frames.
4. **Nothing animates twice.** Scroll reveals fire once (`once: true`). Re-triggering on scroll-back is the most irritating pattern on modern sites.
5. **Never animate opacity from 0 on content required for the initial render.** LCP elements and above-the-fold text render immediately, unanimated. Reveal animation begins below the fold.
6. **Motion is a progressive enhancement.** The site is fully functional and correctly laid out with JavaScript disabled or GSAP failing to load. No `opacity: 0` in the base stylesheet on content — initial hidden states are applied by JS only after GSAP confirms it is ready.
7. **`prefers-reduced-motion: reduce` disables all of it** — scroll reveals become instant, parallax becomes static, counters show final values, Lenis is disabled, the 3D scene renders a static frame. This is a global kill switch, implemented once at the provider level.

## 7.2 The motion budget — four approved patterns

Only these four exist on the marketing site. Anything else requires an explicit design review.

| # | Pattern | Where | Spec |
|---|---|---|---|
| **M1** | **Reveal** | Section entrances, cards, images | `y: 24px → 0`, `opacity: 0 → 1`, `--dur-slow`, `--ease-out`, trigger at 85% viewport, `once`. Grouped children stagger 60ms. |
| **M2** | **Rule draw** | Datum lines, section dividers, underlines | `scaleX: 0 → 1`, origin left, `--dur-slow`, `--ease-standard`. The identity's signature motion. |
| **M3** | **Media parallax** | Hero and large images only | Inner media translates `-8%` over the container's scroll range, `scrub: 0.6`. **Max 8% — anything more induces motion sickness and reveals edges.** Never on more than 2 elements per page. |
| **M4** | **Counter** | StatBand numerals | 0 → value over 900ms `--ease-out`, `once`, tabular numerals so width never changes. |

## 7.3 GSAP usage

**Plugins:** ScrollTrigger, Flip, SplitText (or a manual split — SplitText is a paid Club plugin; a 20-line manual character/word splitter is sufficient for our two use cases and avoids the licence). **No ScrollSmoother** — Lenis handles smoothing and running both causes conflicts.

**Registered uses (exhaustive):**

| Use | Implementation |
|---|---|
| All M1–M4 patterns | ScrollTrigger, batched via `ScrollTrigger.batch()` for card grids |
| Home S08 process strip | Horizontal pin-scroll: `pin: true`, `scrub: 1`, translating a track by `-(trackWidth - viewportWidth)`. **Desktop ≥1024 only** — pinned horizontal scroll on mobile is a usability disaster. Mobile gets a vertical timeline. |
| BehindTheWall strip | Same technique, or native `scroll-snap` on mobile |
| Portfolio filter | `Flip.from()` on filter change, `--dur-base`, preserving object permanence |
| Hero headline entrance | Manual word-split, stagger 40ms, `y: 100% → 0` inside `overflow: hidden` masks. **Only on the home hero, only on first visit** (session-flagged), and only after fonts are loaded (`document.fonts.ready`) so there is no reflow. |
| Page transitions | A 2px brass progress rule + a 180ms opacity cross-fade. **No elaborate route transitions** — they add perceived latency and break the back button's feel. |

**Architecture rules**
- All GSAP code lives inside a `useGSAP()` hook (`@gsap/react`) with a scoped context so every tween and ScrollTrigger is reverted on unmount. Orphaned ScrollTriggers in a Next.js App Router SPA are the number-one source of scroll jank.
- GSAP and ScrollTrigger are **dynamically imported** in a client component below the fold, so they are not in the initial bundle.
- `ScrollTrigger.refresh()` is called after any image load that could change document height, and after route transitions, debounced.
- **Never animate `top`/`left`/`width`/`height`.** Only `transform` and `opacity`. Enforced by review.
- `will-change` is applied only during an active tween and removed on complete.

## 7.4 Three.js / React Three Fiber — exactly two surfaces

**Position:** 3D is the highest-risk item in the stack. It is the most likely thing to make the site feel slow, drain battery, and hurt conversion (R-05). We use it in precisely two places where it *earns* its cost, and nowhere else.

### 3D-01 · The Materials Explorer (`/materials`, and embedded on project pages)
A single material sample — a 20cm tile of teak, terrazzo, marble, brass, or lime plaster — rendered on a plain surface with correct PBR maps, rotatable by drag, with a light-direction slider.

**Why this earns its place:** photographs cannot show how a material behaves as light moves across it, and that behaviour is precisely what a premium client is buying. It is genuinely informative, directly supports specification decisions, and is a real differentiator. It also has a clean, deterministic scope — one object, one light, no scene complexity.

**Scene specification — build exactly this, invent nothing:**

| Element | Specification |
|---|---|
| **Geometry** | One `BoxGeometry(1, 0.06, 1)` — a 20cm sample tile, 6cm thick. Bevelled edges via a 0.004 chamfer. That is the entire scene. No floor, no props, no environment geometry. |
| **Material** | `MeshPhysicalMaterial`. Maps: `map` (albedo), `normalMap`, `roughnessMap`. Optional `clearcoat` 0–0.3 for polished stone only. No metalness map except on brass (`metalness: 1.0, roughness: 0.35`). |
| **Camera** | `PerspectiveCamera`, fov 32, position `[0, 0.85, 1.5]`, target `[0,0,0]`. Low fov keeps the tile from looking distorted — a wide fov reads "video game". |
| **Lighting** | Exactly two lights. (1) `DirectionalLight`, intensity 2.2, colour `#FFF4E2` (warm daylight), position driven by the light-direction slider on an arc from `[-2,1.5,1]` to `[2,1.5,1]`. (2) `AmbientLight`, intensity 0.35, colour `#B8C4CC` (cool skylight fill). **No HDRI, no environment map, no shadows.** The whole point is to see the surface, and shadows cost frames for nothing here. |
| **Background** | Transparent (`alpha: true`). The page background shows through so the component sits inside the layout rather than in a black box. |
| **Interaction** | Drag to rotate on Y only, clamped to ±40°, with inertia damping 0.08. Pitch is locked — free orbit lets users find ugly angles. Light-direction slider maps 0–100 to the arc above. Pinch/scroll zoom disabled. |
| **Idle** | Tile rotates ±6° on a 12s sine loop until first interaction, then stops permanently. Signals interactivity without being restless. |
| **Fallback** | Below 1024px, or if WebGL is unavailable: a 5-frame image sequence of the same tile under 5 light positions, driven by the same slider. Visually near-identical, ~90KB, works everywhere. **Build the fallback first** — it is the actual shipping experience for most visitors. |
| **A11y** | `role="img"` with a description of the material. The slider is a real `<input type="range">` with a label, keyboard-operable. All information is also available as text below the canvas. |

**Budget:** ≤ 4k triangles, 3 textures at 1024², total payload ≤ 900KB per material, streamed on demand, one material in memory at a time. `frameloop="demand"` — renders only on interaction or during the idle loop.

### 3D-02 · The home hero spatial mark (optional, Phase 8c, ship only if performance allows)
A slowly rotating wireframe of an architectural detail — a staircase section or a roof truss — rendered as brass lines on Basalt, sitting behind the hero headline at low opacity.

**Why:** it is the "premium interaction" the brief asks for, it reinforces the technical-drawing visual language, and — critically — it is *lines, not surfaces*, so it is nearly free to render and never looks like a bad render.

**Scene specification:**

| Element | Specification |
|---|---|
| **Geometry** | One `LineSegments` object built from a hand-authored vertex list of a roof-truss elevation (preferred) or a staircase section. ~120–180 segments. **Not an imported model** — authoring it as a coordinate array keeps it under 4KB and guarantees it reads as a drawing rather than a render. |
| **Material** | `LineBasicMaterial`, colour `--brass-500`, `transparent: true`, `opacity: 0.22`. No line width (unsupported cross-platform) — visual weight comes from opacity and density. |
| **Camera** | `PerspectiveCamera`, fov 45, position `[0, 0, 6]`. Orthographic was considered and rejected: a slight perspective gives the truss depth without reading as a 3D object. |
| **Lighting** | **None.** `LineBasicMaterial` is unlit. Zero lighting cost. |
| **Motion** | Continuous Y rotation at **0.06 rad/s** — roughly one revolution per 105 seconds. Deliberately slower than feels right in a preview; at real reading speed anything faster is distracting. Plus mouse parallax: ±3° on X and Y, damped 0.05, **desktop pointer only**. |
| **Position** | Behind the hero headline, horizontally centred on the right third, vertically centred. `z-index` below all text. Never overlaps the CTAs. |
| **Background** | Transparent over `basalt-950`. |
| **Fallback** | A static SVG of the same truss at the same opacity and position. **This is the default render**; 3D only replaces it after the gates pass and `requestIdleCallback` fires. |
| **A11y** | `aria-hidden="true"`. It is decorative and carries no information. |

**Hard gates (all must pass or it does not render):**
- Viewport ≥1024px
- `navigator.hardwareConcurrency >= 4`
- `navigator.connection.effectiveType` is `4g` or unknown
- Not `prefers-reduced-motion`
- Not `navigator.deviceMemory < 4`
- Loads **after** LCP, via `requestIdleCallback`
Otherwise a static SVG of the same wireframe renders. The static SVG is the default; 3D is the enhancement.

### Global 3D rules
- `dpr={[1, 1.75]}` — never uncapped device pixel ratio.
- `frameloop="demand"` where possible; the hero mark runs at a throttled 30fps.
- The canvas **pauses entirely** when off-screen (`IntersectionObserver`) and on `document.hidden`.
- `three` and `@react-three/fiber` are dynamically imported and code-split. They must never appear in the shared bundle.
- No post-processing, no shadows, no environment HDRIs above 1k, no physics.
- **Total 3D JS budget: ≤ 180KB gzipped, loaded off the critical path.**

### What we explicitly refuse to build
A 3D house configurator, a walkthrough, a scroll-driven 3D building assembly. These are the obvious ideas, they take months, they perform badly on mid-range Android (the majority of this audience), and they convert worse than a well-photographed before/after. If the client wants a 3D walkthrough, the correct answer is a **Matterport-style embedded tour of a real completed home**, not a WebGL model — it's real, cheap, and far more persuasive.

## 7.5 Lenis (smooth scroll)

- Config: `duration: 1.05`, `easing: t => Math.min(1, 1.001 - 2^(-10t))`, `smoothWheel: true`, **`smoothTouch: false`**.
- **`smoothTouch: false` is mandatory.** Smooth scroll on touch fights native momentum, feels broken, and is widely disliked. Lenis on desktop only.
- Disabled entirely under `prefers-reduced-motion`.
- Integrated with ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` and driven from GSAP's ticker with `lagSmoothing(0)`.
- Anchor links, browser find-in-page, and focus scrolling must all still work — tested explicitly.
- Disabled inside modals, drawers, and any scrollable sub-container.

## 7.6 Perceived performance
- No preloader on any visit. A branded splash is vanity and costs a measurable share of mobile visitors.
- First visit shows the hero within 1s; the headline is server-rendered and unanimated until fonts are ready.
- Route changes render instantly with streamed content and skeletons.

## 7.7 THE MOTION MAP — every animated element on the site

§7.2 defines the patterns. This table says exactly where each one runs. **Anything not in this table does not animate.** If a section is missing here, it is static — that is a decision, not an omission.

Columns: **Trigger** = ScrollTrigger start · **Exit** = what happens on scroll-back · **RM** = behaviour under `prefers-reduced-motion`.

### Home (`/`)

| § | Element | Pattern | Spec | Trigger | Exit | RM |
|---|---|---|---|---|---|---|
| S01 | Hero headline | Custom | Word-split, `y: 100%→0` inside overflow masks, stagger 40ms, `--dur-cinema`, `--ease-out`. **First visit only** (session flag), after `document.fonts.ready` | On load, +120ms | none | Renders static, no mask |
| S01 | Hero sub + CTAs | M1 | stagger 80ms, delay 400ms | On load | none | Static |
| S01 | Datum line | M2 | delay 200ms | On load | none | Static |
| S01 | Hero media | M3 | `-6%` (reduced from 8% — headline sits over it) | scrub 0.6 | reverses | Static |
| S01 | StatBand | M4 | 900ms, stagger 100ms per stat | top 85% | none, `once` | Final values shown |
| S01 | Scroll cue | Custom | 24px rule, `scaleY 0→1→0`, 2s loop, origin top | On load | — | Hidden |
| S02 | Problem statement | M1 | Single block, no stagger | top 80% | none | Static |
| S03 | Three proofs | M1 | stagger 60ms | top 85% | none | Static |
| S04 | Section header + rule | M2 then M1 | rule first, header +150ms | top 85% | none | Static |
| S04 | Project cards | M1 | `ScrollTrigger.batch()`, stagger 60ms, batchMax 3 | top 88% | none | Static |
| S05 | BeforeAfter | Custom | Idle hint: handle 50→62→44→50%, 1400ms, `--ease-inout`, **once** | top 70% | none | No hint, static 50% |
| S06 | Service columns | M1 | stagger 80ms | top 85% | none | Static |
| S06 | Oversized numerals | M3 | `-4%`, scrub 1 | scrub | reverses | Static |
| S07 | Estimator panel | M1 | delay 100ms | top 80% | none | Static |
| S08 | Process strip | Custom | **Desktop ≥1024 only.** `pin: true`, `scrub: 1`, translate track `-(trackW - vw)`. Mobile: vertical M1 stagger 60ms | top top | unpins | Vertical static list |
| S09 | Testimonials | M1 | stagger 80ms | top 85% | none | Static |
| S10 | Article cards | M1 | stagger 60ms | top 85% | none | Static |
| S10 | CTA band | M1 + M2 | rule draws, then content | top 80% | none | Static |

### Project detail (`/work/[slug]`)

| § | Element | Pattern | Spec | Trigger | RM |
|---|---|---|---|---|---|
| 1 | Hero image | M3 | `-8%`, scrub 0.6 | scrub | Static |
| 1 | Hero title block | M1 | stagger 60ms, delay 200ms | On load | Static |
| 2 | Fact table rows | M1 | stagger 40ms | top 85% | Static |
| 4 | Drawings | Custom | SVG `stroke-dashoffset` draw, 1400ms `--ease-standard`, stagger 200ms per drawing, **once**. This is the signature moment of the page. | top 75% | Fully drawn, no animation |
| 5 | BeforeAfter | Custom | Idle hint, once, first instance only | top 70% | Static 50% |
| 6 | BehindTheWall | Custom | Desktop: horizontal scrub, `scrub: 1`. Mobile: native `scroll-snap`, no GSAP | top top | Static horizontal scroll |
| 7 | Gallery | M1 | batch, stagger 50ms | top 90% | Static |
| 9 | Timeline | M2 | Rule draws along the timeline, scrub 0.8 | scrub | Static |
| 10 | Testimonial | M1 | — | top 80% | Static |
| all | Sticky rail | Native | `position: sticky`, no JS | — | Unchanged |

### Portfolio index (`/work`)

| Element | Pattern | Spec | RM |
|---|---|---|---|
| Header + rule | M2 → M1 | — | Static |
| Card grid, initial | M1 | batch, stagger 60ms, `once` | Static |
| Card grid, on filter | Custom | `Flip.from()`, `--dur-base`, `--ease-standard`, absolute positioning during flip | Instant reflow, no animation |
| Load more | M1 | New batch only, stagger 60ms | Static |

### Service page (`/services/[service]`)

| Element | Pattern | Spec | RM |
|---|---|---|---|
| Hero | M1 + M2 | rule, then heading, then body, stagger 120ms | Static |
| Included / Excluded columns | M1 | Both columns animate **together**, never sequentially — sequencing implies priority and the whole point is equal weight | Static |
| Tier cards | M1 | stagger 80ms | Static |
| Avoidance panel | M1 | — | Static |
| Process steps | M1 | stagger 60ms | Static |
| FAQ | Native | Accordion height transition `--dur-base` | Instant open/close |

### Estimator (`/estimate`)

| Element | Pattern | Spec | RM |
|---|---|---|---|
| Step transition | Custom | Outgoing `x: 0→-24px, opacity 1→0` `--dur-fast`; incoming `x: 24px→0, opacity 0→1` `--dur-base`. Height animates to new content to avoid jump | Instant swap |
| Progress rule | M2 | Segment fills `scaleX 0→1`, `--dur-base` | Instant fill |
| Result numerals | M4 | 0 → value, 900ms, `once`. **Starts only after the range bar frame has rendered** | Final values |
| CostRangeBar | M2 | Band `scaleX 0→1` from centre, `--dur-slow`, delay 200ms | Static |
| Breakdown bars | M2 | stagger 80ms, origin left | Static |
| Assumptions list | M1 | stagger 40ms, delay 600ms | Static |

### Design Studio (`/design-studio`)

| Element | Pattern | Spec | RM |
|---|---|---|---|
| Queue scan line | Custom | Brass 2px line, `y: 0→100%`, 3s **linear**, infinite loop | Replaced by a static "Working…" label + elapsed timer |
| Status text | Custom | Cross-fade `--dur-base` on change. **Driven by real backend events** | Same text, no fade |
| Results reveal | M1 | stagger 120ms per variant | Static |

### Global

| Element | Pattern | Spec | RM |
|---|---|---|---|
| Header collapse | Custom | 84→64px height + backdrop-blur fade, `--dur-base`. Driven by scroll direction, not position | Instant, no transition |
| Header colour inversion | Custom | `IntersectionObserver` on dark sections, `--dur-fast` colour transition | Instant |
| Mobile drawer | Custom | Slide from right `--dur-slow` `--ease-out`; items stagger 40ms | Instant, no stagger |
| Services panel | Custom | Slide down `--dur-slow`, height 0→380px | Instant |
| Route change | Custom | 2px brass top progress bar + 180ms opacity cross-fade | Progress bar only |
| Sticky CTA bar | M1 | `y: 100%→0`, `--dur-base`, at 40% scroll | Appears instantly |
| Contact dock | Custom | Expand to 280px pill on hover, `--dur-base` | No expansion; always shows the name |
| Buttons | Custom | Inset brass hairline `scaleX 0→1` from left, `--dur-fast` | Background change only |
| Cards | Custom | `--shadow-lift` + border + inner media `scale(1.03)`, `--dur-base` | Border change only |
| Toasts | Custom | `y: 16px→0` + fade, `--dur-base` | Instant |

**Implementation note for Claude Code:** every entry above lives in a single `motion/` registry keyed by section ID, not scattered through components. Components declare `data-motion="M1"` and `data-motion-stagger="60"`; one `useGSAP` provider reads the DOM and wires ScrollTriggers. This keeps the motion map and the code in sync — if they diverge, the map is authoritative.

---
---

# PART 8 — MEDIA STRATEGY

## 8.1 Photography (working with a weak library)

### The house grade
A single LUT-equivalent applied to every image so that inconsistent source material becomes a deliberate style:
- Slightly lifted blacks (a matte, filmic floor rather than crushed shadows) — this *hides* noise and poor dynamic range.
- Warm highlights, +4 to +8 on temperature.
- Desaturated greens and cyans (Indian site photography is full of unflattering foliage and blue-cast shade).
- Reduced contrast in midtones, contrast restored in the print via a gentle S-curve.
- Grain permitted, even encouraged, at fine sizes. Grain reads as film, not as a bad camera.

### Framing rules
| Rule | Reason |
|---|---|
| Prefer 1-point perspective, camera level, verticals corrected | Verticals converging is the single most amateur-looking error in interior photography, and it is fixable in software |
| At least 40% of any project set must be detail crops | Details are easy to shoot well and make a small library feel abundant |
| Never shoot wide with a wide-angle lens close to a wall | Barrel distortion instantly reads "estate agent" |
| Shoot at the same time of day across a project | Consistency reads as intent |
| Include one photograph with a person in it per project | Scale and life (R-07) |
| Never use stock photography of interiors, anywhere | A single stock image detected by a visitor invalidates every other claim on the site |

### Aspect ratios (fixed, enforced at upload)
`16:10` project cards · `16:9` hero and video · `4:3` before/after mobile · `3:4` portrait editorial · `1:1` materials and avatars · `21:9` full-bleed section breaks.

### Technical
- All images through `next/image` with accurate `sizes`. AVIF first, WebP fallback.
- `quality: 72` for photography, `85` for detail crops and materials.
- Blurhash or a 20px LQIP placeholder on every image — no grey boxes.
- Cloudinary named transformations per aspect ratio so the editor cannot upload an unoptimised original.
- **Every image has meaningful alt text**, enforced by the admin completion meter (§6.5). Decorative images get `alt=""` deliberately.
- Total image weight per page: **≤ 1.4MB** on first viewport, ≤ 3.5MB fully scrolled.

## 8.2 Photography Remediation Plan (3-day, low-budget)

Prioritised by conversion impact per rupee. This is a deliverable in its own right.

| Priority | Shoot | Kit | Time | Why it matters most |
|---|---|---|---|---|
| **1** | **Materials macro set** — 40 swatches, north-facing window light, phone macro or a 50mm on any body, black card for contrast | Phone + white/black card | 4 hrs | Powers `/materials`, all service pages, and the texture layer. Highest output per hour of anything on this list. |
| **2** | **Behind-the-wall backlog** — go to every live site and photograph concealed works before closure; then make it standing site protocol | Phone | Ongoing | Our single biggest differentiator (§0.8). Costs nothing but discipline. |
| **3** | **Team + workplace** — every team member, natural light, working, not posed against a wall; plus the office, yard, and vehicles | Phone + reflector | 3 hrs | Directly attacks R-01 and R-07 |
| **4** | **Detail crops of 6 best completed projects** — joinery corners, hardware, tile junctions, edge profiles, light switches | Phone | 1 day | Makes the portfolio look premium without needing good wide shots |
| **5** | **One proper architectural shoot of the single best project** — hire a real architectural photographer for one day | ~₹15–25k | 1 day | Provides the hero asset and the homepage feature. One excellent project set outperforms twenty mediocre ones. |
| **6** | **Process film** — 90 seconds, locked-off shots of work happening, no voiceover, ambient sound | Phone + gimbal | 1 day + edit | R-09; the single most-watched asset on studio sites |
| **7** | **Before/after retrofit** — recover client's own "before" phone photos from WhatsApp history; match the framing when reshooting the "after" | — | 2 hrs | Before images are almost always bad phone photos, and that's *fine* — it makes the after look better and reads as authentic |

**Standing rule going forward:** every project gets a documented photo protocol — before, three concealed-works sets, three progress sets, and a finished set at consistent framing. Enforced at handover.

## 8.3 Video

| Asset | Spec | Use |
|---|---|---|
| Hero loop | 8s, muted, no audio track at all (saves weight), 1920×1080 H.265/AV1 + H.264 fallback, ≤1.2MB, `poster` preloaded | Home hero, desktop only |
| Process film | 90s, with sound, captioned | `/process`, `/about` |
| Project films | 45–60s per featured project | Project pages |
| Video testimonials | 30–60s, vertical crop available for social | `/reviews`, project pages |
| Time-lapses | 15–20s per project phase | Project timeline section |

**Rules:** never autoplay with sound; always `playsInline muted loop` for ambient loops; always a poster; the hero video never blocks LCP; captions on everything with speech (accessibility and because most people watch muted); no video on mobile hero.

## 8.4 Illustration

Illustration is **strictly technical line art**, never character illustration or "corporate Memphis" — the latter would destroy the brand in one image.

| Type | Use |
|---|---|
| Floor plans & sections | Project pages, service pages, as background texture at 4% opacity |
| Construction detail drawings | Service pages (waterproofing layers, ceiling sections, cabinet elevations) |
| Isometric process diagrams | Process page |
| Craft icon set | Throughout (§2.8) |
| Empty-state drawings | Admin and empty states |

Spec: 1.25px brass or blueprint stroke, no fill, orthographic or isometric only, monospace dimension labels, always SVG, always with `aria-hidden` unless conveying information (then a `<title>` and `role="img"`).

## 8.5 Dark mode strategy

**Decision: the public site is not user-toggleable.** Each page has a *fixed*, designed light or dark identity:

| Surface | Mode |
|---|---|
| Home hero, portfolio index, project heroes, gallery, CTA bands, footer | **Dark** (`basalt-950/900`) |
| Everything else — services, process, journal, contact, estimator | **Light** (`basalt-050`) |
| Design studio | Dark (makes generated images glow) |
| **Admin panel** | **Fully toggleable**, respecting `prefers-color-scheme`, persisted per user |

**Rationale:** on a portfolio-led marketing site, a user-controlled theme switch means every image and every section must be designed twice and will look compromised in one of them. Dark surfaces are a compositional tool here, used deliberately to make photography glow (R-09) — handing that control to the user destroys the art direction. Admin is different: it's a tool used for hours, and preference genuinely matters there.

All colour tokens nonetheless ship with full dark values, so if a toggle is ever mandated it is a configuration change, not a redesign.

---
---

# PART 9 — RESPONSIVE, ACCESSIBILITY, PERFORMANCE

## 9.1 Breakpoints

| Token | Min width | Target |
|---|---|---|
| `xs` | 0 | 320–479 small Android — **must be tested, a real share of this audience** |
| `sm` | 480 | Large phones |
| `md` | 768 | Tablets, small laptops |
| `lg` | 1024 | Laptops — 3D and pinned scroll unlock here |
| `xl` | 1280 | Desktop — sticky rails unlock here |
| `2xl` | 1536 | Large desktop |
| `3xl` | 1920 | Max content; beyond this, margins grow, content does not |

**Mobile-first, and genuinely so.** Every layout is specified at 375px first. Roughly two-thirds of this audience will arrive on mid-range Android over patchy 4G.

## 9.2 Responsive behaviour by component

| Component | <768 | 768–1023 | ≥1024 |
|---|---|---|---|
| Header | 64px, hamburger + call icon | 64px, hamburger | 84px→64px, full nav + panel |
| Hero | `100svh`, `display-xl`, still image | `90svh` | `100svh`, video, `display-xxl` |
| Project grid | 1-up / snap carousel | 2-up | 3-up (+2-up features) |
| Filters | Bottom sheet | Bottom sheet | Inline row |
| Before/after | 4:3, touch drag | 16:9 | 16:9, + keyboard |
| Process | Vertical timeline | Vertical | Horizontal pinned scroll |
| Estimator | One question per screen | One per screen | Two-column: inputs left, live result right |
| Estimator result | Stacked, inclusions accordion | Stacked | Side-by-side inclusions/exclusions |
| Behind the wall | Snap carousel | Snap carousel | GSAP horizontal |
| Footer | Accordion sections | 2-col | 4-col |
| Project page rail | Inline sections | Inline | Sticky right rail |
| Admin table | Card list | Horizontal scroll | Full table |
| Sticky CTA bar | Visible | Visible | Hidden (dock instead) |
| 3D | Static SVG | Static SVG | Live canvas (if gates pass) |

## 9.3 Touch specifics
- Minimum target 44×44px, minimum 8px between adjacent targets.
- `touch-action: manipulation` globally to remove the 300ms tap delay; `pan-y` on the before/after handle.
- No hover-dependent information anywhere. Every hover reveal has a tap or always-visible equivalent.
- Carousels use native `scroll-snap`, not JS carousels — better momentum, better accessibility, less code.
- Respect `env(safe-area-inset-*)` on all fixed elements.
- Form inputs at ≥16px font-size to prevent iOS zoom-on-focus.

## 9.4 Accessibility — target WCAG 2.2 AA

| Area | Requirement |
|---|---|
| Colour contrast | Per §2.1.4. `brass-500` never on text. Verified in CI with a contrast linter. |
| Focus | Visible on every interactive element: `2px solid var(--focus-ring)`, `offset 3px`. Never `outline: none` without a replacement. Focus order matches visual order. |
| Skip link | "Skip to content" as the first focusable element, visible on focus |
| Landmarks | One `<main>`, proper `<header>/<nav>/<footer>`, `aria-label` on multiple navs |
| Headings | One `<h1>` per page, no level skips |
| Images | Meaningful alt everywhere; `alt=""` on decorative; complex drawings get a text description |
| Forms | Every input has a `<label>`; errors linked via `aria-describedby`; error summary at top on submit with focus moved to it |
| Modals/drawers | Focus trapped, `Esc` closes, focus restored on close, background `inert`, `aria-modal` |
| Live regions | Toasts `aria-live="polite"`; errors `assertive`; estimator result announced |
| Motion | Full `prefers-reduced-motion` support (§7.1) |
| Keyboard | Every interaction reachable — including the before/after slider (§3.14), the carousel, and the 3D material (which has a non-3D fallback view) |
| Video | Captions on all speech; no auto-playing audio; no content flashing >3Hz |
| Zoom | Usable at 200% zoom and at 320px width with no horizontal scroll |
| Language | `lang="en-IN"` |
| Touch target | 2.2 AA: minimum 24×24 (we exceed at 44×44) |
| Testing | axe-core in CI, manual NVDA + VoiceOver pass per phase, keyboard-only walkthrough of all 7 journeys |

**Accessibility here is also commercial:** this audience skews older, includes parents and grandparents involved in the decision, and often browses in bright outdoor light. Large type, high contrast, and generous targets are conversion features, not compliance overhead.

## 9.5 Performance budgets (enforced in CI)

| Metric | Budget |
|---|---|
| LCP (mobile, 4G, mid-tier Android) | **< 2.0s** |
| INP | **< 200ms** |
| CLS | **< 0.05** |
| TTFB | < 500ms |
| First-load JS (shared) | **< 130KB gzipped** |
| Per-route JS | < 90KB additional |
| Fonts | < 190KB total, 3 files |
| First-viewport images | < 1.4MB |
| Lighthouse Performance (mobile) | ≥ 90 |
| Lighthouse Accessibility / Best Practices / SEO | ≥ 95 |

**How the budgets are met given the stack:**
- GSAP, Lenis, Three.js, and the estimator engine are **all dynamically imported** and never in the shared bundle.
- Every page is a Server Component by default; `"use client"` is a deliberate, reviewed decision.
- Cloudinary handles all transformation; no client-side image processing.
- shadcn/ui components are copied in, so only what's used ships.
- The Google Maps embed and PostHog load on interaction / after idle.
- `next/font` with `display: swap` and preloaded critical weights.
- ISR for project and journal pages; full static for services and process.

---
---

# PART 10 — CONTENT, COPY & SEO DESIGN

## 10.1 Copy rules
- Sentences under 20 words in body copy. Under 10 in headings.
- Every claim carries a number or a link to proof.
- Indian-English throughout: *lakh*, *crore*, *sq ft*, *society*, *chajja*, *plot*, *carpet area*, *built-up area*. Define technical terms inline on first use via a dotted-underline tooltip.
- **Banned words:** *bespoke* (except as a tier name), *cutting-edge*, *state-of-the-art*, *one-stop solution*, *dream home* (as a headline), *passion*, *journey*, *unlock*, *seamless*, *revolutionary*, *world-class*, *leading*, *premium* (we demonstrate it, we don't claim it).
- Numbers in headings are written as numerals (they stop the eye).

## 10.2 Microcopy that carries weight
| Location | Copy |
|---|---|
| Under every form | "We reply within one working day. We never share your number." |
| Estimator | "This is a range, not a quote. Here's exactly what it excludes." |
| WhatsApp dock | "Priya · Client Relations — usually replies in 20 minutes" |
| Shortlist | "Saved on this device. No account needed." |
| Design studio upload | "Deleted after 30 days. Never used to train anything." |
| Site visit CTA | "Free, no obligation, and we'll tell you if we're not the right fit." |
| 404 | "This page was demolished." |
| Newsletter | "One email a month. Cost updates and things we learned on site." |

## 10.3 Approved CTA lexicon (R-04)

| Rung | Approved | Banned |
|---|---|---|
| 2 | `Save to shortlist` · `Add to shortlist` | `Like` · `Favourite` |
| 3 | `Get a cost estimate` · `See the range` · `Estimate this project` | `Try our calculator` |
| 3 | `Redesign my room` · `See it restyled` | `Try AI` |
| 4 | `Email me this estimate` · `WhatsApp it to me` · `Download the spec sheet` | `Get it now` |
| 5 | `Book a site visit` · `Talk to a designer` · `Request a callback` · `Send us your plot details` | `Contact us` · `Get in touch` · `Enquire now` · `Submit` |
| Nav | `See our work` · `Read the process` | `Learn more` · `Click here` · `Explore` |

## 10.4 Content model (drives the CMS — see SRS §5)
Project · Service · Testimonial · Article · Material · TeamMember · FAQ · Lead · Estimate · Generation · Locality · SiteSettings.

## 10.5 SEO design decisions

| Decision | Detail |
|---|---|
| Rendering | Server Components + static generation; ISR (revalidate 3600) for projects and journal. Content is in the HTML, always. |
| URL design | Flat, readable, no dates in blog URLs (they age content), lowercase, hyphenated |
| Title pattern | `{Page} · {{BRAND_NAME}} — {{CITY}}` ; services: `{Service} in {{CITY}} — Cost, Process & Projects` |
| Meta descriptions | Hand-written per page, 150–160 chars, containing a number |
| Structured data | `LocalBusiness` + `GeneralContractor` (site), `Service`, `Article`, `FAQPage`, `AggregateRating`, `Review`, `BreadcrumbList`, `ImageObject`, `VideoObject` |
| Headings | Semantic and keyword-honest; no keyword stuffing |
| Internal linking | Every project links to its services and materials; every service links to projects and journal; the materials library is a hub |
| Sitemaps | Auto-generated, split by type, submitted on build |
| Images | Descriptive filenames, alt text, `ImageObject` schema on project galleries |
| Content strategy | Cost guides are the highest-intent organic entry point in this category. Priority articles: *House construction cost per sq ft in {{CITY}} 2026*, *What a turnkey contract actually includes*, *How to read a BOQ*, *Waterproofing: what goes wrong and why*, *Modular kitchen costs, honestly*, *Society NOCs for apartment renovation*. Each embeds the estimator. |
| Local | One `LocalBusiness` schema, an accurate Google Business Profile, locality pages only where real projects exist (§4.15), NAP consistency everywhere |
| Core Web Vitals | Treated as an SEO requirement, budgeted in §9.5 |
| `robots` | `/admin/*`, `/shortlist`, `/api/*` are `noindex, nofollow` |

## 10.6 Analytics event design (PostHog)
```
page_view · scroll_depth{25,50,75,100}
project_view · project_shortlist_add · shortlist_share
estimator_start · estimator_step{n} · estimator_complete · estimator_abandon{step}
estimator_email_capture · estimator_whatsapp_send
design_studio_upload · design_studio_style_select · design_generation_complete
design_generation_quota_hit · design_get_costed
cta_click{location,label,rung}   ← rung is the key dimension
form_start · form_step{n} · form_submit · form_error{field}
whatsapp_click{source_page} · phone_click{source_page}
download{asset} · video_play{asset,percent}
```
**The `rung` dimension on every CTA event is the analytical spine** — it lets us measure the commitment ladder (§0.5) directly and see exactly where the funnel leaks.

---

## 10.7 Open questions for the client

1. **Real figures needed:** actual project count, median handover time, actual Google rating and review count, dispute count, median response time. Every stat in §3.12 must be true.
2. **Is "we've never quoted more than X% above our estimate range" true?** If so, what is X? This is the highest-leverage sentence available.
3. **Will the team commit to the behind-the-wall photo protocol on every site?** The differentiator depends entirely on operational discipline, not on the website.
4. **Do we publish the payment milestone schedule?** Strongly recommended, but it is a commercial decision.
5. **Do we publish the "2 projects ran over" honesty section?** Recommended.
6. **Which 6 localities have real projects?** Determines the location pages.
7. **Is there existing CAD** for completed projects (for the drawings layer)?
8. **Who owns lead response**, and what SLA can we publish?
9. **Commercial track** — is it a real business line worth building §4.14 for?
10. **Languages** — is a Hindi or Marathi locale needed in v1?

---

*End of DESIGN.MD — see `SRS.md` for functional requirements and `implementationplan.md` for phasing.*





