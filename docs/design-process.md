# DESIGN PROCESS PLAYBOOK
## ZYVORA — How to actually produce this design, in order

**Version** 1.0 · **Date** 2026-08-07
**Read `design.md` first.** That document says *what* the design is. This one says *how you build it*, in what order, and how you know each step worked.

---

## 0. THE ONE DECISION THAT MATTERS MOST

### Design in the browser. Not in Figma.

This is the recommendation, and it is not a close call for your situation.

**Why not Figma:**

| Problem | What actually happens |
|---|---|
| Figma has no real responsive model | You draw three fixed artboards (375, 768, 1440) and discover at build time that everything between them is broken |
| Figma cannot show real type rendering | Fraunces at `clamp(3rem, 1.2rem + 9.2vw, 8.25rem)` looks different in Chrome on a real phone than in Figma. Always. |
| Figma cannot show real motion | Every GSAP decision in `design.md` §7 has to be felt, not previewed |
| Translation is where projects die | You spend 3 weeks designing, then 3 weeks arguing with the design while coding it |
| You already have a code design system | shadcn/ui + Tailwind + CSS custom properties **is** a design tool. Building the same system twice is pure waste. |

**Why the browser wins here:**
- The design system in `design.md` Part 2 is already expressed as CSS custom properties. Writing them into `tokens/*.css` *is* the first design step.
- Responsive is the default, not an afterthought — you resize a window and see the truth.
- Real fonts, real images, real motion, real performance. On a project where the performance budget is a hard release gate (`SRS.md` §8.1), designing in a tool that can't show you performance is dangerous.
- Everything you make is shippable. Nothing gets thrown away.

**When you should still open Figma:** the logo/monogram (`design.md` §1.1.3), the 18 craft icons (§2.8), the technical line drawings (§8.4), and photo grading references. Vector artwork belongs in a vector tool. **Pages do not.**

> **If you have a designer who only works in Figma:** have them design *three screens only* — the home hero, one project page, one service page — at 390px and 1440px. Nothing else. Use those as art direction, then build everything else in the browser from the system. Do not let them draw 26 pages.

---

## 1. THE RESPONSIVE METHOD

You said the site must be responsive. Here's the method — it is more specific than "use Tailwind breakpoints."

### 1.1 Mobile-first is not a style, it's a constraint order

Design **375px first, always.** Not because most users are on 375px, but because it is the hardest constraint. Anything that survives 375px works everywhere. The reverse is never true — desktop designs shrunk down always break.

Practically, this means every component you write starts with **no breakpoint prefix**, and you *add* `md:` and `lg:` to enhance:

```
❌  text-6xl md:text-4xl sm:text-2xl      ← designing down. You will suffer.
✅  text-2xl md:text-4xl lg:text-6xl      ← designing up. Correct.
```

### 1.2 Breakpoints come from content, not devices

`design.md` §9.1 lists six breakpoints. **You will only make real design decisions at three of them.** The rest are polish.

| Breakpoint | What structurally changes | Why |
|---|---|---|
| **375 → base** | Single column. One idea per screen. | The floor. |
| **768 (`md`)** | Grid goes 1-up → 2-up. Footer goes accordion → 2-col. Forms may pair fields. | The point where two things fit side by side without either being cramped. |
| **1024 (`lg`)** | Nav goes hamburger → full. Grid goes 3-up. Pinned horizontal scroll unlocks. 3D unlocks. Lenis smooth scroll turns on. | The point where a real pointer and a real CPU can be assumed. |
| 1280 (`xl`) | Sticky rails appear. | Polish. |
| 1536+ | Margins grow, content doesn't. | Polish. |

**The rule:** add a breakpoint when the *content breaks*, not when a device exists. Drag your browser window slowly from 320 to 1920. Wherever it looks wrong, that's a breakpoint. Nowhere else.

### 1.3 Fluid over stepped — but only for type and space

Between breakpoints, type and spacing should **flow**, not jump. That's why `design.md` §2.2.2 specifies every size as a `clamp()`. The formula:

