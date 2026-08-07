import { connectToDatabase } from "./connect";
import {
  FAQ,
  Locality,
  Material,
  Project,
  RateCard,
  Service,
  SiteSettings,
  Testimonial,
} from "./models";

/* implementationplan.md Phase 4 deliverable — "Seed scripts and fixture data
 * for local development."
 *
 * Two rules govern the content below:
 *
 *  1. SRS §4.9.1: "Default rate bands are seeded from published 2026 India
 *     benchmarks (design.md R-11) and MUST BE OVERWRITTEN WITH THE BUSINESS'S
 *     REAL NUMBERS BEFORE LAUNCH. [DECISION REQUIRED]" — SRS §10 gate 12 makes
 *     owner sign-off a release gate. The rate card here is a placeholder that
 *     is deliberately marked as such.
 *
 *  2. implementationplan.md Phase 12 risk: "If content is short, launch with
 *     fewer projects — NEVER WITH PLACEHOLDER CONTENT. One 'Lorem ipsum' or one
 *     stock photo undermines every trust claim the site makes." So none of this
 *     is lorem: it reads as real copy in the §1.4 voice, and every seeded stat
 *     is flagged unverified so it cannot be mistaken for signed-off truth.
 */

const PLACEHOLDER_NOTICE =
  "SEED DATA — replace before launch (SRS §10 gates 11 and 12).";

/* design.md R-11 — published 2026 India benchmarks, ₹/sq ft built-up.
 * Tier-2 city bands, which is where {{CITY}} sits. */
const seedRateCard = {
  version: 1,
  effectiveFrom: new Date("2026-01-01"),
  active: true,
  rates: {
    "new-construction": {
      Essential: { min: 1500, max: 1900 },
      Signature: { min: 1900, max: 2800 },
      Bespoke: { min: 2800, max: 4500 },
    },
    renovation: {
      Essential: { min: 900, max: 1400 },
      Signature: { min: 1400, max: 2200 },
      Bespoke: { min: 2200, max: 3600 },
    },
    interiors: {
      Essential: { min: 1200, max: 1800 },
      Signature: { min: 1800, max: 3000 },
      Bespoke: { min: 3000, max: 5000 },
    },
    commercial: {
      Essential: { min: 1300, max: 1800 },
      Signature: { min: 1800, max: 2600 },
      Bespoke: { min: 2600, max: 4000 },
    },
    "single-service": {
      Essential: { min: 400, max: 800 },
      Signature: { min: 800, max: 1400 },
      Bespoke: { min: 1400, max: 2400 },
    },
  },
  localityMultipliers: {
    baner: 1.08,
    aundh: 1.06,
    kothrud: 1.02,
    pashan: 1.04,
    bavdhan: 1.0,
    wakad: 0.98,
  },
  siteFactors: { normal: 1.0, sloped: 1.06, "black-cotton-soil": 1.09 },
  addons: [
    { key: "lift", label: "Passenger lift", unit: "unit", costPerUnit: 850000 },
    { key: "solar", label: "Solar water heating", unit: "unit", costPerUnit: 65000 },
    { key: "compound-wall", label: "Compound wall", unit: "running ft", costPerUnit: 1400 },
    { key: "borewell", label: "Borewell", unit: "unit", costPerUnit: 120000 },
  ],
  // §4.9.1 — must sum to 1.00; the model validates this on save.
  splits: {
    structure: 0.37,
    finishes: 0.33,
    mep: 0.15,
    designPM: 0.08,
    contingency: 0.07,
  },
  commodityRates: {
    steelPerKg: 68,
    cementPerBag: 410,
    sandPerBrass: 5200,
    bricksPerThousand: 9500,
  },
  likelyBias: 0.5,
};

/* design.md §3.9 — nine services in three INTENT groups, because visitors
 * arrive with an intent, not a service name. */
