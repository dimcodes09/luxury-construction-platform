/* design.md §4.6 — per-service content for the nine service pages.
 *
 * NFR-SEO-02 requires a UNIQUE, HAND-WRITTEN title and meta description on
 * every page, and implementationplan.md Phase 6 names the real risk: "Nine
 * near-identical pages read as thin content to search engines. Each page needs
 * genuinely distinct copy, distinct FAQs and distinct projects."
 *
 * So nothing here is templated per service — headlines, scenarios, exclusions,
 * loss panels and FAQs are written individually. §4.6 also fixes the headline
 * direction: OUTCOME, NEVER CATEGORY ("A kitchen that survives twenty
 * monsoons", not "Modular Kitchen").
 *
 * Copy follows §10.1: sentences under 20 words, numbers over adjectives,
 * Indian-English (lakh, sq ft), and none of the §10.1 banned words.
 */

export type ServiceGroupKey = "build" | "transform" | "finish";

export type ServiceContent = {
  slug: string;
  name: string;
  group: ServiceGroupKey;
  order: number;
  /** NFR-SEO-02 — hand-written, unique, containing a number where possible. */
  metaTitle: string;
  metaDescription: string;
  /** §4.6 — outcome-framed, never the category name. */
  headline: string;
  definition: string;
  /** §4.6 §2 — three scenarios in the visitor's own words. */
  scenarios: { title: string; body: string }[];
  included: string[];
  /** FR-SVC-03 — cannot be empty. The differentiator (R-11). */
  excluded: string[];
  tiers: {
    name: "Essential" | "Signature" | "Bespoke";
    audience: string;
    specifications: string[];
    rateMin: number;
    rateMax: number;
    recommended?: boolean;
  }[];
  /** §4.6 §5 / R-06 — the page's persuasion engine. Real rupee figures. */
  avoid: { title: string; consequence: string; rupeeImpact: number }[];
  process: {
    step: number;
    title: string;
    body: string;
    duration: string;
    paymentPoint: boolean;
  }[];
  /** FR-SVC-08 — 8–12 questions, emitted as FAQPage schema. */
  faqs: { question: string; answer: string }[];
  /** Prefills the inline estimator (§4.6 §12). */
  estimatorType: string;
  exampleArea: number;
};

const WARRANTY_ESSENTIAL = "1-year workmanship warranty";
const WARRANTY_SIGNATURE = "3-year workmanship warranty";
const WARRANTY_BESPOKE = "5-year workmanship warranty";

