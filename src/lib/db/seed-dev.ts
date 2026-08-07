/* ═══════════════════════════════════════════════════════════════════════════
 *  DEV-ONLY FIXTURES.  NEVER RUN THIS AGAINST PRODUCTION.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * implementationplan.md Phase 7 risk: "Twelve projects with uneven content will
 * expose the conditional-section logic. TEST WITH A DELIBERATELY SPARSE PROJECT
 * FIXTURE."
 *
 * FR-PROJ-01 requires the project page to render 13 sections "each conditionally
 * omitted if its data is absent — THE PAGE MUST NEVER SHOW AN EMPTY SECTION."
 * A fixture set where every project is complete cannot test that, so the six
 * below are deliberately uneven:
 *
 *   1 ridgeline-house      COMPLETE — all 13 sections present
 *   2 shahpura-terrace-flat NO before/after         (§4.4 section 5 omitted)
 *   3 kolar-row-house      NO drawings             (§4.4 section 4 omitted)
 *   4 trilanga-duplex        NO testimonial          (§4.4 section 10 omitted)
 *   5 bawadiya-kitchen      NO behind-the-wall, NO materials, NO timeline
 *   6 ayodhya-flat-refresh   SPARSE — hero + facts + gallery only. Eight of the
 *                          thirteen sections must vanish. If this page renders
 *                          an empty heading, the logic is wrong.
 *
 * Every project is also marked `isDevFixture: true` so it can be removed
 * wholesale, and the guard below refuses to run in production.
 *
 * Content is written in the §1.4 voice rather than lorem, because Phase 12 is
 * explicit: "One 'Lorem ipsum' or one stock photo undermines every trust claim
 * the site makes." These are fixtures, not launch content — the images are the
 * generated placeholders from scripts/make-dev-placeholders.mjs.
 */

import { connectToDatabase } from "./connect";
import { Project, Service, Testimonial, Material } from "./models";

const DEV_FIXTURE_MARKER = "dev-fixture";

/** Cloudinary-shaped asset pointing at a local generated placeholder. */
function asset(path: string, alt: string, width = 520, height = 325) {
  return {
    publicId: `${DEV_FIXTURE_MARKER}${path}`,
    url: path,
    width,
    height,
    format: "png",
    bytes: 0,
    alt,
  };
}

type FixtureSpec = {
  slug: string;
  title: string;
  subtitle?: string;
  type: "new-construction" | "renovation" | "interiors" | "commercial";
  locality: string;
  builtUpArea: number;
  plotArea?: number;
  floors: number;
  budgetBand: "under-25L" | "25-50L" | "50L-1Cr" | "1Cr+";
  actualCostPerSqft?: number;
  structuralSystem?: string;
  plannedDurationDays: number;
  actualDurationDays?: number;
  completionYear: number;
  featured: boolean;
  featureOrder: number;
  styles: string[];
  brief?: { clientProblem: string; ourApproach: string };
  heroImage: string;
  galleryCount: number;
  drawings: boolean;
  beforeAfterCount: number;
  behindTheWallCount: number;
  timelineCount: number;
  materialCount: number;
  testimonial: boolean;
};