```
clamp(MIN, PREFERRED, MAX)

where PREFERRED = intercept + slope × vw

slope     = (maxSize - minSize) / (maxViewport - minViewport)
intercept = minSize - slope × minViewport
```

Worked example for `display-xxl` (48px at 375, 132px at 1440):
```
slope     = (132 - 48) / (1440 - 375) = 0.0789  → 7.89vw... but in rem terms:
          = 84px / 1065px = 0.0789 → 9.2vw when expressed against the root
intercept = 48 - (0.0789 × 375) = 18.4px = 1.15rem
→ clamp(3rem, 1.2rem + 9.2vw, 8.25rem)
```

You do **not** need to do this by hand for every size — the values are already in `design.md` §2.2.2. But understand the mechanic, because you'll need it when a heading doesn't feel right at 900px.

**Do not make layout fluid.** Column counts, grid structure, and navigation should *snap* at breakpoints. Fluid layouts produce awkward in-between states nobody designed.

### 1.4 Container queries for components

Tailwind 4 supports container queries natively. Use them for anything that appears at multiple widths — `ProjectCard` in a 3-up grid vs. in a sticky rail vs. in a related-projects strip.

```
Component asks "how wide am I?"  ← container query. Correct for cards.
Component asks "how wide is the screen?"  ← media query. Correct for page layout.
```

This is the single biggest quality-of-life improvement over a 2020-era responsive approach, and it directly prevents the "card looks wrong in the sidebar" problem you would otherwise hit on the project page (`design.md` §4.4).

### 1.5 The test that actually matters

Not Chrome DevTools. **A real mid-range Android phone, over real mobile data, held in one hand, outdoors.**

`SRS.md` §8.7 sets the reference device: 4GB RAM Android at 360×640 on throttled 4G. Buy one for ₹8,000 if you don't have one. Every performance and legibility decision gets made against that device. A MacBook will lie to you about everything.

---

## 2. THE ORDER OF WORK

This is the sequence. Do not reorder it — each step de-risks the next.

```
STEP 1  Tokens          ½ day   ── the entire visual system as variables
STEP 2  Type specimen   ½ day   ── prove the typography on a real phone
STEP 3  Greybox home    1 day   ── layout with zero styling
STEP 4  Hero            1 day   ── the hardest screen, done early
STEP 5  Vertical slice  2 days  ── one project page, fully finished
STEP 6  Component pass  4 days  ── everything else, extracted from the slice
STEP 7  Page assembly   —       ── pages become 90% assembly
STEP 8  Motion pass     1 day   ── added last, deliberately
STEP 9  Polish pass     2 days  ── empty/loading/error/hover/focus states
```

---

### STEP 1 · Tokens (½ day) — start here, literally today

Create the token files from `design.md` Part 2. Nothing else. No components, no pages.

```
styles/tokens/color.css       ← §2.1.2 ramps + §2.1.3 semantic aliases
styles/tokens/typography.css  ← §2.2.1 families + §2.2.2 scale
styles/tokens/space.css       ← §2.3
styles/tokens/layout.css      ← §2.4 containers + grid
styles/tokens/radius.css      ← §2.5
styles/tokens/shadow.css      ← §2.5
styles/tokens/motion.css      ← §2.6
styles/tokens/z-index.css     ← §2.7
```

Then wire Tailwind's theme to read from those variables so `bg-basalt-900` and `var(--basalt-900)` are the same source of truth.

**Build one throwaway page that renders every token** — every colour as a swatch with its contrast ratio, every type size with its name, every spacing value as a bar. This page takes 40 minutes and you will look at it a hundred times.

**Checkpoint:** you can change `--brass-500` in one file and watch the entire system shift.

**Failure mode to avoid:** writing a component before tokens exist. You will hard-code a hex value "just for now" and it will still be there at launch. Add the lint rule (`design.md` §2 note) on day one.

---

### STEP 2 · Type specimen (½ day) — the highest-leverage half-day in the project

Build a single page that shows the real typography with real ZYVORA copy:

- The `display-xxl` hero headline: *"We show you what's behind the wall."*
- A `heading-xl`, a `body-lg` paragraph at 68ch, a `caption`, a `label`, a `datum` line.
- A price in `numeral-xl` with tabular figures: `₹50.5 L — ₹62.2 L`
- The full lockup: `ZYVORA` over `Construction • Interiors • Renovation`

**Then open it on the real phone. Outdoors. In sunlight.**

You are checking:
- [ ] Is Fraunces at `display-xxl` actually beautiful at 48px on a small screen, or does the high contrast fall apart?
- [ ] Is `body-md` at 16px comfortable for a 55-year-old parent who is part of this buying decision?
- [ ] Do the tabular numerals actually align?
- [ ] Does the lockup descriptor letterspacing optically match the wordmark width?
- [ ] Does `ink-500` on `basalt-050` survive sunlight, or does it vanish?

**This is where you change your mind about typefaces if you're going to.** Changing them now costs half a day. Changing them in week 8 costs a week.

---

### STEP 3 · Greybox the homepage (1 day) — layout before beauty

Build all 10 homepage sections (`design.md` §4.1) with **zero styling**. Grey boxes, system font, correct spacing, correct proportions, correct responsive behaviour. No colour, no images, no type styling, no motion.

**Why this feels wrong and is right:** if the page doesn't work in grey boxes, it doesn't work. Beautiful styling reliably hides bad structure, and you won't find out until you're too invested to fix it. Every serious editorial designer works this way.

Check at 375, 768, 1024, 1440 by dragging the window:
- [ ] Does the section rhythm feel right, or are things cramped/floating?
- [ ] Is there one clear focal element per screen?
- [ ] On mobile, does the scroll feel purposeful or endless?
- [ ] Does the eye know where to go next at every scroll position?

**Checkpoint:** show the grey version to someone who doesn't know the project and ask "what does this company do, and what do they want you to do?" If they can't answer from structure alone, the structure is wrong.

---

### STEP 4 · The hero (1 day) — hardest thing, done fourth

The hero is where the brand either lands or doesn't, and it's where your performance budget is most at risk (LCP < 2.0s is a release gate).

Build it fully: real type, real lockup, real background treatment, the StatBand, both CTAs, the datum line.

**Do the performance check immediately, before you fall in love with it:**
- [ ] LCP on the real Android over throttled 4G — is it under 2.0s?
- [ ] Is the LCP element the poster image, not the video?
- [ ] CLS under 0.05 when fonts swap in?

If the video costs you the budget, **cut it now.** A fast still beats a slow video on every commercial metric, and finding this out in week 11 is much worse.

**Design checkpoint:** the 5-second test. Show the hero to five people for five seconds, close it, and ask what the company does and whether they'd trust it. That is literally the job of this section (`design.md` R-01).

---

### STEP 5 · One vertical slice (2 days) — a single project page, completely finished

Pick your best project. Build `/work/[slug]` end to end at production quality: all 13 sections, real photos, real drawings, real before/after, real behind-the-wall captions, the sticky rail, responsive at every width.

**Why this page and not another:** it exercises more of the design system than any other page — cards, tables, galleries, the before/after component, the technical layer, the sticky rail, the inline estimator. Whatever is broken in your system, this page will expose it.

**You are not building a page. You are discovering the component library.** Every time you write something reusable, note it. At the end you'll have a list that closely matches `design.md` Part 3 — and where it doesn't match, the reality of the slice wins.

**Checkpoint:** this page should be good enough to launch. If it isn't, stop and fix the system before building 25 more pages on top of it.

---

### STEP 6 · Component extraction pass (4 days)

Now pull the components out of the slice, generalise them, and build the ones the slice didn't need. Work down `design.md` Part 3 in layer order: Primitives → Composites → Domain → Sections → Shell.

**Two rules that will save you weeks:**

1. **Build every state as you build the component.** Default, hover, focus-visible, active, loading, success, disabled. Not "I'll add loading later" — later never comes, and a missing loading state is what makes a site feel cheap.
2. **Put every component in a gallery route (`/dev/components`) as you build it.** Every variant, every state, side by side. This is your design review surface and your regression check.

