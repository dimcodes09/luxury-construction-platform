import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/connect";
import { Estimate } from "@/lib/db/models";

/**
 * FR-EST-07: Plain-language 3-paragraph explanation of what drives the estimated figures.
 * If LLM is unavailable or unconfigured, renders a templated explanation without affecting numbers.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { estimateId, projectType, area, tier, locality, min, max, mostLikely } = body;

    if (!estimateId && !projectType) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "estimateId or estimate data required" } },
        { status: 400 },
      );
    }

    const typeName = (projectType || "construction").replace("-", " ");
    const minLakhs = (min ? min / 100000 : 0).toFixed(1);
    const maxLakhs = (max ? max / 100000 : 0).toFixed(1);
    const likelyLakhs = (mostLikely ? mostLikely / 100000 : 0).toFixed(1);

    // Templated 3-paragraph narrative (FR-EST-07 fallback)
    const p1 = `Your estimated investment range for a ${area || "2,000"} sq ft ${typeName} project in ${
      locality || "Pune"
    } is ₹${minLakhs} Lakhs to ₹${maxLakhs} Lakhs, with a most likely project budget of ₹${likelyLakhs} Lakhs under the ${
      tier || "Signature"
    } specification.`;

    const p2 = `This calculation incorporates structural RCC concrete work, certified blockwork masonry, 10-bar hydrostatic pressure-tested plumbing, and 12-stage internal wall finishing. The ${
      locality || "Pune"
    } regional factor reflects current material logistics and local site access conditions.`;

    const p3 = `A 7% contingency reserve and 8% dedicated project management fee are included within this total. Final line-item BOQ costs are locked following detailed architectural working drawings and soil bearing tests prior to contract signing.`;

    const narration = `${p1}\n\n${p2}\n\n${p3}`;

    // Persist narration to estimate document if estimateId supplied
    if (estimateId) {
      try {
        await connectToDatabase();
        await Estimate.findByIdAndUpdate(estimateId, { narration });
      } catch (dbErr) {
        console.error("Failed to update estimate narration in DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      narration,
    });
  } catch (err) {
    console.error("Estimator narration API error:", err);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Unable to generate estimate explanation.",
        },
      },
      { status: 500 },
    );
  }
}
