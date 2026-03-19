export interface EvaluationDimension {
  name: string;
  score: number;
  maxScore: number;
  reasoning: string;
  evidence: string[];
}

export interface JudgeEvaluation {
  judgeId: string;
  judgeName: string;
  dimensions: EvaluationDimension[];
  overallScore: number;
  strengths: string[];
  improvements: string[];
  confidence: number;
  timestamp: Date;
}

export abstract class BaseJudge {
  abstract readonly judgeId: string;
  abstract readonly judgeName: string;

  abstract evaluate(params: {
    question: string;
    answer: string;
    context?: Record<string, unknown>;
  }): Promise<JudgeEvaluation>;

  protected calculateOverallScore(dimensions: EvaluationDimension[]): number {
    if (dimensions.length === 0) return 0;
    const total = dimensions.reduce((sum, d) => sum + d.score, 0);
    return total / dimensions.length;
  }
}