**Budget 1.5 days for `BeforeAfter` alone.** It is specified as a signature component (`design.md` §3.14) with touch handling, keyboard support, an idle hint, and a no-JS fallback. It is a mini-project, not a component. Do not let it get squeezed.

---

### STEP 7 · Page assembly

If steps 1–6 went well, pages are now 80–90% assembly. A service page should take half a day, not three days. **If it doesn't, your component library has a gap — go back and fix the library rather than writing page-specific CSS.** Page-specific CSS is how design systems die.

---

### STEP 8 · Motion pass (1 day) — deliberately last

Add motion only after every page works statically. `design.md` §7.2 allows exactly four patterns (Reveal, Rule draw, Media parallax, Counter) plus the registered special cases. Add them in that order, across the whole site at once.

**Why last:** motion added during layout hides layout problems and makes you tolerate structures you'd otherwise fix. It's also the first thing to cut if performance is tight, so it should be removable.

**Checkpoint:** turn on `prefers-reduced-motion` in your OS and reload every page. Everything must still work, still be legible, still be laid out correctly. If a page breaks, motion is doing structural work it shouldn't be.

---

### STEP 9 · Polish pass (2 days)

The pass that separates a real product from a demo. Go through every route and verify:

- [ ] Every loading state (skeletons matching final layout exactly — zero CLS)
- [ ] Every empty state (illustration + explanation + one action, per `design.md` §3.20)
- [ ] Every error state, including the network-failure-on-submit case that must retain form values
- [ ] Every hover state, wrapped in `@media (hover: hover) and (pointer: fine)`
- [ ] Every focus-visible state, keyboard-traversed
- [ ] Long content: a 60-character project name, a 400-word testimonial, a locality with a very long name
- [ ] Missing content: a project with no before/after, no drawings, no testimonial — no empty sections may render

---

## 3. USING AI TO ACCELERATE THIS

You asked about calling APIs / working the way Claude Code does. Here's where AI genuinely helps and where it actively hurts on a design project.

### Where it helps a lot

| Task | How |
|---|---|
| **Token file generation** | Paste `design.md` Part 2 → get `tokens/*.css` + the Tailwind theme mapping. Near-perfect, saves hours. |
| **`clamp()` math** | Give it min/max size and min/max viewport → get the formula. Tedious and error-prone by hand. |
| **Component scaffolding from spec** | Paste a component's section from `design.md` Part 3 → get a typed shadcn-style component with all seven states. Then *you* fix the details. |
| **Contrast verification** | Have it compute every pair in your palette and flag AA/AAA failures. Do this, don't trust your eye. |
| **Boilerplate states** | Skeletons, empty states, error boundaries — high volume, low judgment, ideal for delegation. |
| **Copy variants** | Generate 10 headline options against the voice rules in `design.md` §1.4 and the banned-word list, then pick. |
| **Accessibility audit reasoning** | Paste a component, ask what a screen reader announces and what's missing. |
| **The 40-case estimator fixture suite** | Pure logic, fully specifiable, perfect delegation target. |

### Where it hurts

| Trap | Why |
|---|---|
| **Asking it to "design the homepage"** | You get a generic gradient-and-rounded-cards SaaS page. It will actively fight the restraint this brand needs — the training data is full of the exact template you're trying to avoid. |
| **Accepting its spacing and type choices** | It defaults to safe, cramped, mid-market values. Your system is deliberately more generous. Hold the tokens. |
| **Letting it add libraries** | It will reach for a carousel package, an animation package, a form package. Every one blows the 130KB budget. |
| **Trusting its "responsive" output** | It writes desktop-first with `sm:` overrides by habit. Correct it every time. |
| **Skipping the greybox step because AI made a styled version fast** | Speed here buys you a beautiful page with broken structure. |

### The working pattern that actually works

**You bring the judgment; AI brings the volume.** Concretely:

1. You write the spec (already done — that's what `design.md` is).
2. AI generates the implementation from the spec.
3. **You review it on the real phone** and correct against the spec.
4. AI applies the correction across every similar component.

Step 3 is the one nobody does and it's the one that matters. The spec is the leverage — a well-specified component gets built correctly by AI on the first try; a vaguely-described one gets built generically every time.

---

## 4. THE WEEK-BY-WEEK, STARTING MONDAY

Mapped against `implementationplan.md`, but this is what *you personally* do.

| Week | Do this | Done means |
|---|---|---|
| **1** | Repo + CI + tokens + type specimen. Order the test Android. Book the materials macro shoot. | Token page renders; type verified on a real phone in sunlight |
| **2** | Logo/monogram in Figma. Greybox homepage. Craft icons started. | Grey homepage passes the "what does this company do" test |
| **3** | Hero fully built + performance verified. Materials shoot happens. | LCP < 2.0s on the real device with the real hero |
| **4** | Vertical slice: one complete project page. | That page is launch-quality |
| **5–6** | Component extraction + `/dev/components` gallery. BeforeAfter gets its own 1.5 days. | Every component, every state, in the gallery |
| **7–8** | Service template + portfolio index. Estimator flow. | A service page takes half a day to assemble |
| **9–10** | Design Studio + admin. | Provider chain fails over correctly under a forced quota error |
| **11** | Motion pass, then polish pass, then SEO/perf/a11y hardening. | Reduced-motion check passes on every page |
| **12** | Test, load content, launch. | All 14 release gates in `SRS.md` §10 |

---

## 5. THE CHECKPOINTS THAT CATCH REAL PROBLEMS

Run these repeatedly, not once.

**The squint test.** Blur your eyes at any page. You should see one dominant element and a clear path down the page. If everything is the same visual weight, the hierarchy is broken.

**The 5-second test.** Show the homepage for 5 seconds. Ask what the company does and whether they seem trustworthy. This is the actual job (`design.md` R-01).

**The sunlight test.** Real phone, outdoors, midday. Anything you can't read fails, regardless of what the contrast checker says.

**The grandmother test.** Someone over 55 who is not technical completes the estimator without help. This audience genuinely includes parents and grandparents in the decision.

**The slow-network test.** Throttle to Slow 3G and load the homepage. What appears first? Is it useful? Does anything jump?

**The keyboard test.** Tab through every page. Can you reach everything? Can you see where you are? Can you escape every modal?

**The "is this stock?" test.** Look at every image and ask whether a visitor could suspect it's stock. One suspected stock photo invalidates every trust claim on the site.

---

## 6. THE FIVE FAILURE MODES MOST LIKELY TO HIT THIS PROJECT

1. **Styling before structure.** Symptom: the homepage looks great at 1440 and falls apart at 390. Cure: Step 3, always.
2. **Skipping states.** Symptom: it demos beautifully and feels broken in use. Cure: build all seven states with the component, never after.
3. **Motion added during layout.** Symptom: nothing works with reduced motion on. Cure: Step 8 is last, deliberately.
4. **Content arriving late.** Symptom: everything is built and there's nothing to put in it. Cure: `implementationplan.md` Phase 2 starts *day one* — book the materials shoot this week.
5. **The design drifting premium-generic.** Symptom: you add a gradient, then a rounded corner, then a soft shadow, and three weeks later it looks like every SaaS template. Cure: the constraints in `design.md` §2.5 (near-square radii, no gradients, three shadows only, brass ≤5%) are load-bearing. Every violation is a decision, and the honest question is always *"would Apple, Stripe or a high-end architecture studio do this?"*

---

## 7. WHAT TO DO TODAY

1. Create `docs/` ✓ (done), then create the repo and `styles/tokens/*.css` from `design.md` Part 2.
2. Build the token-render page.
3. Build the type specimen page.
4. Open both on your phone, outdoors.
5. Order a mid-range Android test device if you don't have one.
6. Message whoever holds the material samples and book the macro shoot for this week — it's the highest-output-per-hour asset work in the whole project (`design.md` §8.2, priority 1).

Do not open a page component until steps 1–4 are done.

---

*End of design process playbook.*