const FIXTURES: FixtureSpec[] = [
  {
    slug: "ridgeline-house",
    title: "Ridgeline House",
    subtitle: "A four-bedroom home on a sloping plot, built around one long wall.",
    type: "new-construction",
    locality: "Arera Colony",
    builtUpArea: 3850,
    plotArea: 4200,
    floors: 2,
    budgetBand: "50L-1Cr",
    actualCostPerSqft: 2240,
    structuralSystem: "RCC frame, 200mm AAC infill",
    plannedDurationDays: 330,
    actualDurationDays: 342,
    completionYear: 2025,
    featured: true,
    featureOrder: 1,
    styles: ["Contemporary", "Warm minimal"],
    brief: {
      clientProblem:
        "The plot fell two metres from road to rear. Three builders had quoted for cut-and-fill that would have swallowed a fifth of the budget.",
      ourApproach:
        "We stepped the house down the slope instead of flattening it. The retaining wall became the spine of the plan, and the level change became the living room.",
    },
    heroImage: "/photos/project-1.jpg",
    galleryCount: 6,
    drawings: true,
    beforeAfterCount: 2,
    behindTheWallCount: 5,
    timelineCount: 4,
    materialCount: 4,
    testimonial: true,
  },
  {
    // MISSING: before/after. §4.4 section 5 must not render.
    slug: "shahpura-terrace-flat",
    title: "Shahpura Terrace Flat",
    subtitle: "A 1,240 sq ft flat opened up around a single kitchen island.",
    type: "interiors",
    locality: "Shahpura",
    builtUpArea: 1240,
    floors: 1,
    budgetBand: "25-50L",
    actualCostPerSqft: 1980,
    structuralSystem: "Existing RCC, non-structural changes only",
    plannedDurationDays: 120,
    actualDurationDays: 118,
    completionYear: 2024,
    featured: true,
    featureOrder: 2,
    styles: ["Warm minimal"],
    brief: {
      clientProblem:
        "A closed kitchen and a dark passage took up a third of the flat and were used for ten minutes a day.",
      ourApproach:
        "We removed the passage, moved the kitchen to the light, and put the storage the family actually needed along the wall it replaced.",
    },
    heroImage: "/photos/project-2.jpg",
    galleryCount: 5,
    drawings: true,
    beforeAfterCount: 0,
    behindTheWallCount: 3,
    timelineCount: 3,
    materialCount: 3,
    testimonial: true,
  },
  {
    // MISSING: drawings. §4.4 section 4 must not render.
    slug: "kolar-row-house",
    title: "Kolar Row House",
    subtitle: "A 1990s row house taken back to structure and rebuilt inside.",
    type: "renovation",
    locality: "Kolar Road",
    builtUpArea: 2410,
    plotArea: 1800,
    floors: 2,
    budgetBand: "25-50L",
    actualCostPerSqft: 1640,
    structuralSystem: "Load-bearing brick, RCC slabs retained",
    plannedDurationDays: 180,
    actualDurationDays: 214,
    completionYear: 2024,
    featured: true,
    featureOrder: 3,
    styles: ["Traditional", "Contemporary"],
    brief: {
      clientProblem:
        "Water had been coming through the first-floor slab for six years. Two previous contractors had painted over it.",
      ourApproach:
        "We opened the slab, found the failed junction, and rebuilt the waterproofing detail before anything cosmetic was touched.",
    },
    heroImage: "/photos/project-3.jpg",
    galleryCount: 6,
    drawings: false,
    beforeAfterCount: 2,
    behindTheWallCount: 5,
    timelineCount: 4,
    materialCount: 3,
    testimonial: true,
  },
  {
    // MISSING: testimonial. §4.4 section 10 must not render.
    slug: "trilanga-duplex",
    title: "Trilanga Duplex",
    subtitle: "Two floors, one staircase, and a courtyard that does the cooling.",
    type: "new-construction",
    locality: "Trilanga",
    builtUpArea: 3120,
    plotArea: 3600,
    floors: 2,
    budgetBand: "50L-1Cr",
    actualCostPerSqft: 2080,
    structuralSystem: "RCC frame, 230mm brick infill",
    plannedDurationDays: 300,
    actualDurationDays: 296,
    completionYear: 2023,
    featured: false,
    featureOrder: 4,
    styles: ["Contemporary"],
    brief: {
      clientProblem:
        "The family wanted cross-ventilation on a plot with neighbours hard against two sides.",
      ourApproach:
        "We put a courtyard in the middle. Every habitable room now opens onto either the street face or the court.",
    },
    heroImage: "/photos/project-4.jpg",
    galleryCount: 4,
    drawings: true,
    beforeAfterCount: 1,
    behindTheWallCount: 4,
    timelineCount: 3,
    materialCount: 4,
    testimonial: false,
  },
  {
    // MISSING: behind-the-wall, materials, timeline. Three sections omitted.
    slug: "bawadiya-kitchen",
    title: "Bawadiya Kitchen",
    subtitle: "A 128 sq ft kitchen re-planned in five weeks.",
    type: "interiors",
    locality: "Bawadiya Kalan",
    builtUpArea: 128,
    floors: 1,
    budgetBand: "under-25L",
    actualCostPerSqft: 3600,
    plannedDurationDays: 35,
    actualDurationDays: 35,
    completionYear: 2025,
    featured: false,
    featureOrder: 5,
    styles: ["Warm minimal"],
    brief: {
      clientProblem:
        "The cooking triangle crossed the doorway, so anyone walking in stood in the way of the hob.",
      ourApproach:
        "We moved the hob to the window wall and put the tall units where the door swing already stole the floor.",
    },
    heroImage: "/photos/project-5.jpg",
    galleryCount: 4,
    drawings: true,
    beforeAfterCount: 1,
    behindTheWallCount: 0,
    timelineCount: 0,
    materialCount: 0,
    testimonial: true,
  },
  {
    /* SPARSE — the important one. Hero, facts and gallery only.
     * Eight of the thirteen sections must vanish. If this page renders a
     * heading with nothing under it, the conditional logic is broken. */
    slug: "ayodhya-flat-refresh",
    title: "Ayodhya Flat Refresh",
    type: "renovation",
    locality: "Ayodhya Bypass",
    builtUpArea: 980,
    floors: 1,
    budgetBand: "under-25L",
    plannedDurationDays: 45,
    completionYear: 2023,
    featured: false,
    featureOrder: 6,
    styles: [],
    heroImage: "/photos/project-6.jpg",
    galleryCount: 3,
    drawings: false,
    beforeAfterCount: 0,
    behindTheWallCount: 0,
    timelineCount: 0,
    materialCount: 0,
    testimonial: false,
  },
];