export const SERVICES: ServiceContent[] = [
  {
    slug: "house-construction",
    name: "House Construction",
    group: "build",
    order: 1,
    metaTitle: "House Construction in Pune — Cost per sq ft, Process & Projects",
    metaDescription:
      "Turnkey house construction in Pune from ₹1,500/sq ft. Published rates, 9 payment milestones, and photographs of every slab and conduit before we close it up.",
    headline: "Built once. Built right. Documented throughout.",
    definition:
      "We build the whole house — structure, finishing and services — under one contract and one point of contact.",
    scenarios: [
      {
        title: "I have a plot and no idea what it costs",
        body: "Run the estimator first. It gives you a range and the assumptions behind it, before anyone calls you.",
      },
      {
        title: "I have drawings from an architect",
        body: "We price against your drawings and tell you what they have missed. That conversation is free.",
      },
      {
        title: "Two builders quoted 30% apart",
        body: "Usually one of them excluded something. Ask both for the exclusions list. Ours is published.",
      },
    ],
    included: [
      "Excavation, foundation and the full RCC frame",
      "Brick or AAC block work, internal and external plaster",
      "Electrical and plumbing rough-in with load calculations",
      "Basic flooring, doors, windows and sanitaryware to the tier specification",
      "Site supervision by a named project engineer",
      "As-built drawings and every warranty document at handover",
    ],
    excluded: [
      "Interiors, loose furniture and furnishing",
      "Landscaping and external works beyond the plinth",
      "Compound wall, gate and borewell — quoted separately as add-ons",
      "Municipal deposits, sanction fees and society charges",
      "Anything not written into the BOQ you sign",
    ],
    tiers: [
      {
        name: "Essential",
        audience: "First home, sensible specification, no compromise on structure.",
        specifications: [
          "Ultratech or Ambuja OPC 53 cement, Tata or Jindal Fe550 steel",
          "Hindware or Cera sanitaryware, Jaquar CP fittings",
          "Anchor or Polycab wiring with a labelled load schedule",
          "Vitrified tiling to 800×800, laminate flush doors",
          WARRANTY_ESSENTIAL,
        ],
        rateMin: 1500,
        rateMax: 1900,
      },
      {
        name: "Signature",
        audience: "Most of our clients. Better finishes, longer warranties.",
        specifications: [
          "Ultratech OPC 53 with fly-ash blend, Tata Fe550D steel",
          "Kohler or Duravit sanitaryware, Grohe CP fittings",
          "Finolex FR wiring, modular switches, surge protection",
          "Vitrified or engineered stone flooring, veneer doors",
          WARRANTY_SIGNATURE,
        ],
        rateMin: 1900,
        rateMax: 2800,
        recommended: true,
      },
      {
        name: "Bespoke",
        audience: "Custom joinery, imported finishes, a dedicated site engineer.",
        specifications: [
          "Mix design tested per pour, Fe550D with third-party testing",
          "Imported sanitaryware, concealed cisterns, thermostatic mixers",
          "Home automation conduiting, dedicated earthing pits",
          "Natural stone or imported tile, solid teak joinery",
          WARRANTY_BESPOKE,
        ],
        rateMin: 2800,
        rateMax: 4500,
      },
    ],
    avoid: [
      {
        title: "A quote that excludes waterproofing",
        consequence: "Ceiling stains by the second monsoon, and the tiling comes off to fix it.",
        rupeeImpact: 180000,
      },
      {
        title: "Steel bought at market rate mid-project",
        consequence: "A 12% price swing on 8 tonnes, absorbed by you rather than the contract.",
        rupeeImpact: 65000,
      },
      {
        title: "No named engineer on site",
        consequence: "Errors found at plaster stage instead of at column stage.",
        rupeeImpact: 140000,
      },
      {
        title: "A four-month overrun",
        consequence: "Rent paid on a flat while your finished house stands empty.",
        rupeeImpact: 140000,
      },
    ],
    process: [
      { step: 1, title: "Site visit and soil test", body: "We walk the plot, check access for a transit mixer, and send soil for testing.", duration: "1 week", paymentPoint: false },
      { step: 2, title: "Drawings and BOQ", body: "Plans, elevations, structural drawings and a line-by-line bill of quantities.", duration: "4 weeks", paymentPoint: true },
      { step: 3, title: "Sanction and mobilisation", body: "We file for sanction and set up site, storage and water.", duration: "6 weeks", paymentPoint: true },
      { step: 4, title: "Foundation and frame", body: "Excavation, footings, columns and slabs. Every pour photographed.", duration: "14 weeks", paymentPoint: true },
      { step: 5, title: "Masonry and services", body: "Block work, conduiting and plumbing, all recorded before plaster.", duration: "10 weeks", paymentPoint: true },
      { step: 6, title: "Finishing", body: "Plaster, flooring, joinery, paint and fixtures.", duration: "14 weeks", paymentPoint: true },
      { step: 7, title: "Snagging and handover", body: "You list defects, we clear them, then you get every document.", duration: "2 weeks", paymentPoint: true },
    ],
    faqs: [
      { question: "What does your per-sq-ft rate actually cover?", answer: "Structure, basic finishing and MEP rough-in to the tier you pick. Interiors, landscaping and statutory deposits are excluded, and the full list is on this page." },
      { question: "Is the rate fixed or does it move?", answer: "The contract sum is fixed once you sign the BOQ. Steel and cement escalation beyond 7% is shared, and that clause is written into the contract before you sign." },
      { question: "How long does a 2,500 sq ft house take?", answer: "Around 11 months from mobilisation, plus 4 to 6 weeks for drawings and sanction. Our median across 61 projects is 11.4 months." },
      { question: "Who supervises the site day to day?", answer: "A named project engineer, whose number you get on day one. You are not routed through a call centre." },
      { question: "Can I buy my own materials?", answer: "Yes, for finishes. Not for structural materials — we cannot warranty a slab poured with cement we did not test." },
      { question: "What happens if the project runs late?", answer: "We publish planned against actual duration on every completed project, including the ones that ran over. Delay causes and remedies are in the contract." },
      { question: "Do you handle municipal sanction?", answer: "Yes, we file and follow up. Deposits and fees are paid by you directly to the authority, so nothing is marked up." },
      { question: "When do I pay?", answer: "Against 9 published milestones, each with a written release condition. The full schedule is on the process page before you contact us." },
    ],
    estimatorType: "new-construction",
    exampleArea: 2500,
  },

  {
    slug: "turnkey-home-solutions",
    name: "Turnkey Home Solutions",
    group: "build",
    order: 2,
    metaTitle: "Turnkey Home Construction & Interiors in Pune — One Contract",
    metaDescription:
      "Construction and interiors on one contract in Pune, from ₹1,900/sq ft. One team from foundation to furniture, so no trade can blame another for a delay.",
    headline: "One contract. One number. One person accountable.",
    definition:
      "Construction and interiors delivered by the same team, on one contract, with one handover date.",
    scenarios: [
      { title: "I don't want to manage two contractors", body: "Split contracts mean the builder blames the interior team and you arbitrate. One contract removes that." },
      { title: "I want to move in, not to project-manage", body: "You approve drawings and selections. We handle sequencing, labour and materials." },
      { title: "The interiors quote arrived after the build started", body: "Pricing both together means the electrical layout matches the furniture layout." },
    ],
    included: [
      "Everything in House Construction",
      "Interior design drawings, joinery details and material selection",
      "Modular kitchen, wardrobes and built-in storage",
      "False ceiling, lighting design and finishes",
      "One handover date covering both scopes",
    ],
    excluded: [
      "Loose furniture, curtains and soft furnishing",
      "Appliances and electronics",
      "Landscaping and external works",
      "Statutory deposits and society charges",
    ],
    tiers: [
      { name: "Essential", audience: "A complete home on a controlled budget.", specifications: ["Standard-grade construction to the Essential specification", "Laminate-finish modular kitchen with soft-close hinges", "MDF wardrobes with laminate shutters", "Gypsum false ceiling in living and bedrooms", WARRANTY_ESSENTIAL], rateMin: 1900, rateMax: 2400 },
      { name: "Signature", audience: "Most turnkey clients. Better joinery, longer warranties.", specifications: ["Signature-specification construction throughout", "Acrylic or veneer kitchen with Hettich hardware", "Plywood wardrobes with veneer or acrylic shutters", "Layered lighting with profile and cove detail", WARRANTY_SIGNATURE], rateMin: 2400, rateMax: 3400, recommended: true },
      { name: "Bespoke", audience: "Custom joinery and imported finishes throughout.", specifications: ["Bespoke-specification construction with tested mix design", "Custom joinery in solid timber or imported veneer", "Imported hardware, integrated appliances", "Automation-ready lighting and climate control", WARRANTY_BESPOKE], rateMin: 3400, rateMax: 5200 },
    ],
    avoid: [
      { title: "Two contracts with a gap between them", consequence: "Chased conduit cut into a finished wall because the furniture layout arrived late.", rupeeImpact: 95000 },
      { title: "Interiors priced after the shell is up", consequence: "Beam positions that force a lowered ceiling nobody wanted.", rupeeImpact: 120000 },
      { title: "A kitchen ordered before the site is measured", consequence: "A 40mm gap filled with a scribe strip you will look at every day.", rupeeImpact: 45000 },
      { title: "Two warranties that each blame the other", consequence: "A leak under the sink nobody will own.", rupeeImpact: 60000 },
    ],
    process: [
      { step: 1, title: "Joint brief", body: "Construction and interiors scoped in the same conversation.", duration: "1 week", paymentPoint: false },
      { step: 2, title: "Drawings and selections", body: "Plans, elevations, joinery details and a material board.", duration: "6 weeks", paymentPoint: true },
      { step: 3, title: "Build", body: "Structure and services, with interior layouts already fixed.", duration: "26 weeks", paymentPoint: true },
      { step: 4, title: "Fit-out", body: "Joinery, ceilings, lighting and finishes.", duration: "12 weeks", paymentPoint: true },
      { step: 5, title: "Snagging and handover", body: "One list, one team, one set of documents.", duration: "2 weeks", paymentPoint: true },
    ],
    faqs: [
      { question: "Is turnkey more expensive than two contracts?", answer: "Usually 4 to 8% cheaper overall, because sequencing waste and rework disappear. The line items are itemised so you can compare." },
      { question: "Can I use my own interior designer?", answer: "Yes. We build to their drawings and coordinate. The single-accountability benefit reduces, and we say so up front." },
      { question: "What is the one handover date?", answer: "The date both scopes complete. There is no separate interiors date to slip afterwards." },
      { question: "Do I pay for construction and interiors separately?", answer: "One schedule, 9 milestones. Interiors payments fall in the later milestones." },
      { question: "Can I change the kitchen layout mid-build?", answer: "Until conduiting starts, at no cost. After that it is a change order with a written price before work stops." },
      { question: "What if I only want the shell now and interiors later?", answer: "We will build the shell with the interior layout already conduited, so the later fit-out does not cut into finished walls." },
      { question: "Who owns the drawings?", answer: "You do. Every drawing and revision is handed over as a file at completion." },
      { question: "Is the warranty split?", answer: "No. One team, one warranty, whatever the defect turns out to be." },
    ],
    estimatorType: "new-construction",
    exampleArea: 2200,
  },

  {
    slug: "home-renovation",
    name: "Home Renovation",
    group: "transform",
    order: 3,
    metaTitle: "Home Renovation in Pune — Occupancy Timeline & Published Costs",
    metaDescription:
      "Renovation in Pune from ₹900/sq ft, phased so you can keep living in the house. We publish which rooms are unusable and for how many weeks.",
    headline: "Your house, improved — and you can still live in it.",
    definition:
      "Structural and finishing work on an occupied house, phased around the rooms you actually need.",
    scenarios: [
      { title: "We can't move out for six months", body: "Most renovations are phased. We publish an occupancy timeline showing which rooms are unusable, and when." },
      { title: "The bathroom has been leaking for years", body: "Two coats of paint over a damp patch is not a repair. We open it, find the junction, and rebuild the detail." },
      { title: "The flat is 20 years old and everything is tired", body: "We survey what is worth keeping. Sometimes the answer is the slab and nothing else." },
    ],
    included: [
      "Demolition, debris removal and structural repair",
      "Waterproofing to wet areas, with pressure testing",
      "Re-wiring and re-plumbing where the survey calls for it",
      "Plaster, flooring, joinery and paint",
      "An occupancy timeline showing room-by-room availability",
    ],
    excluded: [
      "Loose furniture and furnishing",
      "Society deposits, lift charges and NOC fees",
      "Structural strengthening discovered after opening up — quoted as a change order",
      "Anything behind a wall we were not permitted to open during survey",
    ],
    tiers: [
      { name: "Essential", audience: "Making a tired house sound and clean again.", specifications: ["Crack repair, plaster patching and full repaint", "Wet-area waterproofing with 2-coat polyurethane", "Re-wiring to a labelled load schedule", "Vitrified flooring where existing is beyond repair", WARRANTY_ESSENTIAL], rateMin: 900, rateMax: 1400 },
      { name: "Signature", audience: "Most renovations. Layout changes plus new finishes.", specifications: ["Non-structural layout changes with beam checks", "Full re-plumbing in CPVC with pressure testing", "New joinery in plywood with veneer or laminate", "Engineered stone or large-format vitrified flooring", WARRANTY_SIGNATURE], rateMin: 1400, rateMax: 2200, recommended: true },
      { name: "Bespoke", audience: "Taking it back to structure and rebuilding inside.", specifications: ["Structural alteration with a consulting engineer's sign-off", "Complete MEP replacement with as-built drawings", "Custom joinery in solid timber", "Natural stone or imported tile throughout", WARRANTY_BESPOKE], rateMin: 2200, rateMax: 3600 },
    ],
    avoid: [
      { title: "Painting over a damp patch", consequence: "The stain returns in eight months and the plaster has to come off anyway.", rupeeImpact: 85000 },
      { title: "Re-tiling without redoing the waterproofing", consequence: "New tiles lifted within two years to reach the failed membrane.", rupeeImpact: 160000 },
      { title: "Keeping 20-year-old wiring behind new walls", consequence: "A re-wire that means cutting fresh plaster.", rupeeImpact: 110000 },
      { title: "No occupancy plan", consequence: "Six weeks in a hotel that nobody budgeted for.", rupeeImpact: 90000 },
    ],
    process: [
      { step: 1, title: "Survey and opening up", body: "We test damp, check the slab, and open one sample area.", duration: "1 week", paymentPoint: false },
      { step: 2, title: "Scope and occupancy plan", body: "A room-by-room timeline showing what is unusable and when.", duration: "2 weeks", paymentPoint: true },
      { step: 3, title: "Demolition and structural repair", body: "Debris out, cracks and slabs repaired.", duration: "3 weeks", paymentPoint: true },
      { step: 4, title: "Services and waterproofing", body: "Wiring, plumbing and membranes, photographed before closing.", duration: "4 weeks", paymentPoint: true },
      { step: 5, title: "Finishing", body: "Plaster, flooring, joinery and paint, phased by room.", duration: "8 weeks", paymentPoint: true },
      { step: 6, title: "Handover", body: "Snagging cleared and as-built drawings handed over.", duration: "1 week", paymentPoint: true },
    ],
    faqs: [
      { question: "Can we live in the house during the work?", answer: "Usually yes, in phases. The occupancy timeline shows which rooms are unusable and for how many weeks, before you sign." },
      { question: "How do you handle society permissions?", answer: "We prepare the NOC application and the work-hours undertaking. Deposits are paid by you directly to the society." },
      { question: "What if you find something behind the wall?", answer: "Work stops, we photograph it, and you get a written change order with a price before anything continues." },
      { question: "How much dust will there be?", answer: "A lot during demolition. We seal doorways with plastic and run the debris route through one corridor only." },
      { question: "What are the working hours?", answer: "Whatever your society permits, typically 9 to 6 on weekdays. Night and weekend work is possible on commercial jobs." },
      { question: "Is a 20-year-old slab safe to keep?", answer: "Usually. We check cover, carbonation and deflection during survey and tell you if it is not." },
      { question: "Do you renovate one bathroom only?", answer: "Yes. Single-room work is quoted as a fixed sum rather than per sq ft." },
      { question: "Will the waterproofing be photographed?", answer: "Yes, every wet area, before tiling. The photos are in your handover file and on the project page if you permit it." },
    ],
    estimatorType: "renovation",
    exampleArea: 1200,
  },

  {
    slug: "waterproofing",
    name: "Waterproofing",
    group: "transform",
    order: 4,
    metaTitle: "Waterproofing Contractors in Pune — Membranes, Tests & Photos",
    metaDescription:
      "Terrace, bathroom and basement waterproofing in Pune from ₹400/sq ft. Pressure-tested, photographed before closing, with a 5-year warranty on Bespoke.",
    headline: "The work you'll never see, and never think about again.",
    definition:
      "Membranes, treatments and pressure tests applied to wet areas, terraces and basements before anything covers them.",
    scenarios: [
      { title: "There's a damp patch on the ceiling below the bathroom", body: "That is a failed junction, not a paint problem. It gets worse every monsoon." },
      { title: "The terrace pools water after rain", body: "Slope, not membrane, is usually the fault. We check both before quoting." },
      { title: "We're building and want it done properly once", body: "The cost difference between adequate and good waterproofing is about 1.5% of the build." },
    ],
    included: [
      "Surface preparation, crack filling and fillet coving",
      "Membrane or chemical treatment to the specified system",
      "24-hour ponding or 3-bar pressure test, witnessed",
      "Photographic record of every layer before closing",
      "Warranty certificate naming the system and applicator",
    ],
    excluded: [
      "Tiling, screed and finishes over the membrane",
      "Structural crack repair beyond 5mm width",
      "Plumbing repairs discovered during the pressure test",
      "Terrace slope correction, quoted separately by volume",
    ],
    tiers: [
      { name: "Essential", audience: "Wet areas in a new build, done to code.", specifications: ["2-coat acrylic polymer membrane, 1.0mm dry film", "Fillet coving at all wall-floor junctions", "24-hour ponding test with photographs", "Dr Fixit or Sika systems, brand named in the contract", WARRANTY_ESSENTIAL], rateMin: 400, rateMax: 600 },
      { name: "Signature", audience: "Most retrofits and all terraces.", specifications: ["2-coat polyurethane membrane, 1.2mm dry film", "Reinforcing fabric at junctions and penetrations", "3-bar plumbing pressure test held 24 hours", "Sika or Fosroc systems with applicator certification", WARRANTY_SIGNATURE], rateMin: 600, rateMax: 1000, recommended: true },
      { name: "Bespoke", audience: "Basements, podiums and anything below grade.", specifications: ["APP-modified bitumen membrane, 4mm torch-applied", "Protection screed and drainage board", "Crystalline admixture in the structural pour", "Third-party inspection and witnessed testing", WARRANTY_BESPOKE], rateMin: 1000, rateMax: 2400 },
    ],
    avoid: [
      { title: "A single-coat application to save 40%", consequence: "Pinholes that let water through within three monsoons.", rupeeImpact: 145000 },
      { title: "No fillet coving at the wall junction", consequence: "The one place membranes fail first, and the hardest to reach later.", rupeeImpact: 95000 },
      { title: "Tiling before the ponding test", consequence: "A leak found after the finishes are on, so both come off.", rupeeImpact: 175000 },
      { title: "No photographic record", consequence: "No way to prove what was applied when the warranty is claimed.", rupeeImpact: 60000 },
    ],
    process: [
      { step: 1, title: "Survey and moisture mapping", body: "We meter the affected area and trace the source.", duration: "2 days", paymentPoint: false },
      { step: 2, title: "Method statement", body: "The system, the film thickness and the test, in writing.", duration: "3 days", paymentPoint: true },
      { step: 3, title: "Preparation", body: "Removal of finishes, crack filling and coving.", duration: "1 week", paymentPoint: false },
      { step: 4, title: "Application", body: "Coats applied with wet-film gauge readings recorded.", duration: "1 week", paymentPoint: true },
      { step: 5, title: "Testing and handover", body: "Ponding or pressure test, photographed, then the warranty certificate.", duration: "3 days", paymentPoint: true },
    ],
    faqs: [
      { question: "How long does waterproofing last?", answer: "A correctly applied polyurethane system lasts 10 to 15 years. Our warranty runs 1, 3 or 5 years depending on tier." },
      { question: "Can you fix a leak without breaking the tiles?", answer: "Sometimes, with injection grouting. It works on crack-driven leaks and fails on junction-driven ones, and we tell you which you have." },
      { question: "What is a ponding test?", answer: "We flood the area to 25mm for 24 hours and check the ceiling below. It is the only honest proof the membrane works." },
      { question: "Do you photograph the work?", answer: "Every layer, before it is covered. That record is the reason this page exists." },
      { question: "Which brands do you use?", answer: "Dr Fixit, Sika and Fosroc, named in the contract with the exact product code." },
      { question: "Is terrace waterproofing priced by area?", answer: "Yes, per sq ft of terrace, plus slope correction by volume where the fall is wrong." },
      { question: "Can this be done during the monsoon?", answer: "No. Membranes need a dry substrate. We schedule around it and say so rather than take the job." },
      { question: "Do you warranty work over someone else's structure?", answer: "Yes, after our survey. If the substrate is unsound we will tell you before quoting, not after." },
    ],
    estimatorType: "single-service",
    exampleArea: 600,
  },

  {
    slug: "painting",
    name: "Painting",
    group: "transform",
    order: 5,
    metaTitle: "House Painting in Pune — Preparation, Brands & Coverage Published",
    metaDescription:
      "Interior and exterior painting in Pune from ₹400/sq ft. Putty, primer and finish coats with the brand, grade and coat count written into the contract.",
    headline: "Twelve coats of preparation. Two of paint.",
    definition:
      "Surface preparation, priming and finish coats, with the number of coats and the product grade written into the contract.",
    scenarios: [
      { title: "The last paint job started peeling in a year", body: "Almost always preparation, not paint. Putty over a damp or chalky surface fails regardless of brand." },
      { title: "I got three quotes and they're all different", body: "Ask each for coat count and product code. Most quotes hide one primer coat." },
      { title: "We just want the flat refreshed before moving in", body: "Two rooms or twelve, priced per sq ft of surface, not per room." },
    ],
    included: [
      "Sanding, scraping and removal of loose material",
      "Crack filling and two coats of wall putty, sanded between",
      "One primer coat, brand and grade named",
      "Two finish coats to the specified sheen",
      "Masking, floor protection and daily clean-up",
    ],
    excluded: [
      "Plaster repair beyond hairline cracks",
      "Damp treatment or waterproofing",
      "Polishing or painting of furniture and joinery",
      "Scaffolding for external work above three floors",
    ],
    tiers: [
      { name: "Essential", audience: "A clean refresh on sound walls.", specifications: ["Birla or JK wall putty, 2 coats", "Asian Paints or Berger primer, 1 coat", "Tractor Emulsion or equivalent, 2 coats", "Matt finish, standard shade card", WARRANTY_ESSENTIAL], rateMin: 400, rateMax: 800 },
      { name: "Signature", audience: "Most homes. Better washability and coverage.", specifications: ["Acrylic wall putty, 2 coats with intermediate sanding", "Water-based primer, 1 coat", "Royale or Easy Clean emulsion, 2 coats", "Low-VOC formulation, custom shades available", WARRANTY_SIGNATURE], rateMin: 800, rateMax: 1400, recommended: true },
      { name: "Bespoke", audience: "Textured, lime or specialist finishes.", specifications: ["Lime plaster or Venetian finish, applied in 3 coats", "Specialist substrate preparation with mesh where needed", "Imported or hand-mixed pigment", "Sample panel approved on site before full application", WARRANTY_BESPOKE], rateMin: 1400, rateMax: 2400 },
    ],
    avoid: [
      { title: "Skipping the primer coat", consequence: "Patchy sheen and a repaint within two years.", rupeeImpact: 55000 },
      { title: "Putty applied over a damp wall", consequence: "Blistering that takes the plaster with it when removed.", rupeeImpact: 70000 },
      { title: "One finish coat instead of two", consequence: "Roller marks visible in raking light, permanently.", rupeeImpact: 40000 },
      { title: "No written coat count", consequence: "No way to prove what you paid for once it is dry.", rupeeImpact: 30000 },
    ],
    process: [
      { step: 1, title: "Surface survey", body: "We check moisture and adhesion on each wall.", duration: "1 day", paymentPoint: false },
      { step: 2, title: "Written specification", body: "Coats, products and codes, agreed before we start.", duration: "2 days", paymentPoint: true },
      { step: 3, title: "Preparation", body: "Sanding, filling and two putty coats.", duration: "1 week", paymentPoint: false },
      { step: 4, title: "Priming and finishing", body: "Primer, then two finish coats with a sample panel approved first.", duration: "1 week", paymentPoint: true },
      { step: 5, title: "Clean-up and handover", body: "Masking removed, floors cleaned, touch-ups done.", duration: "1 day", paymentPoint: true },
    ],
    faqs: [
      { question: "How many coats do I actually get?", answer: "Two putty, one primer, two finish. The count is in the contract and you can check it while we work." },
      { question: "Which brand do you use?", answer: "Asian Paints or Berger by default, with the exact product code in the quote. Other brands on request." },
      { question: "How long does a 1,000 sq ft flat take?", answer: "About 10 working days including preparation. Preparation is the slow part and the part that matters." },
      { question: "Can we stay in the flat?", answer: "Yes, room by room. We finish and reopen one room before starting the next." },
      { question: "Do you move furniture?", answer: "We move and sheet what is in the room. Fragile and valuable items should be moved by you." },
      { question: "Why is your quote higher than a local painter?", answer: "Usually because ours includes a primer coat and two putty coats. Compare coat counts before comparing totals." },
      { question: "Is exterior painting priced the same?", answer: "No. Exterior is priced per sq ft of surface plus scaffolding, and uses an exterior-grade emulsion." },
      { question: "What is the warranty?", answer: "1, 3 or 5 years on workmanship by tier. Manufacturer warranty on the product is separate and passed to you." },
    ],
    estimatorType: "single-service",
    exampleArea: 1000,
  },

  {
    slug: "electrical-work",
    name: "Electrical Work",
    group: "transform",
    order: 6,
    metaTitle: "Electrical Contractors in Pune — Load Schedules & As-Built Drawings",
    metaDescription:
      "House wiring and re-wiring in Pune from ₹400/sq ft. FR conduit, calculated load schedules, every run photographed before plaster, and an as-built drawing you keep.",
    headline: "Every circuit mapped, labelled and handed to you.",
    definition:
      "Wiring, conduiting and distribution designed from a calculated load schedule, then documented as an as-built drawing.",
    scenarios: [
      { title: "The MCB trips whenever the geyser and AC run together", body: "That is a load distribution problem, not a faulty MCB. It needs a schedule, not a bigger breaker." },
      { title: "Nobody knows which switch does what", body: "Because nobody drew it. Every job we do ends with a labelled DB and a drawing." },
      { title: "We're adding ACs and a bigger kitchen", body: "Existing wiring often cannot take it. We calculate before you buy the appliances." },
    ],
    included: [
      "Load calculation and circuit schedule",
      "FR PVC conduit, concealed, with draw wires",
      "Copper wiring to the specified brand and gauge",
      "Distribution board with labelled MCBs and RCCB",
      "Earthing pit and continuity testing",
      "Photographs of every run before plaster, plus an as-built drawing",
    ],
    excluded: [
      "Light fittings, fans and appliances",
      "Chasing and plaster repair, if the work is in a finished house",
      "MSEDCL meter application, deposits and load sanction",
      "Home automation devices, though we conduit for them",
    ],
    tiers: [
      { name: "Essential", audience: "A sound, safe installation to code.", specifications: ["Polycab or Anchor FR copper wiring", "25mm FR PVC concealed conduit with draw wire", "Havells DB with MCBs and a 30mA RCCB", "Single earthing pit with continuity test report", WARRANTY_ESSENTIAL], rateMin: 400, rateMax: 700 },
      { name: "Signature", audience: "Most homes. Better switchgear and separation.", specifications: ["Finolex FR-LSH copper wiring", "Separate circuits per AC, geyser and kitchen appliance", "Modular switches with surge protection at the DB", "Dedicated earthing for electronics", WARRANTY_SIGNATURE], rateMin: 700, rateMax: 1200, recommended: true },
      { name: "Bespoke", audience: "Automation-ready with full documentation.", specifications: ["Automation-ready conduiting with spare capacity", "Structured cabling for data and AV", "Schneider or Legrand switchgear throughout", "Thermal imaging of the DB at handover", WARRANTY_BESPOKE], rateMin: 1200, rateMax: 2400 },
    ],
    avoid: [
      { title: "One circuit shared by kitchen and bedrooms", consequence: "A tripped breaker takes out the fridge every time the toaster runs.", rupeeImpact: 45000 },
      { title: "Non-FR conduit to save 15%", consequence: "A conduit that feeds a fire instead of containing it.", rupeeImpact: 200000 },
      { title: "No as-built drawing", consequence: "Every future repair starts with breaking a wall to find the run.", rupeeImpact: 65000 },
      { title: "Undersized wiring for future ACs", consequence: "A full re-wire two years after moving in.", rupeeImpact: 180000 },
    ],
    process: [
      { step: 1, title: "Load assessment", body: "We list every appliance, present and planned, and calculate.", duration: "3 days", paymentPoint: false },
      { step: 2, title: "Circuit drawing", body: "A schedule and layout you approve before any chasing.", duration: "1 week", paymentPoint: true },
      { step: 3, title: "Conduiting", body: "Chasing and conduit laid, then photographed run by run.", duration: "2 weeks", paymentPoint: true },
      { step: 4, title: "Wiring and DB", body: "Wire pulled, DB assembled, every MCB labelled.", duration: "1 week", paymentPoint: true },
      { step: 5, title: "Testing and handover", body: "Insulation, earthing and RCCB trip tests, then the as-built file.", duration: "2 days", paymentPoint: true },
    ],
    faqs: [
      { question: "Do I get a drawing of the wiring?", answer: "Yes, an as-built drawing showing every run and circuit. It is the document most useful ten years from now." },
      { question: "How do you decide the load?", answer: "We list every appliance including the ones you plan to buy, apply diversity factors, and size from that." },
      { question: "Is concealed wiring safe?", answer: "Yes, in FR conduit with draw wires, so a cable can be replaced without breaking the wall." },
      { question: "Can you re-wire an occupied flat?", answer: "Yes, room by room. Chasing is noisy and dusty, so we do one zone at a time." },
      { question: "Why do you photograph the conduit?", answer: "So you can see what is behind the plaster, and so any future work knows where not to drill." },
      { question: "Do you handle the MSEDCL connection?", answer: "We prepare the application and test report. Deposits and load sanction fees are paid by you directly." },
      { question: "What earthing do you provide?", answer: "A chemical or plate earthing pit with a measured resistance value in the handover file." },
      { question: "Can you wire for home automation later?", answer: "We conduit with spare capacity now, so the devices can be added without breaking walls." },
    ],
    estimatorType: "single-service",
    exampleArea: 1500,
  },

  {
    slug: "interior-design",
    name: "Interior Design",
    group: "finish",
    order: 7,
    metaTitle: "Interior Designers in Pune — Drawings, Materials & Costs Published",
    metaDescription:
      "Interior design and execution in Pune from ₹1,200/sq ft. Every drawing, material grade and joinery detail specified before a single sheet is cut.",
    headline: "Rooms that look like the people who live in them.",
    definition:
      "Design drawings, material specification and joinery detailing, executed by the team that drew them.",
    scenarios: [
      { title: "We've seen a hundred pictures and can't decide", body: "We start from how you use the rooms, not from a style label. The look follows." },
      { title: "The designer we spoke to won't quote until we commit", body: "We quote from a measured survey and a written scope, before any fee." },
      { title: "We want it to still look right in ten years", body: "That is a materials decision more than a styling one. It is why we publish grades." },
    ],
    included: [
      "Measured survey and existing-condition drawings",
      "Layout options, elevations and joinery details",
      "Material and finish specification with brands and grades",
      "Lighting layout coordinated with the electrical drawing",
      "Execution by our own joinery and site teams",
    ],
    excluded: [
      "Loose furniture, rugs, curtains and art",
      "Appliances and electronics",
      "Civil or structural changes, quoted under Renovation",
      "Third-party procurement we have not specified",
    ],
    tiers: [
      { name: "Essential", audience: "A coherent scheme on a controlled budget.", specifications: ["Layout drawings and one revision round", "Laminate-finish joinery on MDF carcass", "Standard lighting layout with surface fittings", "Vitrified flooring and standard hardware", WARRANTY_ESSENTIAL], rateMin: 1200, rateMax: 1800 },
      { name: "Signature", audience: "Most interiors. Detailed joinery, layered lighting.", specifications: ["Full drawing set with two revision rounds", "Plywood carcass with veneer or acrylic shutters", "Layered lighting with profile, cove and task layers", "Hettich or Hafele hardware, named in the contract", WARRANTY_SIGNATURE], rateMin: 1800, rateMax: 3000, recommended: true },
      { name: "Bespoke", audience: "Custom joinery and specified imported finishes.", specifications: ["Unlimited revisions to sign-off, plus 1:5 details", "Solid timber or imported veneer joinery", "Lighting design with lux calculations", "Imported hardware and specialist wall finishes", WARRANTY_BESPOKE], rateMin: 3000, rateMax: 5000 },
    ],
    avoid: [
      { title: "Joinery ordered from a mood board", consequence: "Shutters that do not clear the door swing you forgot to draw.", rupeeImpact: 85000 },
      { title: "Lighting decided after the ceiling is closed", consequence: "Surface fittings where recessed ones were intended.", rupeeImpact: 60000 },
      { title: "MDF carcass in a Pune monsoon", consequence: "Swollen bases in bathrooms and kitchens within four years.", rupeeImpact: 130000 },
      { title: "No hardware brand in the contract", consequence: "Hinges that sag by the second year and cannot be matched.", rupeeImpact: 55000 },
    ],
    process: [
      { step: 1, title: "Brief and survey", body: "How you use each room, measured against what exists.", duration: "1 week", paymentPoint: false },
      { step: 2, title: "Concept and layouts", body: "Options with plans and reference imagery.", duration: "2 weeks", paymentPoint: true },
      { step: 3, title: "Detailed drawings", body: "Elevations, joinery sections and the material board.", duration: "3 weeks", paymentPoint: true },
      { step: 4, title: "Execution", body: "Joinery fabricated and installed by our own team.", duration: "10 weeks", paymentPoint: true },
      { step: 5, title: "Styling and handover", body: "Final fit, snagging and the drawing file.", duration: "1 week", paymentPoint: true },
    ],
    faqs: [
      { question: "Do you charge a design fee separately?", answer: "Yes, ₹50 to ₹200 per sq ft depending on tier. It is adjusted against execution if you build with us." },
      { question: "How many revisions do I get?", answer: "One round on Essential, two on Signature, unlimited to sign-off on Bespoke. Stated before you commit." },
      { question: "Can I execute your drawings with another contractor?", answer: "Yes. You own the drawings. We will not warranty work we did not build." },
      { question: "Do you do only one room?", answer: "Yes. Single-room interiors are quoted as a fixed sum rather than per sq ft." },
      { question: "What plywood do you use?", answer: "BWP-grade for wet areas and BWR elsewhere, brand named in the contract with the ISI mark." },
      { question: "How long does a 3BHK take?", answer: "About 12 weeks from drawing sign-off, assuming selections are made on schedule." },
      { question: "Do you provide 3D views?", answer: "Yes, for the main rooms. They are a communication tool, not a photograph, and we say so." },
      { question: "Who coordinates with the electrician?", answer: "We do. The lighting layout and the electrical drawing are issued together." },
    ],
    estimatorType: "interiors",
    exampleArea: 1200,
  },

  {
    slug: "modular-kitchen",
    name: "Modular Kitchen",
    group: "finish",
    order: 8,
    metaTitle: "Modular Kitchen in Pune — Carcass, Hardware & Costs, Itemised",
    metaDescription:
      "Modular kitchens in Pune from ₹1,200/sq ft. Carcass, shutters and hardware quoted by brand and grade, never as one number you cannot check.",
    headline: "A kitchen that survives twenty monsoons.",
    definition:
      "Kitchen carcass, shutters, hardware and counter, specified and priced line by line.",
    scenarios: [
      { title: "Every quote is one number with no breakdown", body: "Ask for carcass material, shutter finish and hardware brand separately. Ours is itemised by default." },
      { title: "The last kitchen swelled at the base", body: "MDF or MR ply near water. BWP-grade plywood costs about 12% more and does not do that." },
      { title: "The layout works on paper but not when cooking", body: "We check the work triangle against how you actually cook, before drawing shutters." },
    ],
    included: [
      "Measured survey and layout with the work triangle checked",
      "Carcass, shutters and internal accessories to the tier specification",
      "Hardware — hinges, channels and lift-ups — named by brand",
      "Counter, sink cut-out and backsplash",
      "Installation, levelling and post-installation adjustment",
    ],
    excluded: [
      "Appliances, chimney and hob",
      "Plumbing and electrical relocation, quoted separately",
      "Civil work, wall levelling and tiling",
      "Loose accessories and crockery organisers not in the list",
    ],
    tiers: [
      { name: "Essential", audience: "A sound kitchen with honest materials.", specifications: ["MR-grade plywood carcass, BWP in the sink unit", "Laminate shutters, 1mm, post-formed edges", "Hettich soft-close hinges and telescopic channels", "Granite counter, 18mm, with a moulded edge", WARRANTY_ESSENTIAL], rateMin: 1200, rateMax: 1800 },
      { name: "Signature", audience: "Most kitchens. Better shutters and full-extension channels.", specifications: ["BWP-grade plywood carcass throughout", "Acrylic or veneer shutters with edge banding", "Hettich or Hafele full-extension soft-close channels", "Quartz counter, 20mm, with an undermount sink", WARRANTY_SIGNATURE], rateMin: 1800, rateMax: 3000, recommended: true },
      { name: "Bespoke", audience: "Custom joinery with integrated appliances.", specifications: ["BWP marine-grade carcass with edge sealing", "Custom veneer or lacquer shutters, sample-approved", "Blum hardware with servo-drive on tall units", "Imported stone or sintered counter, 20mm mitred", WARRANTY_BESPOKE], rateMin: 3000, rateMax: 5000 },
    ],
    avoid: [
      { title: "MR ply in the sink unit", consequence: "A swollen, delaminated base within four monsoons.", rupeeImpact: 45000 },
      { title: "Unbranded hinges", consequence: "Doors that sag by year two and cannot be matched for replacement.", rupeeImpact: 35000 },
      { title: "A layout drawn before the site is measured", consequence: "A 40mm filler strip in the middle of the run.", rupeeImpact: 25000 },
      { title: "No provision for the chimney duct", consequence: "A duct routed across a finished ceiling after the fact.", rupeeImpact: 30000 },
    ],
    process: [
      { step: 1, title: "Cooking survey", body: "How you cook, what you store, who else uses it.", duration: "2 days", paymentPoint: false },
      { step: 2, title: "Layout and itemised quote", body: "Work triangle checked, then a line-by-line price.", duration: "1 week", paymentPoint: true },
      { step: 3, title: "Site measurement", body: "Final measurement after tiling, not before.", duration: "1 day", paymentPoint: false },
      { step: 4, title: "Fabrication", body: "Cut, edge-banded and assembled in our workshop.", duration: "4 weeks", paymentPoint: true },
      { step: 5, title: "Installation and adjustment", body: "Levelled, aligned, then adjusted again after two weeks of use.", duration: "1 week", paymentPoint: true },
    ],
    faqs: [
      { question: "Why is your quote itemised?", answer: "Because a single number hides the carcass grade, which is the only thing that decides whether it lasts." },
      { question: "What plywood should a kitchen use?", answer: "BWP-grade everywhere, and non-negotiable in the sink unit. MR-grade is acceptable in dry tall units only." },
      { question: "Which hardware brands do you fit?", answer: "Hettich, Hafele or Blum, named in the contract with the model code." },
      { question: "Granite or quartz?", answer: "Quartz is denser and does not need sealing. Granite is cheaper and repairs more easily. Both are in the tier tables." },
      { question: "How long from order to installation?", answer: "About 5 weeks, with final measurement taken after tiling is complete." },
      { question: "Can you match an existing kitchen?", answer: "Laminates usually, veneers rarely. We will show you a sample before committing." },
      { question: "Do you supply appliances?", answer: "No. We provide the cut-outs and power points, and you buy the appliances at market price rather than a marked-up one." },
      { question: "What is the warranty on the hardware?", answer: "Manufacturer warranty passed to you, plus our workmanship warranty of 1, 3 or 5 years by tier." },
    ],
    estimatorType: "interiors",
    exampleArea: 130,
  },

  {
    slug: "false-ceiling",
    name: "False Ceiling",
    group: "finish",
    order: 9,
    metaTitle: "False Ceiling in Pune — Framing Centres, Access Panels & Rates",
    metaDescription:
      "Gypsum and POP false ceilings in Pune from ₹400/sq ft. Framing at published centres, access panels where the services actually are, and a 5-year warranty on Bespoke.",
    headline: "Level, silent, and serviceable in ten years.",
    definition:
      "Suspended ceilings framed at specified centres, with access where the services above them will one day need reaching.",
    scenarios: [
      { title: "The last ceiling cracked along every joint", body: "Framing centres too wide, or no expansion allowance. Both are specification failures." },
      { title: "There's a leak above the ceiling and no way in", body: "Because nobody planned an access panel. We place them at the valve, not at the corner." },
      { title: "We want cove lighting but not a lower room", body: "A perimeter drop keeps ceiling height in the middle. We draw the section before you decide." },
    ],
    included: [
      "GI framing at published centres with levelling",
      "Gypsum or POP board, jointed, taped and finished",
      "Access panels at every valve, junction and damper",
      "Cut-outs for lights, diffusers and speakers",
      "Two coats of putty ready for paint",
    ],
    excluded: [
      "Paint and final finish",
      "Light fittings and diffusers",
      "Electrical wiring above the ceiling, quoted under Electrical Work",
      "Removal and disposal of an existing ceiling",
    ],
    tiers: [
      { name: "Essential", audience: "A clean, level ceiling in living areas.", specifications: ["GI framing at 600mm centres, levelled to 3mm over 3m", "Gyproc 12.5mm board, single layer", "Access panel at each service valve", "Two coats of putty, sanded", WARRANTY_ESSENTIAL], rateMin: 400, rateMax: 700 },
      { name: "Signature", audience: "Most ceilings. Cove and profile detailing.", specifications: ["GI framing at 450mm centres with perimeter channel", "Gyproc moisture-resistant board in wet areas", "Cove and profile detail with a drawn section", "Hinged access panels, flush and paintable", WARRANTY_SIGNATURE], rateMin: 700, rateMax: 1200, recommended: true },
      { name: "Bespoke", audience: "Acoustic, curved or multi-level ceilings.", specifications: ["Framing at 400mm centres with acoustic isolators", "Double-layer board with staggered joints", "Curved or multi-level detailing from 1:5 drawings", "Acoustic insulation quilt above the board", WARRANTY_BESPOKE], rateMin: 1200, rateMax: 2400 },
    ],
    avoid: [
      { title: "Framing at 900mm centres", consequence: "Visible sag and joint cracks within two years.", rupeeImpact: 70000 },
      { title: "No access panel at the AC drain valve", consequence: "Cutting a hole in a painted ceiling the first time it blocks.", rupeeImpact: 25000 },
      { title: "Standard board in a bathroom", consequence: "A softened, sagging patch above the shower.", rupeeImpact: 40000 },
      { title: "No drawn section before work starts", consequence: "A finished ceiling 100mm lower than anyone expected.", rupeeImpact: 55000 },
    ],
    process: [
      { step: 1, title: "Service survey", body: "We map what runs above before deciding where panels go.", duration: "2 days", paymentPoint: false },
      { step: 2, title: "Drawn section", body: "Heights and details agreed on paper, not on site.", duration: "3 days", paymentPoint: true },
      { step: 3, title: "Framing", body: "GI grid at the specified centres, levelled and checked.", duration: "1 week", paymentPoint: false },
      { step: 4, title: "Boarding and jointing", body: "Board fixed, joints taped and finished.", duration: "1 week", paymentPoint: true },
      { step: 5, title: "Putty and handover", body: "Two putty coats and a panel-location drawing.", duration: "3 days", paymentPoint: true },
    ],
    faqs: [
      { question: "Gypsum or POP?", answer: "Gypsum for flat ceilings — faster, cleaner and more stable. POP for curves and mouldings. We use both and say which where." },
      { question: "How much height will I lose?", answer: "Typically 100 to 150mm, and we draw the section so you see it before agreeing." },
      { question: "Why do the joints crack?", answer: "Framing centres too wide, or no jointing tape. Both are avoidable and both are in our specification." },
      { question: "Where do the access panels go?", answer: "At every valve, junction and damper. We place them by function, not by symmetry." },
      { question: "Can you do it in an occupied flat?", answer: "Yes, room by room. It is dusty during sanding and quiet the rest of the time." },
      { question: "How long for a 1,000 sq ft flat?", answer: "About 3 weeks including putty, excluding paint." },
      { question: "Is it fire safe?", answer: "Gypsum board is non-combustible. Any wiring above it runs in FR conduit." },
      { question: "Can lights be moved later?", answer: "Within a framing bay, yes. Across a bay it needs a patch, which is why the layout is agreed first." },
    ],
    estimatorType: "interiors",
    exampleArea: 900,
  },
];

