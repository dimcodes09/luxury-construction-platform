import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/connect";
import { Estimate } from "@/lib/db/models";
import { estimatorInputSchema } from "@/lib/schemas/estimate";
import { calculateEstimate, DEFAULT_RATE_CARD } from "@/lib/estimator/engine";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // FR-EST-16: Rate limit: 20 estimates per IP per hour
    const limitResult = await checkRateLimit("estimates", hashIp(ip));
    if (!limitResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Rate limit exceeded (20 estimates/hour). Please try again later.",
          },
        },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Validate inputs
    const parsed = estimatorInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Invalid estimator input values.",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const normalizedInput = {
      ...input,
      tier: input.tier.toLowerCase() as "essential" | "signature" | "bespoke",
    };

    // Calculate via pure deterministic rate engine (FR-EST-02)
    const result = calculateEstimate(normalizedInput, DEFAULT_RATE_CARD);

    await connectToDatabase();

    const sessionId = body.sessionId || "anon-" + Math.random().toString(36).substring(2, 9);
    const completed = body.step === 5 || body.completed === true;
    const abandonedAtStep = !completed ? Number(body.step || 1) : null;

    // FR-EST-10: Persist every estimate run, including abandoned runs with step reached
    const estimateDoc = await Estimate.create({
      sessionId,
      inputs: {
        projectType: input.projectType,
        locality: input.locality,
        city: input.city,
        area: input.area,
        floors: input.floors,
        tier: input.tier,
        addons: input.addons,
      },
      outputs: {
        min: result.min,
        max: result.max,
        mostLikely: result.mostLikely,
        perSqft: result.perSqft,
        breakdown: result.breakdown,
        confidence: result.confidence,
        comparableProjectCount: result.comparableProjectCount,
      },
      assumptions: result.assumptions,
      completed,
      abandonedAtStep,
      ipHash: hashIp(ip),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      estimateId: estimateDoc._id.toString(),
      output: {
        min: result.min,
        max: result.max,
        mostLikely: result.mostLikely,
        perSqft: result.perSqft,
        breakdown: result.breakdown,
        confidence: result.confidence,
        comparableProjectCount: result.comparableProjectCount,
        inclusions: result.inclusions,
        exclusions: result.exclusions,
        outOfBounds: result.outOfBounds,
        logisticsNote: result.logisticsNote,
      },
      assumptions: result.assumptions,
    });
  } catch (err) {
    console.error("Estimator API error:", err);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Unable to compute cost estimate. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}
