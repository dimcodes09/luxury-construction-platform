import { EstimatorInput, EstimatorOutput } from "@/lib/schemas/estimate";

export type RateCardData = {
  version: number;
  rates: Record<string, Record<string, { min: number; max: number }>>;
  localityMultipliers: Record<string, number>;
  siteFactors: Record<string, number>;
  addons: Record<string, number>;
  splits: {
    structure: number;
    finishes: number;
    mep: number;
    designPM: number;
    contingency: number;
  };
  commodityRates: {
    steelPerKg: number;
    cementPerBag: number;
    sandPerBrass: number;
    bricksPerThousand: number;
  };
  likelyBias: number;
};

export const DEFAULT_RATE_CARD: RateCardData = {
  version: 20261,
  rates: {
    "house-construction": {
      essential: { min: 1500, max: 1900 },
      signature: { min: 2100, max: 2800 },
      bespoke: { min: 3200, max: 4500 },
    },
    "turnkey-home-solutions": {
      essential: { min: 1900, max: 2400 },
      signature: { min: 2600, max: 3400 },
      bespoke: { min: 3800, max: 5200 },
    },
    "home-renovation": {
      essential: { min: 1200, max: 1600 },
      signature: { min: 1800, max: 2400 },
      bespoke: { min: 2600, max: 3200 },
    },
    "interior-design": {
      essential: { min: 1400, max: 1800 },
      signature: { min: 2200, max: 3200 },
      bespoke: { min: 3600, max: 4800 },
    },
    "modular-kitchen": {
      essential: { min: 1200, max: 1500 },
      signature: { min: 1600, max: 2200 },
      bespoke: { min: 2400, max: 3500 },
    },
    waterproofing: {
      essential: { min: 120, max: 160 },
      signature: { min: 180, max: 240 },
      bespoke: { min: 260, max: 320 },
    },
    painting: {
      essential: { min: 45, max: 70 },
      signature: { min: 85, max: 120 },
      bespoke: { min: 130, max: 160 },
    },
    "electrical-work": {
      essential: { min: 85, max: 120 },
      signature: { min: 135, max: 175 },
      bespoke: { min: 190, max: 220 },
    },
    "false-ceiling": {
      essential: { min: 110, max: 150 },
      signature: { min: 160, max: 210 },
      bespoke: { min: 230, max: 280 },
    },
  },
  localityMultipliers: {
    Baner: 1.08,
    "Koregaon Park": 1.15,
    "Kalyani Nagar": 1.12,
    Wakad: 1.02,
    Kothrud: 1.05,
    "Viman Nagar": 1.08,
    Hinjewadi: 1.00,
    "Pimple Saudagar": 1.00,
    Hadapsar: 0.98,
    Bavdhan: 1.02,
  },
  siteFactors: {
    standard: 1.00,
    "steep-slope": 1.08,
    "narrow-access": 1.05,
    "rocky-strata": 1.06,
  },
  addons: {
    "solar-pv-3kw": 220000,
    "ev-charger-11kw": 45000,
    "smart-automation-basic": 150000,
    "rainwater-harvesting": 65000,
    "elevator-3-stop": 650000,
    "borewell-submersible": 85000,
    "cctv-8-cam": 38000,
  },
  splits: {
    structure: 0.37,
    finishes: 0.33,
    mep: 0.15,
    designPM: 0.08,
    contingency: 0.07,
  },
  commodityRates: {
    steelPerKg: 64,
    cementPerBag: 380,
    sandPerBrass: 4500,
    bricksPerThousand: 8500,
  },
  likelyBias: 0.5,
};

export const DEFAULT_INCLUSIONS = [
  "Turnkey structural framework & brickwork as per approved architectural drawings",
  "Internal plastering & 3-coat elastomeric waterproofing with 10-year warranty",
  "Concealed electrical conduiting (Polycab FR) & CPVC/UPVC plumbing (Astral/Finolex)",
  "Vitrified floor tiling & granite kitchen countertops per selected tier",
  "Dedicated site engineer supervision and 9-stage payment milestone governance",
];

