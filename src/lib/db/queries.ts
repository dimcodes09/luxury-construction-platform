import { connectToDatabase } from "./connect";
import { Project, SiteSettings, Testimonial } from "./models";
import type { BUDGET_BANDS, PROJECT_TYPES } from "./common";

/* Read models for the public site.
 *
 * Everything here returns PLAIN OBJECTS via .lean(), not Mongoose documents.
 * A hydrated document cannot cross the Server Component boundary — it carries
 * methods and circular refs — and serialising one per render is wasted work on
 * a page that is mostly static anyway (NFR-PERF-08: ISR at 3600s).
 *
 * ObjectIds and Dates are converted at the edge, so page code never has to
 * think about BSON.
 */

export type ProjectSummary = {
  slug: string;
  title: string;
  subtitle?: string;
  type: (typeof PROJECT_TYPES)[number];
  locality: string;
  builtUpArea: number;
  budgetBand: (typeof BUDGET_BANDS)[number];
  completionYear: number;
  featured: boolean;
  featureOrder: number;
  styles: string[];
  heroImage: { url: string; alt: string; width: number; height: number };
  /** Derived: the scope line on a ProjectCard, e.g. "Construction + Interiors". */
  scope: string;
};

export type ProjectDetail = ProjectSummary & {
  plotArea?: number;
  floors: number;
  actualCostPerSqft: number | null;
  structuralSystem?: string;
  plannedDurationDays: number;
  actualDurationDays?: number;
  startDate?: string;
  completionDate?: string;
  brief?: { clientProblem: string; ourApproach: string };
  gallery: { url: string; alt: string; roomType?: string; caption?: string }[];
  drawings: { url: string; alt: string; type: string; floor?: number }[];
  beforeAfter: {
    before: { url: string; alt: string };
    after: { url: string; alt: string };
    caption: string;
    scope: string;
    cost: number;
    durationWeeks: number;
  }[];
  behindTheWall: {
    url: string;
    alt: string;
    caption: string;
    specification: string;
    capturedAt: string;
  }[];
  timeline: { label: string; date: string; note?: string }[];
  materials: {
    slug: string;
    name: string;
    brand: string;
    grade: string;
    macroImage: { url: string; alt: string };
  }[];
  testimonial: {
    clientName: string;
    quote: string;
    rating: number;
    locality?: string;
    date: string;
    verified: boolean;
    sourceUrl?: string;
  } | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose .lean() returns
 * loosely-typed documents; these mappers are the single place where that
 * looseness is converted into the exact types above, so the `any` stops here
 * rather than leaking into page code. */

type LeanDoc = Record<string, any>;

const SCOPE_BY_TYPE: Record<string, string> = {
  "new-construction": "Construction",
  renovation: "Renovation",
  interiors: "Interiors",
  commercial: "Commercial",
  "single-service": "Single service",
};

function mapAsset(asset: LeanDoc | undefined | null, fallbackAlt = "") {
  if (!asset) return null;
  return {
    url: String(asset.url ?? ""),
    alt: String(asset.alt || fallbackAlt),
    width: Number(asset.width ?? 0),
    height: Number(asset.height ?? 0),
  };
}

function toSummary(doc: LeanDoc): ProjectSummary {
  const hero = mapAsset(doc.heroImage, doc.title) ?? {
    url: "",
    alt: String(doc.title ?? ""),
    width: 0,
    height: 0,
  };

  return {
    slug: String(doc.slug),
    title: String(doc.title),
    subtitle: doc.subtitle ? String(doc.subtitle) : undefined,
    type: doc.type,
    locality: String(doc.locality),
    builtUpArea: Number(doc.builtUpArea ?? 0),
    budgetBand: doc.budgetBand,
    completionYear: doc.completionDate
      ? new Date(doc.completionDate).getFullYear()
      : 0,
    featured: Boolean(doc.featured),
    featureOrder: Number(doc.featureOrder ?? 0),
    styles: Array.isArray(doc.styles) ? doc.styles.map(String) : [],
    heroImage: hero,
    scope: SCOPE_BY_TYPE[String(doc.type)] ?? "Project",
  };
}

/** FR-HOME-04 — 6 projects flagged `featured`, ordered by `featureOrder`. */
export async function getFeaturedProjects(limit = 6): Promise<ProjectSummary[]> {
  await connectToDatabase();
  const docs = await Project.find({ status: "published", deletedAt: null })
    .sort({ featured: -1, featureOrder: 1 })
    .limit(limit)
    .lean();
  return docs.map(toSummary);
}

export type WorkFilters = {
  type?: string;
  locality?: string;
  budget?: string;
  year?: string;
  style?: string;
};

/* FR-PORT-01 / FR-PORT-02 — filters are URL state and the page is fully
 * server-rendered for ANY combination. Building the Mongo filter from a
 * validated allow-list rather than spreading the query object is what keeps
 * NFR-SEC-10 true: no user input ever reaches an operator position. */
export async function getProjects(
  filters: WorkFilters,
  options: { limit?: number; skip?: number } = {},
): Promise<{ projects: ProjectSummary[]; total: number }> {
  await connectToDatabase();

  const query: Record<string, unknown> = {
    status: "published",
    deletedAt: null,
  };

  if (filters.type && filters.type !== "all") query.type = filters.type;
  if (filters.locality) query.locality = filters.locality;
  if (filters.budget) query.budgetBand = filters.budget;
  if (filters.style) query.styles = filters.style;

  if (filters.year) {
    const year = Number(filters.year);
    if (Number.isFinite(year)) {
      query.completionDate = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`),
      };
    }
  }

  const limit = options.limit ?? 12;
  const skip = options.skip ?? 0;

  const [docs, total] = await Promise.all([
    Project.find(query)
      .sort({ completionDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(query),
  ]);

  return { projects: docs.map(toSummary), total };
}

/** The distinct values that actually exist, so a filter never offers zero results. */
export async function getFilterOptions(): Promise<{
  localities: string[];
  years: number[];
  styles: string[];
}> {
  await connectToDatabase();
  const base = { status: "published", deletedAt: null };

  const [localities, dates, styles] = await Promise.all([
    Project.distinct("locality", base),
    Project.distinct("completionDate", base),
    Project.distinct("styles", base),
  ]);

  return {
    localities: (localities as string[]).filter(Boolean).sort(),
    years: Array.from(
      new Set(
        (dates as Date[])
          .filter(Boolean)
          .map((date) => new Date(date).getFullYear()),
      ),
    ).sort((a, b) => b - a),
    styles: (styles as string[]).filter(Boolean).sort(),
  };
}

export async function getProjectSlugs(): Promise<string[]> {
  await connectToDatabase();
  const docs = await Project.find({ status: "published", deletedAt: null })
    .select("slug")
    .lean();
  return docs.map((doc) => String(doc.slug));
}

/* FR-PROJ-01 — the detail query populates materials and testimonial so the page
 * can decide, per section, whether there is anything to render. Absent data
 * arrives as an empty array or null, never as a partially-populated ref. */
export async function getProject(slug: string): Promise<ProjectDetail | null> {
  await connectToDatabase();

  const doc = (await Project.findOne({
    slug,
    status: "published",
    deletedAt: null,
  })
    .populate("materials", "slug name brand grade macroImage")
    .populate("testimonial", "clientName quote rating locality date verified sourceUrl")
    .lean()) as LeanDoc | null;

  if (!doc) return null;

  const summary = toSummary(doc);

  return {
    ...summary,
    plotArea: doc.plotArea ? Number(doc.plotArea) : undefined,
    floors: Number(doc.floors ?? 1),
    actualCostPerSqft: doc.actualCostPerSqft ?? null,
    structuralSystem: doc.structuralSystem ? String(doc.structuralSystem) : undefined,
    plannedDurationDays: Number(doc.plannedDurationDays ?? 0),
    actualDurationDays: doc.actualDurationDays
      ? Number(doc.actualDurationDays)
      : undefined,
    startDate: doc.startDate ? new Date(doc.startDate).toISOString() : undefined,
    completionDate: doc.completionDate
      ? new Date(doc.completionDate).toISOString()
      : undefined,

    /* The brief only counts as present when BOTH halves exist — a heading with
     * one empty column is exactly the "empty section" FR-PROJ-01 forbids. */
    brief:
      doc.brief?.clientProblem && doc.brief?.ourApproach
        ? {
            clientProblem: String(doc.brief.clientProblem),
            ourApproach: String(doc.brief.ourApproach),
          }
        : undefined,

    gallery: (doc.gallery ?? []).map((item: LeanDoc) => ({
      url: String(item.asset?.url ?? ""),
      alt: String(item.alt ?? item.asset?.alt ?? ""),
      roomType: item.roomType ? String(item.roomType) : undefined,
      caption: item.caption ? String(item.caption) : undefined,
    })),

    drawings: (doc.drawings ?? []).map((item: LeanDoc) => ({
      url: String(item.asset?.url ?? ""),
      alt: String(item.asset?.alt ?? ""),
      type: String(item.type ?? "plan"),
      floor: item.floor ?? undefined,
    })),

    beforeAfter: (doc.beforeAfter ?? []).map((pair: LeanDoc) => ({
      before: mapAsset(pair.before) ?? { url: "", alt: "", width: 0, height: 0 },
      after: mapAsset(pair.after) ?? { url: "", alt: "", width: 0, height: 0 },
      caption: String(pair.caption ?? ""),
      scope: String(pair.scope ?? ""),
      cost: Number(pair.cost ?? 0),
      durationWeeks: Number(pair.durationWeeks ?? 0),
    })),

    behindTheWall: (doc.behindTheWall ?? []).map((item: LeanDoc) => ({
      url: String(item.asset?.url ?? ""),
      alt: String(item.asset?.alt ?? item.caption ?? ""),
      caption: String(item.caption ?? ""),
      specification: String(item.specification ?? ""),
      capturedAt: item.capturedAt
        ? new Date(item.capturedAt).toISOString()
        : "",
    })),

    timeline: (doc.timeline ?? []).map((item: LeanDoc) => ({
      label: String(item.label ?? ""),
      date: item.date ? new Date(item.date).toISOString() : "",
      note: item.note ? String(item.note) : undefined,
    })),

    materials: (doc.materials ?? []).map((material: LeanDoc) => ({
      slug: String(material.slug ?? ""),
      name: String(material.name ?? ""),
      brand: String(material.brand ?? ""),
      grade: String(material.grade ?? ""),
      macroImage: mapAsset(material.macroImage, material.name) ?? {
        url: "",
        alt: "",
        width: 0,
        height: 0,
      },
    })),

    testimonial: doc.testimonial
      ? {
          clientName: String(doc.testimonial.clientName ?? ""),
          quote: String(doc.testimonial.quote ?? ""),
          rating: Number(doc.testimonial.rating ?? 5),
          locality: doc.testimonial.locality
            ? String(doc.testimonial.locality)
            : undefined,
          date: doc.testimonial.date
            ? new Date(doc.testimonial.date).toISOString()
            : "",
          verified: Boolean(doc.testimonial.verified),
          sourceUrl: doc.testimonial.sourceUrl
            ? String(doc.testimonial.sourceUrl)
            : undefined,
        }
      : null,
  };
}

/* FR-PROJ-09 — related projects matched by type, then area band, then locality;
 * minimum 3, and NEVER showing the current project. */
export async function getRelatedProjects(
  project: ProjectSummary,
  limit = 3,
): Promise<ProjectSummary[]> {
  await connectToDatabase();
  const base = { status: "published", deletedAt: null, slug: { $ne: project.slug } };

  const byType = await Project.find({ ...base, type: project.type })
    .sort({ completionDate: -1 })
    .limit(limit)
    .lean();

  if (byType.length >= limit) return byType.map(toSummary);

  // Top up with anything else recent, so the module is never short or empty.
  const seen = new Set(byType.map((doc) => String(doc.slug)));
  const filler = await Project.find({
    ...base,
    slug: { $nin: [project.slug, ...seen] },
  })
    .sort({ completionDate: -1 })
    .limit(limit - byType.length)
    .lean();

  return [...byType, ...filler].map(toSummary);
}

export type SiteSettingsView = {
  brandName: string;
  city: string;
  foundedYear: number;
  phoneE164: string;
  whatsappE164: string;
  stats: {
    value: number;
    precision: number;
    suffix?: string;
    label: string;
    sublabel?: string;
  }[];
};

/* FR-HOME-03 — "Stat band values are READ FROM SITESETTINGS, NOT HARD-CODED."
 * SRS §10 gate 11 makes the owner accountable for each figure being true, and a
 * hard-coded stat cannot be corrected by the person who signed for it. */
export async function getSiteSettings(): Promise<SiteSettingsView | null> {
  await connectToDatabase();
  const doc = (await SiteSettings.findOne({ singleton: "site" }).lean()) as LeanDoc | null;
  if (!doc) return null;

  return {
    brandName: String(doc.business?.brandName ?? "ZYVORA"),
    city: String(doc.business?.city ?? ""),
    foundedYear: Number(doc.business?.foundedYear ?? 0),
    phoneE164: String(doc.business?.phoneE164 ?? ""),
    whatsappE164: String(doc.business?.whatsappE164 ?? ""),
    stats: (doc.stats ?? []).map((stat: LeanDoc) => ({
      value: Number(stat.value ?? 0),
      precision: Number(stat.precision ?? 0),
      suffix: stat.suffix ? String(stat.suffix) : undefined,
      label: String(stat.label ?? ""),
      sublabel: stat.sublabel ? String(stat.sublabel) : undefined,
    })),
  };
}

export type TestimonialView = {
  clientName: string;
  quote: string;
  rating: number;
  locality?: string;
  date: string;
  verified: boolean;
  sourceUrl?: string;
  projectTitle?: string;
  projectHref?: string;
};

export async function getFeaturedTestimonials(limit = 2): Promise<TestimonialView[]> {
  await connectToDatabase();
  const docs = (await Testimonial.find({ status: "published", deletedAt: null })
    .sort({ featured: -1, order: 1, date: -1 })
    .limit(limit)
    .populate("project", "title slug")
    .lean()) as LeanDoc[];

  return docs.map((doc) => ({
    clientName: String(doc.clientName ?? ""),
    quote: String(doc.quote ?? ""),
    rating: Number(doc.rating ?? 5),
    locality: doc.locality ? String(doc.locality) : undefined,
    date: doc.date ? new Date(doc.date).toISOString() : "",
    verified: Boolean(doc.verified),
    sourceUrl: doc.sourceUrl ? String(doc.sourceUrl) : undefined,
    projectTitle: doc.project?.title ? String(doc.project.title) : undefined,
    projectHref: doc.project?.slug ? `/work/${doc.project.slug}` : undefined,
  }));
}

/** Total published projects — S04's "Six of sixty-one" and /work's result count. */
export async function getProjectCount(): Promise<number> {
  await connectToDatabase();
  return Project.countDocuments({ status: "published", deletedAt: null });
}
