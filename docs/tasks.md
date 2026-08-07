# Project Tasks & Status

Single source of truth for completed, remaining, and ongoing work on the {{BRAND_NAME}} (ZYVORA) platform.

---

# Completed

### Phase 0: Foundations & Setup
- [x] Next.js 15 App Router + TypeScript strict mode (`strict: true`, no `any`).
- [x] Tailwind CSS 4 setup with theme derived from CSS custom properties in `src/styles/tokens/*.css`.
- [x] Repository hygiene setup: ESLint (`eslint.config.mjs`), Prettier, scripts for dev placeholders and bundle budget checking (`scripts/check-bundle-budget.mjs`).
- [x] MongoDB Atlas connection helper with global caching across serverless invocations (`src/lib/db/connect.ts`).
- [x] Self-hosted font loading via `next/font/local` (`src/styles/fonts/`: Fraunces, Inter, JetBrains Mono - 156KB total budget compliant).

### Phase 1: Brand & Design System Foundations
- [x] Complete CSS token layer implemented (`src/styles/tokens/`: `color.css`, `layout.css`, `motion.css`, `radius.css`, `shadow.css`, `space.css`, `typography.css`, `z-index.css`).
- [x] Typography primitives and fluid clamp scale helpers (`src/components/foundation/typography.tsx`).
- [x] Datum line device (`src/components/foundation/datum-line.tsx`).
- [x] Custom craft SVG icon component set (`src/components/foundation/icon.tsx`).
- [x] Dev Type Specimen page (`src/app/dev/components/specimen.tsx`).

### Phase 3: Component Library
- [x] **UI Primitives (23 components in `src/components/ui/`)**: Button, Link, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Chip, Badge, Avatar, Tooltip, Skeleton, Divider, Accordion, Breadcrumb, Card, EmptyState, Field, Modal, Pagination, Popover, Spinner, Stepper, Table, Tabs, Toast.
- [x] **Domain Components (15 components in `src/components/domain/`)**: `ProjectCard`, `ServiceCard`, `TestimonialCard`, `StatBand`, `ProcessStep`, `MaterialSwatch`, `ArticleCard`, `TeamCard`, `FAQItem`, `ShortlistButton`, `BeforeAfter` (with touch drag, keyboard support, idle hint, no-JS fallback), `BehindTheWall`, `CostRangeBar`, `TrustBar`, `GalleryMasonry`.
- [x] **Shell Components (6 components in `src/components/shell/`)**: `Header`, `ServicesPanel`, `MobileDrawer`, `ContactDock`, `StickyCTABar`, `SiteShell`.
- [x] **Dev Component Galleries**: `/dev/components` (`page.dev.tsx`) and `/dev/shell` (`page.dev.tsx`).

### Phase 4: Data Models & Backend Infrastructure
- [x] **Mongoose Models (14 collections in `src/lib/db/models/`)**: `Project`, `Service`, `Lead`, `Estimate`, `Generation`, `Article`, `Material`, `Testimonial`, `FAQ`, `Locality`, `SiteSettings`, `AuditLog`, `User`, `RateCard`.
- [x] **Zod Schemas (`src/lib/schemas/`)**: `lead`, `estimate`, `generation`, `subscribe`, `common`.
- [x] Seed scripts for reference data (`src/lib/db/seed.ts`) and dev fixtures (`src/lib/db/seed-dev.ts`).
- [x] Cloudinary media helper (`src/lib/cloudinary.ts`).
- [x] Resend transactional email client & templates (`src/lib/email/`).
- [x] Rate-limiting module with Upstash Redis and MongoDB TTL fallback (`src/lib/rate-limit.ts`).
- [x] Auth capability matrix & permission guard (`src/lib/auth/permissions.ts`, `guard.ts`).
- [x] Lead API Route Handler (`/api/leads`) with rate limiting, Zod validation, duplicate phone detection, and email notifications.

### Phase 5: Homepage (Partial)
- [x] Homepage layout structure (`src/app/page.tsx`) with Hero, ProblemStatement, SelectedWork, ThreeProofs, ServicesIntents, MiniEstimator, ProcessStrip, StatBand, Testimonials, FAQ, CTA Band.

### Phase 6: Service System (Complete — design.md §4.6)
- [x] **Service Index (`/services`)**: Hero, 3 Intent Group Blocks (Build / Transform / Finish) with alternating full-width `ServiceCardDeep` rows, comprehensive 9-service comparison matrix (admitting standalone boundaries), category FAQs with `FAQPage` JSON-LD schema, and CTA band.
- [x] **3 Service Hub Pages (`/services/group/[group]`)**: Group statements, 3-up `ServiceCardOverview` cards, relevant project trio, group-specific FAQs, and CTA band for `build`, `transform`, and `finish` groups.
- [x] **All 9 Individual Service Pages (`/services/[slug]`)**: 13-section layout template including outcome-framed hero, 3 "Is this you?" scenarios, equal visual weight Included/Excluded scope columns, 3 pricing tiers (Essential / Signature / Bespoke), loss-framed "What You Avoid" panel with rupee impacts, service process timeline, filtered projects, materials swatches, before/after comparison, testimonials, `FAQPage` schema, inline estimator, and service CTA.
- [x] **Occupancy Timeline Module**: Built into the Home Renovation service page (`/services/home-renovation`).