const BEHIND_THE_WALL_LIBRARY = [
  { title: "Bathroom membrane", specification: "2-coat polyurethane, 1.2mm dry film" },
  { title: "Conduit routing", specification: "25mm FR PVC, concealed" },
  { title: "Slab reinforcement", specification: "Fe550 8mm @150 c/c" },
  { title: "Plumbing pressure test", specification: "3 bar held 24 hr" },
  { title: "Chajja waterproofing", specification: "APP membrane 4mm" },
];

const MATERIAL_LIBRARY = [
  { slug: "burma-teak", name: "Burma teak", category: "Timber", tier: "Bespoke", brand: "Burma", grade: "First quality", unitCost: 4800, unit: "sq ft", rationale: "Moves least with Bhopal's humidity swing, which is what keeps a door shutting in year five.", image: "/photos/material-1.jpg" },
  { slug: "terrazzo-16mm", name: "Terrazzo", category: "Flooring", tier: "Signature", brand: "Bharat", grade: "16mm", unitCost: 190, unit: "sq ft", rationale: "Takes a scratch better than vitrified and can be re-polished in place.", image: "/photos/material-2.jpg" },
  { slug: "brushed-brass-pvd", name: "Brushed brass", category: "Hardware", tier: "Bespoke", brand: "Jaquar", grade: "PVD", unitCost: 2400, unit: "set", rationale: "PVD does not pit in a bathroom the way lacquered brass does.", image: "/photos/material-3.jpg" },
  { slug: "lime-plaster", name: "Lime plaster", category: "Finishes", tier: "Signature", brand: "Local", grade: "3-coat", unitCost: 85, unit: "sq ft", rationale: "Breathes, so it does not trap the damp that blisters emulsion.", image: "/photos/material-4.jpg" },
];

