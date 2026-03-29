import { JudgeEvaluation } from "@/lib/evaluation/BaseJudge";
import { AggregatedEvaluation } from "@/lib/evaluation/Aggregator";

export interface StoredEvaluation {
  id: string;
  interviewId: string;
  questionId: string;
  question: string;
  answer: string;
  judgeEvaluations: JudgeEvaluation[];
  aggregatedScores: AggregatedEvaluation["aggregatedScores"];
  synthesizedFeedback: AggregatedEvaluation["synthesizedFeedback"];
  confidenceScore: number;
  createdAt: string;
  processingTimeMs: number;
}