### Phase 7: Portfolio / Work Pages
- [x] Portfolio Index page (`src/app/work/page.tsx`) with multi-filter bar (type, locality, budget, area, year), URL query state, server rendering, and pagination.
- [x] Project Detail page (`src/app/work/[slug]/page.tsx`) rendering 13 conditional sections, fact table (planned vs actual duration), brief, drawings, before/after, behind-the-wall, lightbox, materials, sticky rail, inline estimator, and related projects.

### Phase 7b: Process Page (Complete — design.md §4.7)
- [x] **Process Page (`/process`)**: "38 steps. 9 payments. No surprises." hero with PDF download CTA; 5-phase navigator; detailed `ProcessStep` timelines with named roles & deliverables; full-width interactive 9-Payment Milestone map; Change Order written protocol; "What Can Go Wrong" honest disclosures; 12 Handover documents checklist; and CTA band.

### Phase 8: Contact Experience (Complete — design.md §4.8)
- [x] **Contact Page (`/contact`)**: 4-step progressive form with 4-segment progress rule (Step 1: project type cards, Step 2: location & area, Step 3: timeline & budget with mandatory "Not sure yet", Step 4: contact details LAST with default WhatsApp opt-in); sessionStorage state persistence; dedicated success page view; direct phone (`tel:`), team member WhatsApp link, office hours, and click-to-load static map placeholder.

### Phase 8b: AI Cost Estimator Redesign (Complete — design.md §5.2 & SRS §4.9)
- [x] **Deterministic Rate Engine (`src/lib/estimator/engine.ts`)**: Pure function per SRS §4.9.1 computing range (`min`, `max`, `mostLikely`), per sq ft rate, 5 component splits (Structure 37%, Finishes 33%, MEP 15%, Design & PM 8%, Contingency 7%), inclusions, exclusions, and rate card assumptions.
- [x] **40-Case Unit Test Suite (`src/lib/estimator/__tests__/engine.test.ts`)**: Fixtures validating calculations across 9 project types, 3 tiers, multi-floors, site conditions, addons, split sums, out-of-bounds, and unserved localities.
- [x] **Guided Consultation Experience (`src/app/estimate/page.tsx`)**:
  - 5-step flow with 5-segment progress bar, large radio cards, paired area slider with live `m²` conversion, brand specification tier cards, and live addon delta chips.
  - **Full-Bleed Blueprint Result Header**: `ESTIMATE SUMMARY · {AREA} SQ FT · {TIER.toUpperCase()} · {LOCALITY.toUpperCase()}` with `numeral-xl` monospace price range.
  - `CostRangeBar` with 60% confidence shaded band and `mostLikely` marker.
  - **Equal Visual Weight Inclusions vs Exclusions Cards**: Side-by-side grid panels (`WHAT THIS INCLUDES` vs `WHAT THIS DOES NOT INCLUDE`) as the primary trust play.
  - **5-Component Breakdown Table**: Structure (37%), Finishes (33%), MEP (15%), Design & PM (8%), Contingency (7%) with share bars and range totals.
  - **AI Explanation & Rate Card Assumptions**: 3-paragraph plain language narration block, published commodity rates (steel & cement), and regional multiplier.
  - **Rung 4 & 5 Conversion**: Dual Email / WhatsApp PDF report request form + site visit booking CTA + signature 8% overrun disclaimer clause.
- [x] **API Endpoints**: `/api/estimate`, `/api/estimate/narrate`, `/api/estimate/send`, `/api/estimate/[id]/pdf`.
- [x] **Embeddable Estimator Widget (`src/components/estimator/estimator-widget.tsx`)**: Compact widget for service pages, articles, and project details (`FR-EST-15`).

---

## Visual Refinement Pass

### Pages Improved
- **Service Index (`/services`)**: Refined asymmetric 12-column editorial grid, high-contrast dark section for 9-service comparison matrix, fluid typography clamp scale, and equal-weight inclusions/exclusions.
- **Service Hub Pages (`/services/group/[group]`)**: Elevated 3-up overview cards, featured project trios, and group-specific FAQ accordion lists.
- **Service Detail Template (`/services/[slug]`)**: Implemented 13-section layout with loss-framed avoidance panels, 3-tier pricing cards with recommended highlight badges, and Occupancy Timeline for home renovation.
- **Process Page (`/process`)**: Architectural 5-phase step timeline, 9-payment milestone interactive map, change order protocol, and 12-document handover checklist.
- **Contact Page (`/contact`)**: Progressive 4-step form with contact details last, sessionStorage state persistence, dedicated success view page, and click-to-load experience centre map.
- **Homepage (`/`) & Portfolio (`/work`)**: Verified responsive typography hierarchy, hairline borders, and token-based spacing rhythm.
- **AI Cost Estimator (`/estimate`)**: Redesigned as a guided architectural consultation tool with full-bleed Blueprint result header, equal-weight inclusions/exclusions panels, and screenshot-worthy financial report presentation.

---

# Progress Log

### 2026-08-07
- Redesigned the AI Cost Estimator (`/estimate`) UX per `design.md` §5.2. Transformed form UI into a guided architectural consultation experience featuring full-bleed Blueprint styling, paired area slider with live `m²` conversion, brand specification cards, equal-weight inclusions/exclusions cards, component breakdown share bars, rate card assumptions, and dual Rung 4/5 conversion options.
- Verified TypeScript compilation with `npx tsc --noEmit` (0 errors).