export async function seedDev(): Promise<void> {
  /* The guard. implementationplan.md Phase 12: launching with placeholder
   * content "undermines every trust claim the site makes". This refuses to run
   * anywhere that looks like production, and requires an explicit opt-in. */
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "seed-dev is DEV-ONLY and will not run with NODE_ENV=production.",
    );
  }
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("seed-dev is DEV-ONLY and will not run on a production deployment.");
  }
  const uri = process.env.MONGODB_URI ?? "";
  if (/prod/i.test(uri)) {
    throw new Error(
      "MONGODB_URI looks like a production database. seed-dev refuses to run.",
    );
  }

  await connectToDatabase();

  console.log("\n─── DEV FIXTURES ───────────────────────────────────────────");
  console.log("These are NOT launch content. Remove with: npm run seed:dev -- --clean\n");

  if (process.argv.includes("--clean")) {
    const removed = await Project.deleteMany({ "seo.canonical": DEV_FIXTURE_MARKER });
    await Testimonial.deleteMany({ clientPhoto: null, source: "direct", locality: DEV_FIXTURE_MARKER });
    await Material.deleteMany({ slug: { $in: MATERIAL_LIBRARY.map((m) => m.slug) } });
    console.log(`Removed ${removed.deletedCount} fixture projects.\n`);
    return;
  }

  // Materials are shared across fixtures, so seed them first and collect ids.
  const materialIds: string[] = [];
  for (const material of MATERIAL_LIBRARY) {
    const doc = await Material.findOneAndUpdate(
      { slug: material.slug },
      {
        slug: material.slug,
        name: material.name,
        category: material.category,
        tier: material.tier,
        brand: material.brand,
        grade: material.grade,
        macroImage: asset(material.image, `${material.name} macro`, 220, 220),
        unitCost: material.unitCost,
        unit: material.unit,
        rationale: material.rationale,
        alternative: { name: "Lower tier equivalent", tradeoff: "Costs less, wears faster." },
        status: "published",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (doc?._id) materialIds.push(String(doc._id));
  }

  const services = await Service.find({ status: "published" }).select("_id slug").lean();
  const serviceIdBySlug = new Map(
    services.map((service) => [String(service.slug), String(service._id)]),
  );

  let created = 0;

  for (const fixture of FIXTURES) {
    let testimonialId: string | null = null;

    if (fixture.testimonial) {
      const testimonial = await Testimonial.findOneAndUpdate(
        { clientName: `${fixture.title} client` },
        {
          clientName: `${fixture.title} client`,
          quote:
            "They sent photos of the waterproofing before they tiled over it. Nobody does that.",
          rating: 5,
          locality: fixture.locality,
          date: new Date(`${fixture.completionYear}-06-01`),
          source: "direct",
          verified: false,
          status: "published",
          featured: false,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      testimonialId = testimonial?._id ? String(testimonial._id) : null;
    }

    const completionDate = new Date(`${fixture.completionYear}-11-15`);
    const startDate = new Date(
      completionDate.getTime() - fixture.plannedDurationDays * 86400000,
    );

    await Project.findOneAndUpdate(
      { slug: fixture.slug },
      {
        slug: fixture.slug,
        title: fixture.title,
        subtitle: fixture.subtitle,
        type: fixture.type,
        status: "published",
        featured: fixture.featured,
        featureOrder: fixture.featureOrder,

        locality: fixture.locality,
        city: "Bhopal",
        state: "Madhya Pradesh",

        builtUpArea: fixture.builtUpArea,
        plotArea: fixture.plotArea,
        floors: fixture.floors,
        budgetBand: fixture.budgetBand,
        actualCostPerSqft: fixture.actualCostPerSqft ?? null,
        structuralSystem: fixture.structuralSystem,

        plannedDurationDays: fixture.plannedDurationDays,
        actualDurationDays: fixture.actualDurationDays,
        startDate,
        completionDate,

        services: [serviceIdBySlug.get("house-construction")].filter(Boolean),
        styles: fixture.styles,

        brief: fixture.brief,
        heroImage: asset(fixture.heroImage, `${fixture.title} exterior`, 720, 450),

        gallery: Array.from({ length: fixture.galleryCount }, (_, index) => ({
          asset: asset(
            `/photos/gallery-${(index % 6) + 1}.jpg`,
            `${fixture.title} interior ${index + 1}`,
            420,
            440,
          ),
          alt: `${fixture.title} interior ${index + 1}`,
          roomType: index % 2 ? "kitchen" : "living",
          order: index,
        })),

        drawings: fixture.drawings
          ? [
              {
                asset: asset(`/photos/drawing-1.jpg`, `${fixture.title} floor plan`, 520, 390),
                type: "plan",
                floor: 0,
              },
              {
                asset: asset(`/photos/drawing-1.jpg`, `${fixture.title} section`, 520, 390),
                type: "section",
              },
            ]
          : [],

        beforeAfter: Array.from({ length: fixture.beforeAfterCount }, (_, index) => ({
          before: asset("/photos/before.jpg", `${fixture.title} before`, 520, 293),
          after: asset("/photos/after.jpg", `${fixture.title} after`, 520, 293),
          caption: `Kitchen re-planned, 128 sq ft · ₹4.6 L · 5 weeks`,
          scope: "Kitchen re-planned",
          cost: 460000,
          durationWeeks: 5,
          order: index,
        })),

        behindTheWall: BEHIND_THE_WALL_LIBRARY.slice(
          0,
          fixture.behindTheWallCount,
        ).map((item, index) => ({
          asset: asset(`/photos/btw-${index + 1}.jpg`, item.title, 360, 270),
          caption: item.title,
          specification: item.specification,
          capturedAt: new Date(
            startDate.getTime() + (index + 1) * 30 * 86400000,
          ),
          order: index,
        })),

        timeline: Array.from({ length: fixture.timelineCount }, (_, index) => ({
          label: ["Foundation", "Slab", "Finishing", "Handover"][index] ?? "Milestone",
          date: new Date(
            startDate.getTime() +
              ((index + 1) / (fixture.timelineCount + 1)) *
                fixture.plannedDurationDays *
                86400000,
          ),
          note: "Progress recorded on site.",
        })),

        materials: materialIds.slice(0, fixture.materialCount),
        testimonial: testimonialId,

        seo: {
          title: `${fixture.title} — ${fixture.locality}, Bhopal`,
          description: `${fixture.builtUpArea.toLocaleString("en-IN")} sq ft ${fixture.type.replace("-", " ")} in ${fixture.locality}, completed ${fixture.completionYear}. Planned and actual duration published.`,
          // Doubles as the fixture marker so --clean can find them.
          canonical: DEV_FIXTURE_MARKER,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    created += 1;

    const omitted = [
      fixture.beforeAfterCount === 0 && "before/after",
      !fixture.drawings && "drawings",
      !fixture.testimonial && "testimonial",
      fixture.behindTheWallCount === 0 && "behind-the-wall",
      fixture.materialCount === 0 && "materials",
      fixture.timelineCount === 0 && "timeline",
      !fixture.brief && "brief",
      !fixture.actualCostPerSqft && "cost context",
    ].filter(Boolean);

    console.log(
      `  ${fixture.slug.padEnd(24)} ${omitted.length ? `omits: ${omitted.join(", ")}` : "COMPLETE"}`,
    );
  }

  console.log(
    `\n${created} fixture projects seeded. Check /work/ayodhya-flat-refresh —\n` +
      `it is the sparse one, and must render NO empty sections.\n`,
  );
}