export const SERVICE_GROUP_CONTENT: Record<
  ServiceGroupKey,
  { label: string; intent: string; statement: string; metaTitle: string; metaDescription: string }
> = {
  build: {
    label: "Build",
    intent: "I have a plot",
    statement:
      "You have land and a budget. What you need is one party who will price the whole thing honestly and then be accountable for it.",
    metaTitle: "Build — House Construction & Turnkey Homes in Pune",
    metaDescription:
      "Two ways to build in Pune: construction only, or construction and interiors on one contract. Published rates from ₹1,500/sq ft and 9 payment milestones.",
  },
  transform: {
    label: "Transform",
    intent: "I have a house that needs work",
    statement:
      "Something is wrong, or tired, or leaking. The fix starts with finding out what is actually behind it.",
    metaTitle: "Transform — Renovation, Waterproofing, Painting & Wiring in Pune",
    metaDescription:
      "Renovation, waterproofing, painting and electrical work in Pune. Phased around occupancy, photographed before closing, with published rates from ₹400/sq ft.",
  },
  finish: {
    label: "Finish",
    intent: "I want it to look beautiful",
    statement:
      "The structure works. Now it needs to look like the people who live in it, and still look right in ten years.",
    metaTitle: "Finish — Interior Design, Kitchens & Ceilings in Pune",
    metaDescription:
      "Interior design, modular kitchens and false ceilings in Pune from ₹400/sq ft. Every material grade and hardware brand named in the contract.",
  },
};

export function getService(slug: string): ServiceContent | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

export function getServicesInGroup(group: ServiceGroupKey): ServiceContent[] {
  return SERVICES.filter((service) => service.group === group).sort(
    (a, b) => a.order - b.order,
  );
}

export const GROUP_KEYS: ServiceGroupKey[] = ["build", "transform", "finish"];

export function isGroupKey(value: string): value is ServiceGroupKey {
  return (GROUP_KEYS as string[]).includes(value);
}

/* FR-SVC-08 / NFR-SEO-03 — FAQPage structured data, generated from the same
 * array the page renders so the two cannot disagree. */
export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
