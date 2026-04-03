/**
 * Evaluation Type Definitions
 * Central Rubric uses 1-5 scale (what users see prominently)
 * Judges use 0-4 internally (fine)
 */

// ============================================================
// Judge-level types (moved here from BaseJudge.ts)
// ============================================================

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
}

// ============================================================
// Central Rubric Scores (1-5 scale — what users see first)
// ============================================================

export interface CentralRubricScores {
  coherenceStructure: number; // 1-5
  fluency: number;             // 1-5
  technical: number;           // 1-5
  softSkill: number;           // 1-5
}

// ============================================================
// Interview context for evaluation
// ============================================================

export interface InterviewContext {
  role: string;
  field: string;
  stage: 'student' | 'freshgrad' | 'experienced';
}

// ============================================================
// Question-level evaluation with judge feedback
// ============================================================

export interface QuestionEvaluation {
  questionId: string;
  question: string;
  answer: string;
  judgeEvaluations: JudgeEvaluation[];
}

// ============================================================
// Aggregated result (output of Aggregator)
// ============================================================

export interface AggregatedEvaluationResult {
  questionEvaluations: QuestionEvaluation[];
  centralRubricScores: CentralRubricScores;
  overallScore: number;    // 1-5 scale (central rubric mean)
  meanScore: number;       // mean of judges' overallScores (0-4 scale)
  strengths: string[];     // Top 3 from Aggregator
  improvements: string[];  // Top 3 from Aggregator
  judgeAgreement: {
    overall: number;
    disagreements: string[];
  };
  confidenceScore: number;
}

// ============================================================
// Stored in Firestore `evaluations` collection
// ============================================================

export interface StoredEvaluation {
  id: string;
  interviewId: string;
  userId: string;
  questions: QuestionEvaluation[];
  centralRubricScores: CentralRubricScores;
  overallScore: number;    // 1-5 scale (what users see first)
  meanScore: number;       // mean of judges' overallScores (0-4 scale)
  strengths: string[];     // Top 3 (shown prominently)
  improvements: string[];  // Top 3 (shown prominently)
  judgeAgreement: {
    overall: number;
    disagreements: string[];
  };
  confidenceScore: number;
  createdAt: string;
  processingTimeMs: number;
}

// ============================================================
// Input for batch judge evaluation
// ============================================================

export interface BatchEvaluationInput {
  questionId: string;
  question: string;
  answer: string;
  context?: Record<string, unknown>;
}