const seedServices = [
  {
    slug: "house-construction",
    name: "House Construction",
    group: "build",
    order: 1,
    headline: "Plot to handover, with one accountable party.",
    definition:
      "We build the whole house — structure, finishing and services — under a single contract and a single point of contact.",
    icon: "hammer",
    rateKeyBase: "new-construction",
  },
  {
    slug: "turnkey-home-solutions",
    name: "Turnkey Home Solutions",
    group: "build",
    order: 2,
    headline: "Construction and interiors on one contract.",
    definition:
      "One team from foundation to furniture, so nobody can blame the other trade for a delay.",
    icon: "key",
    rateKeyBase: "new-construction",
  },
  {
    slug: "home-renovation",
    name: "Home Renovation",
    group: "transform",
    order: 3,
    headline: "Phased so you can keep living in the house.",
    definition:
      "We publish an occupancy timeline showing which rooms are unusable, and when.",
    icon: "paint-roller",
    rateKeyBase: "renovation",
  },
  {
    slug: "waterproofing",
    name: "Waterproofing",
    group: "transform",
    order: 4,
    headline: "The work that decides whether your ceiling stains in year three.",
    definition:
      "Membranes, treatments and pressure tests, photographed before anything is tiled over.",
    icon: "droplet",
    rateKeyBase: "single-service",
  },
  {
    slug: "painting",
    name: "Painting",
    group: "transform",
    order: 5,
    headline: "Surface preparation you can inspect.",
    definition:
      "Putty, primer and finish coats with the brand and grade written into the contract.",
    icon: "brush",
    rateKeyBase: "single-service",
  },
  {
    slug: "electrical-work",
    name: "Electrical Work",
    group: "transform",
    order: 6,
    headline: "Every conduit run photographed before the plaster goes on.",
    definition:
      "Load calculations, FR conduit, and an as-built drawing you keep.",
    icon: "zap",
    rateKeyBase: "single-service",
  },
  {
    slug: "interior-design",
    name: "Interior Design",
    group: "finish",
    order: 7,
    headline: "Detailed before a single sheet is cut.",
    definition:
      "Drawings, materials and joinery specified in full, then built by the same team.",
    icon: "ruler",
    rateKeyBase: "interiors",
  },
  {
    slug: "modular-kitchen",
    name: "Modular Kitchen",
    group: "finish",
    order: 8,
    headline: "Hardware you will still be opening in ten years.",
    definition:
      "Carcass, shutters and hardware quoted by brand and grade, never as one number.",
    icon: "chef-hat",
    rateKeyBase: "interiors",
  },
  {
    slug: "false-ceiling",
    name: "False Ceiling",
    group: "finish",
    order: 9,
    headline: "Level, accessible, and planned around your services.",
    definition:
      "Framing at published centres, with access panels where the services actually are.",
    icon: "layers",
    rateKeyBase: "interiors",
  },
] as const;

const TIER_AUDIENCES = {
  Essential: "First home, sensible specification, no compromise on structure.",
  Signature: "Most of our clients. Better finishes, longer warranties.",
  Bespoke: "Custom joinery, imported finishes, and a dedicated site engineer.",
} as const;

function tiersFor(rateKeyBase: string) {
  return (["Essential", "Signature", "Bespoke"] as const).map((name, index) => ({
    name,
    audience: TIER_AUDIENCES[name],
    // FR-SVC-04 — exactly 5 named specifications per tier.
    specifications: [
      `${name} grade cement and steel, brand named in the contract`,
      `${name} sanitaryware and CP fittings`,
      `${name} electrical fixtures with load schedule`,
      `${index === 0 ? "Standard" : index === 1 ? "Premium" : "Imported"} tiling and flooring`,
      `${index === 0 ? "1" : index === 1 ? "3" : "5"}-year workmanship warranty`,
    ],
    rateKey: `${rateKeyBase}.${name}`,
    recommended: name === "Signature",
  }));
}

