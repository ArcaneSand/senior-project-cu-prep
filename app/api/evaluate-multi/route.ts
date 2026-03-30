import { NextRequest, NextResponse } from "next/server";
import StarJudge from "@/lib/evaluation/judges/StarJudge";
import CompetencyJudge from "@/lib/evaluation/judges/CompetencyJudge";
import { Aggregator } from "@/lib/evaluation/Aggregator";
import { saveEvaluation } from "@/lib/actions/evaluation.action";

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const body = await req.json();
    const { interviewId, questionId, question, answer, context } = body;

    if (!interviewId || !questionId || !question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields: interviewId, questionId, question, answer" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

    // Run both judges in parallel
    const [starResult, competencyResult] = await Promise.all([
      new StarJudge(apiKey).evaluate({ question, answer, context }),
      new CompetencyJudge(apiKey).evaluate({ question, answer, context }),
    ]);

    // Aggregate statistically (no AI)
    const aggregator = new Aggregator();
    const aggregated = aggregator.aggregate([starResult, competencyResult]);

    // Persist to Firestore
    const evaluationId = await saveEvaluation({
      interviewId,
      questionId,
      question,
      answer,
      judgeEvaluations: aggregated.judgeEvaluations,
      aggregatedScores: aggregated.aggregatedScores,
      synthesizedFeedback: aggregated.synthesizedFeedback,
      confidenceScore: aggregated.confidenceScore,
      createdAt: new Date().toISOString(),
      processingTimeMs: Date.now() - start,
    });

    return NextResponse.json({
      success: true,
      evaluationId,
      preview: {
        score: aggregated.aggregatedScores.overall.mean,
        confidence: aggregated.confidenceScore,
      },
    });
  } catch (error) {
    console.error("evaluate-multi error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evaluation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "evaluate-multi endpoint ready" });
}
