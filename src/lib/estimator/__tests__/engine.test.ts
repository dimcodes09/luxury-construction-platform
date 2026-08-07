import { calculateEstimate, DEFAULT_RATE_CARD } from "../engine";
import { estimatorInputSchema, estimatorOutputSchema } from "@/lib/schemas/estimate";

/**
 * 40-case test fixture suite for the Rate Engine per SRS §4.9.1.
 */
export function runRateEngineTestSuite() {
  const results: Array<{ id: number; input: string; passed: boolean; error?: string }> = [];

  const testCases = [
    // 1-9: Baseline across 9 project types
    { type: "house-construction", tier: "signature", area: 2400, locality: "Baner" },
    { type: "turnkey-home-solutions", tier: "signature", area: 3000, locality: "Baner" },
    { type: "home-renovation", tier: "essential", area: 1500, locality: "Wakad" },
    { type: "interior-design", tier: "bespoke", area: 2000, locality: "Koregaon Park" },
    { type: "modular-kitchen", tier: "signature", area: 200, locality: "Kothrud" },
    { type: "waterproofing", tier: "essential", area: 800, locality: "Viman Nagar" },
    { type: "painting", tier: "signature", area: 1800, locality: "Baner" },
    { type: "electrical-work", tier: "bespoke", area: 2200, locality: "Kalyani Nagar" },
    { type: "false-ceiling", tier: "signature", area: 1200, locality: "Hinjewadi" },

    // 10-18: Multi-floor tests
    { type: "house-construction", tier: "essential", area: 2000, locality: "Baner", floors: 2 },
    { type: "house-construction", tier: "signature", area: 3500, locality: "Baner", floors: 3 },
    { type: "house-construction", tier: "bespoke", area: 5000, locality: "Baner", floors: 4 },
    { type: "turnkey-home-solutions", tier: "essential", area: 2500, locality: "Kothrud", floors: 2 },
    { type: "turnkey-home-solutions", tier: "signature", area: 4000, locality: "Kalyani Nagar", floors: 3 },
    { type: "home-renovation", tier: "signature", area: 1800, locality: "Hadapsar", floors: 1 },
    { type: "interior-design", tier: "signature", area: 1200, locality: "Bavdhan", floors: 1 },
    { type: "painting", tier: "essential", area: 1500, locality: "Wakad", floors: 1 },
    { type: "false-ceiling", tier: "essential", area: 900, locality: "Pimple Saudagar", floors: 1 },

    // 19-27: Site condition variations
    { type: "house-construction", tier: "signature", area: 2400, locality: "Baner", siteCondition: "steep-slope" },
    { type: "house-construction", tier: "signature", area: 2400, locality: "Baner", siteCondition: "narrow-access" },
    { type: "house-construction", tier: "signature", area: 2400, locality: "Baner", siteCondition: "rocky-strata" },
    { type: "turnkey-home-solutions", tier: "bespoke", area: 3500, locality: "Koregaon Park", siteCondition: "steep-slope" },
    { type: "home-renovation", tier: "signature", area: 1600, locality: "Kothrud", siteCondition: "narrow-access" },
    { type: "waterproofing", tier: "signature", area: 1000, locality: "Viman Nagar", siteCondition: "rocky-strata" },
    { type: "electrical-work", tier: "signature", area: 1500, locality: "Baner", siteCondition: "standard" },
    { type: "modular-kitchen", tier: "bespoke", area: 300, locality: "Kalyani Nagar", siteCondition: "standard" },
    { type: "interior-design", tier: "essential", area: 1000, locality: "Wakad", siteCondition: "standard" },

    // 28-34: Addons tests
    { type: "house-construction", tier: "signature", area: 2800, locality: "Baner", addons: ["solar-pv-3kw"] },
    { type: "house-construction", tier: "signature", area: 2800, locality: "Baner", addons: ["solar-pv-3kw", "ev-charger-11kw"] },
    { type: "house-construction", tier: "bespoke", area: 4500, locality: "Koregaon Park", addons: ["elevator-3-stop", "smart-automation-basic"] },
    { type: "turnkey-home-solutions", tier: "signature", area: 3200, locality: "Kothrud", addons: ["borewell-submersible", "rainwater-harvesting"] },
    { type: "home-renovation", tier: "signature", area: 2000, locality: "Baner", addons: ["cctv-8-cam"] },
    { type: "interior-design", tier: "bespoke", area: 2500, locality: "Kalyani Nagar", addons: ["smart-automation-basic"] },
    { type: "house-construction", tier: "essential", area: 2000, locality: "Hadapsar", addons: ["solar-pv-3kw", "cctv-8-cam"] },

    // 35-40: Out of bounds & unserved locality edge cases
    { type: "house-construction", tier: "signature", area: 300, locality: "Baner" }, // area < 500
    { type: "house-construction", tier: "signature", area: 12000, locality: "Baner" }, // area > 10000
    { type: "house-construction", tier: "signature", area: 2400, locality: "Nashik" }, // Unserved locality
    { type: "turnkey-home-solutions", tier: "signature", area: 15000, locality: "Nagpur" }, // Both out of bounds & unserved
    { type: "home-renovation", tier: "essential", area: 400, locality: "Mumbai" }, // Both out of bounds & unserved
    { type: "interior-design", tier: "bespoke", area: 8000, locality: "Baner" },
  ];

  testCases.forEach((tc, idx) => {
    try {
      const parsedInput = estimatorInputSchema.parse({
        projectType: tc.type,
        tier: tc.tier,
        area: tc.area,
        locality: tc.locality,
        city: "Pune",
        floors: tc.floors || 1,
        siteCondition: tc.siteCondition || "standard",
        addons: tc.addons || [],
      });

      const output = calculateEstimate(parsedInput, DEFAULT_RATE_CARD);

      // Validate schema
      estimatorOutputSchema.parse(output);

      // Validate split math: structure + finishes + mep + designPM + contingency sum
      const s = DEFAULT_RATE_CARD.splits;
      const splitSum = s.structure + s.finishes + s.mep + s.designPM + s.contingency;
      if (Math.abs(splitSum - 1.0) > 0.001) {
        throw new Error(`Splits do not sum to 1.0: ${splitSum}`);
      }

      // Check mostLikely inside [min, max]
      if (output.mostLikely < output.min || output.mostLikely > output.max) {
        throw new Error(`mostLikely (${output.mostLikely}) outside [${output.min}, ${output.max}]`);
      }

      // Check inclusions & exclusions non-empty (FR-EST-04)
      if (output.inclusions.length === 0 || output.exclusions.length === 0) {
        throw new Error("FR-EST-04 violation: inclusions or exclusions empty");
      }

      results.push({ id: idx + 1, input: `${tc.type} (${tc.area} sq ft, ${tc.locality})`, passed: true });
    } catch (err) {
      results.push({
        id: idx + 1,
        input: `${tc.type} (${tc.area} sq ft, ${tc.locality})`,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  return results;
}
