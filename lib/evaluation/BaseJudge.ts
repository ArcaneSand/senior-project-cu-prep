import {
  EvaluationDimension,
  JudgeEvaluation,
  BatchEvaluationInput,
} from '@/types/evaluation';

// Re-export for backward compatibility with existing judge files
export type { EvaluationDimension, JudgeEvaluation };

export abstract class BaseJudge {
  abstract readonly judgeId: string;
  abstract readonly judgeName: string;

  abstract evaluate(params: {
    question: string;
    answer: string;
    context?: Record<string, unknown>;
  }): Promise<JudgeEvaluation>;

  /**
   * Evaluate multiple questions in batch (parallel processing)
   *
   * FLOW:
   * 1. StarJudge.evaluateMultiple([Q1, Q2, Q3]) → parallel
   * 2. CompetencyJudge.evaluateMultiple([Q1, Q2, Q3]) → parallel
   * 3. Aggregator processes results
   */
  async evaluateMultiple(
    questions: BatchEvaluationInput[]
  ): Promise<JudgeEvaluation[]> {
    console.log(
      `[${this.constructor.name}] Evaluating ${questions.length} questions in parallel...`
    );

    const start = Date.now();

    const results = await Promise.all(
      questions.map((q) =>
        this.evaluate({
          question: q.question,
          answer: q.answer,
          context: q.context,
        })
      )
    );

    console.log(
      `[${this.constructor.name}] Batch complete (${Date.now() - start}ms)`
    );
    return results;
  }

  protected calculateOverallScore(dimensions: EvaluationDimension[]): number {
    if (dimensions.length === 0) return 0;
    const total = dimensions.reduce((sum, d) => sum + d.score, 0);
    return Math.round((total / dimensions.length) * 100) / 100;
  }
}