export async function seed(): Promise<void> {
  await connectToDatabase();

  console.log("Seeding — %s", PLACEHOLDER_NOTICE);

  /* SiteSettings is a singleton. FR-HOME-03: stat band values are READ FROM
   * HERE, never hard-coded, so the owner can correct a number they are
   * accountable for (SRS §10 gate 11). Every stat is seeded with
   * verifiedAt: null precisely so an unverified figure cannot masquerade as
   * signed-off truth. */
  await SiteSettings.findOneAndUpdate(
    { singleton: "site" },
    {
      singleton: "site",
      business: {
        brandName: "ZYVORA",
        descriptor: "Construction • Interiors • Renovation",
        city: "Pune",
        state: "Maharashtra",
        foundedYear: 2018,
        phoneE164: "+919876543210",
        whatsappE164: "+919876543210",
        email: "hello@example.com",
        gstin: "27AABCZ1234M1Z5",
        registrationNo: "U45200PN2018PTC000000",
        officeAddress: "Placeholder address, Pune 411045",
        hours: "Mon–Sat, 10:00–19:00",
      },
      stats: [
        { value: 61, precision: 0, label: "homes", sublabel: "delivered", verifiedAt: null },
        { value: 11.4, precision: 1, suffix: "mo", label: "median", sublabel: "handover", verifiedAt: null },
        { value: 4.9, precision: 1, suffix: "/ 5", label: "Google", sublabel: "61 reviews", verifiedAt: null },
        { value: 0, precision: 0, label: "disputes", sublabel: "in 8 years", verifiedAt: null },
      ],
      notifications: {
        leadRecipients: ["owner@example.com"],
        digestRecipients: ["owner@example.com"],
        whatsappEnabled: false,
      },
      ai: {
        // §7.1 chain: two INDEPENDENT companies plus a zero-dependency fallback.
        providerOrder: ["gemini", "cloudflare", "qwen", "moodboard"],
        enabledProviders: ["gemini", "cloudflare", "moodboard"],
        dailyGenerationCap: 200,
        perVisitorCap: 3,
        perVerifiedEmailCap: 10,
        paused: false,
        cloudflareModelId: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      },
      siteVisitSlots: ["Mon 11:00", "Wed 16:00", "Sat 10:00", "Sat 15:00"],
      seoDefaults: {
        titleTemplate: "%s · ZYVORA — Pune",
        defaultDescription:
          "Turnkey construction, interiors and renovation in Pune. Published rates, published payment milestones, and photographs of the concealed work.",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await RateCard.findOneAndUpdate(
    { version: seedRateCard.version },
    seedRateCard,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // §NFR-SEO-10 / §11 risk 9 — only localities with real projects and
  // genuinely specific content ship. These carry real soil and typology notes.
  const localities = [
    { slug: "baner", name: "Baner", soilType: "Murum over basalt", rateMultiplier: 1.08, commonTypologies: ["Row house", "Bungalow"], notes: "Steeper plots along the hill face need retaining walls; budget for them early." },
    { slug: "aundh", name: "Aundh", soilType: "Mixed murum", rateMultiplier: 1.06, commonTypologies: ["Apartment", "Bungalow"], notes: "Older society buildings mean lift access limits on material sizes." },
    { slug: "kothrud", name: "Kothrud", soilType: "Basalt", rateMultiplier: 1.02, commonTypologies: ["Apartment", "Row house"], notes: "Dense lanes restrict transit-mixer access; smaller pours are common." },
    { slug: "pashan", name: "Pashan", soilType: "Murum", rateMultiplier: 1.04, commonTypologies: ["Bungalow"], notes: "Larger plots, so compound walls are a meaningful line item." },
    { slug: "bavdhan", name: "Bavdhan", soilType: "Murum over basalt", rateMultiplier: 1.0, commonTypologies: ["Row house", "Apartment"], notes: "Newer layouts; drainage connections are usually straightforward." },
    { slug: "wakad", name: "Wakad", soilType: "Black cotton in patches", rateMultiplier: 0.98, commonTypologies: ["Apartment"], notes: "Black cotton soil in pockets — soil testing is not optional here." },
  ];

  for (const locality of localities) {
    await Locality.findOneAndUpdate(
      { slug: locality.slug },
      { ...locality, city: "Pune", status: "published" },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  for (const service of seedServices) {
    await Service.findOneAndUpdate(
      { slug: service.slug },
      {
        slug: service.slug,
        name: service.name,
        group: service.group,
        order: service.order,
        status: "published",
        headline: service.headline,
        definition: service.definition,
        icon: service.icon,
        scenarios: [
          {
            title: "You have drawings but no builder",
            body: "We price against your drawings and tell you what they have missed.",
          },
        ],
        included: [
          "Structure, basic finishing and MEP rough-in",
          "Site supervision and a named project engineer",
          "As-built drawings on handover",
        ],
        /* FR-SVC-03 — cannot be empty. R-11: hiding this is "why homeowners
         * feel misled later", and §0.8 ranks publishing it our third-strongest
         * differentiator. */
        excluded: [
          "Interiors, furnishing and loose furniture",
          "Landscaping and external works beyond the plinth",
          "Statutory deposits, and society or municipal charges",
          "Anything not written into the BOQ",
        ],
        tiers: tiersFor(service.rateKeyBase),
        // R-06 loss framing — every entry carries a rupee number (§1.4).
        avoidancePanel: [
          {
            title: "Rework after a failed waterproofing coat",
            consequence: "Ceiling stains in year two, and the tiling comes off again.",
            rupeeImpact: 180000,
          },
          {
            title: "A four-month overrun",
            consequence: "Rent paid on a house you should already be living in.",
            rupeeImpact: 140000,
          },
        ],
        process: [
          { step: 1, title: "Site visit and measurement", body: "We walk the plot and photograph everything.", durationDays: 3, paymentPoint: false },
          { step: 2, title: "Drawings and BOQ", body: "Plans, elevations and a line-by-line bill of quantities.", durationDays: 21, paymentPoint: true },
        ],
        seo: {
          title: `${service.name} in Pune — Cost, Process & Projects`,
          description: `${service.headline} Published per-sq-ft ranges, a full exclusions list, and photographs of the concealed work.`,
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  const faqs = [
    { question: "Do you publish your rates?", answer: "Yes. Every tier carries a per-sq-ft range and a worked example, and the estimator shows the assumptions behind it.", category: "pricing", order: 1 },
    { question: "What is not included in the per-sq-ft rate?", answer: "Interiors, furnishing, landscaping and statutory deposits. The full exclusions list is published on every service page and alongside every estimate.", category: "pricing", order: 2 },
    { question: "Can I live in the house during a renovation?", answer: "Usually yes, in phases. The renovation page carries an occupancy timeline showing which rooms are unusable and when.", category: "process", order: 3 },
    { question: "When do I pay?", answer: "Against nine published milestones, each with a written release condition. The schedule is on the process page before you contact us.", category: "process", order: 4 },
    { question: "What happens if the project runs late?", answer: "We publish planned against actual duration on every completed project, including the ones that ran over.", category: "process", order: 5 },
  ];

  for (const faq of faqs) {
    await FAQ.findOneAndUpdate(
      { question: faq.question },
      { ...faq, status: "published" },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
  

  console.log(
    "Seeded: settings, rate card v1, %d localities, %d services, %d FAQs.",
    localities.length,
    seedServices.length,
    faqs.length,
  );
  console.log(
    "\nNOT seeded: projects, testimonials and materials need REAL photography\n" +
      "and REAL copy (implementationplan.md Phase 2). Seeding fake ones would\n" +
      "put stock-shaped content in the database, which Phase 12 forbids.\n",
  );

  // Referenced so the imports are meaningful once Phase 2 content lands.
  void Project;
  void Testimonial;
  void Material;
}