export const DEFAULT_EXCLUSIONS = [
  "Government sanction fees, municipal building permits & MSEB meter connection fees",
  "Loose furniture, electrical appliances, soft furnishings & artwork",
  "Land acquisition costs, external boundary wall & deep garden landscaping",
  "Transformer installation or HT line extension charges if mandated by MSEDCL",
  "Private elevator shaft or specialized swimming pool installations (unless selected as add-ons)",
];

/**
 * Pure-function Rate Engine per SRS §4.9.1.
 * Computes deterministic cost range, splits, inclusions, exclusions, and assumptions.
 */
export function calculateEstimate(
  input: EstimatorInput,
  rateCard: RateCardData = DEFAULT_RATE_CARD,
): EstimatorOutput & { assumptions: Record<string, unknown> } {
  const { projectType, locality, area, floors = 1, tier, addons = [], siteCondition = "standard" } = input;

  // 1. Base Rate per sq ft
  const typeRates = rateCard.rates[projectType] || rateCard.rates["house-construction"];
  const baseRate = typeRates[tier] || typeRates.signature;

  // 2. Locality Multiplier
  const isServedLocality = locality in rateCard.localityMultipliers;
  const regionalMultiplier = isServedLocality ? rateCard.localityMultipliers[locality] : 1.05;
  const logisticsNote = !isServedLocality
    ? `Locality '${locality}' is outside primary Pune core. A 5% logistics multiplier is applied.`
    : undefined;

  // 3. Floors Factor (upper floors adjustment: 1 + (floors - 1) * 0.03)
  const floorFactor = 1 + (Math.max(1, floors) - 1) * 0.03;

  // 4. Site Factor
  const siteFactor = rateCard.siteFactors[siteCondition] || 1.00;

  // 5. Calculate Subtotals
  const combinedMultiplier = regionalMultiplier * floorFactor * siteFactor;
  const subtotalMin = area * baseRate.min * combinedMultiplier;
  const subtotalMax = area * baseRate.max * combinedMultiplier;

  // 6. Addons Total
  const addonsTotal = addons.reduce((sum, key) => sum + (rateCard.addons[key] || 0), 0);

  // 7. Totals & Most Likely
  const totalMin = Math.round(subtotalMin + addonsTotal);
  const totalMax = Math.round(subtotalMax + addonsTotal);
  const mostLikely = Math.round(totalMin + (totalMax - totalMin) * rateCard.likelyBias);
  const perSqft = Math.round(mostLikely / area);

  // 8. Breakdown Splits
  const s = rateCard.splits;
  const breakdown = {
    structure: { min: Math.round(subtotalMin * s.structure), max: Math.round(subtotalMax * s.structure) },
    finishes: { min: Math.round(subtotalMin * s.finishes), max: Math.round(subtotalMax * s.finishes) },
    mep: { min: Math.round(subtotalMin * s.mep), max: Math.round(subtotalMax * s.mep) },
    designPM: { min: Math.round(subtotalMin * s.designPM), max: Math.round(subtotalMax * s.designPM) },
    contingency: { min: Math.round(subtotalMin * s.contingency), max: Math.round(subtotalMax * s.contingency) },
  };

  // 9. Out of Bounds & Confidence
  const outOfBounds = area < 500 || area > 10000;
  let confidence: "high" | "medium" | "low" = "high";
  if (outOfBounds || !isServedLocality) {
    confidence = "medium";
  }
  if (outOfBounds && !isServedLocality) {
    confidence = "low";
  }

  // Comparable projects count
  const comparableProjectCount = confidence === "high" ? 14 : confidence === "medium" ? 6 : 2;

  return {
    min: totalMin,
    max: totalMax,
    mostLikely,
    perSqft,
    breakdown,
    confidence,
    comparableProjectCount,
    inclusions: DEFAULT_INCLUSIONS,
    exclusions: DEFAULT_EXCLUSIONS,
    outOfBounds,
    logisticsNote,
    assumptions: {
      rateCardVersion: rateCard.version,
      regionalMultiplier,
      baseRate,
      floorFactor,
      siteFactor,
      commodityRates: rateCard.commodityRates,
      tier,
      area,
    },
  };
}
