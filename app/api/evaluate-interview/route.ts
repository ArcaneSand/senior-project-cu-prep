import { NextRequest, NextResponse } from "next/server";
import StarJudge from "@/lib/evaluation/judges/StarJudge";
import CompetencyJudge from "@/lib/evaluation/judges/CompetencyJudge";
import { Aggregator } from "@/lib/evaluation/Aggregator";
import { db } from "@/firebase/admin";
import { InterviewContext, BatchEvaluationInput } from "@/types/evaluation";

interface EvaluateInterviewRequest {
  interviewId: string;
  userId: string;
  fullTranscript: string;
  questions: string[];
  interviewContext: InterviewContext;
}

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const body: EvaluateInterviewRequest = await req.json();
    const {
      interviewId,
      userId,
      fullTranscript,
      questions,
      interviewContext,
    } = body;

    // Validate required fields
    if (!interviewId || !fullTranscript || !questions || questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: interviewId, fullTranscript, questions",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error(
        "[evaluate-interview] GOOGLE_GENERATIVE_AI_API_KEY not found"
      );
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    console.log(
      `[evaluate-interview] Starting evaluation for ${interviewId}`
    );
    console.log(
      `[evaluate-interview] Questions: ${questions.length}, Transcript: ${fullTranscript.length} chars`
    );

    // ========== FLOW: Parse Transcript → StarJudge + CompetencyJudge (parallel) → Aggregator ==========

    const aggregator = new Aggregator();
    const ctx = interviewContext ?? { role: "Candidate", field: "General", stage: "experienced" as const };

    // STEP 1: Parse transcript to extract real Q&A pairs
    console.log("[evaluate-interview] Step 1/3: Parsing transcript...");
    const parseStart = Date.now();
    const parsedQA = await aggregator.parseTranscript(fullTranscript, questions);
    console.log(`[evaluate-interview] Transcript parsed (${Date.now() - parseStart}ms)`);

    // Build question inputs with real answers for judges
    const questionInputs: BatchEvaluationInput[] = parsedQA.map((qa) => ({
      questionId: qa.questionId,
      question: qa.question,
      answer: qa.answer,
      context: ctx as unknown as Record<string, unknown>,
    }));

    // STEPS 2: Both judges evaluate real answers in parallel
    console.log(
      "[evaluate-interview] Step 2/3: StarJudge + CompetencyJudge running in parallel..."
    );
    const judgesStart = Date.now();
    const [starEvaluations, competencyEvaluations] = await Promise.all([
      new StarJudge(apiKey).evaluateMultiple(questionInputs),
      new CompetencyJudge(apiKey).evaluateMultiple(questionInputs),
    ]);
    console.log(
      `[evaluate-interview] Both judges complete (${Date.now() - judgesStart}ms)`
    );

    // Combine judge evaluations per question
    const judgeEvaluationsPerQuestion = parsedQA.map((_, idx) => [
      starEvaluations[idx],
      competencyEvaluations[idx],
    ]);

    // STEP 3: Aggregator scores rubric + synthesizes (skips re-parsing since parsedQA is passed)
    console.log("[evaluate-interview] Step 3/3: Aggregator processing...");
    const aggStart = Date.now();
    const aggregated = await aggregator.aggregateInterview({
      fullTranscript,
      questions,
      interviewContext: ctx,
      judgeEvaluationsPerQuestion,
      parsedQA,
    });
    console.log(
      `[evaluate-interview] Aggregator complete (${Date.now() - aggStart}ms)`
    );

    // Build final evaluation document
    const evaluation = {
      interviewId,
      userId,
      questions: aggregated.questionEvaluations,
      centralRubricScores: aggregated.centralRubricScores, // 1-5 scale
      overallScore: aggregated.overallScore,               // 1-5 scale (shown first)
      meanScore: aggregated.meanScore,                     // mean of judges' overallScores (0-4)
      strengths: aggregated.strengths,                     // Top 3 (shown prominently)
      improvements: aggregated.improvements,               // Top 3 (shown prominently)
      judgeAgreement: aggregated.judgeAgreement,
      confidenceScore: aggregated.confidenceScore,
      createdAt: new Date().toISOString(),
      processingTimeMs: Date.now() - start,
    };

    // Save to Firestore directly (bypasses "use server" serialization)
    const ref = await db.collection("evaluations").add(evaluation);
    const evaluationId = ref.id;

    console.log(
      `[evaluate-interview] ✅ Success! Evaluation ${evaluationId}`
    );
    console.log(
      `[evaluate-interview] Overall Score: ${aggregated.overallScore.toFixed(2)}/5.0`
    );
    console.log(
      `[evaluate-interview] Total time: ${Date.now() - start}ms`
    );

    return NextResponse.json({
      success: true,
      evaluationId,
      preview: {
        overallScore: aggregated.overallScore, // 1-5 scale
        meanScore: aggregated.meanScore,       // 0-4 scale (judge mean)
        confidence: aggregated.confidenceScore,
        questionCount: questions.length,
      },
    });
  } catch (error) {
    console.error("[evaluate-interview] ❌ Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Evaluation failed",
        details:
          error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "evaluate-interview endpoint ready",
    version: "2.0",
    flow: "StarJudge → CompetencyJudge → Aggregator",
    scoring: "1-5 scale (central rubric)",
  });
}
