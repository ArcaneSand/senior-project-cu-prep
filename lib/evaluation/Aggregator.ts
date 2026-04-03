/**
 * Aggregator - Combines judge evaluations with AI-powered central rubric scoring
 *
 * FLOW:
 * 1. StarJudge → evaluates all questions
 * 2. CompetencyJudge → evaluates all questions
 * 3. Aggregator → processes everything:
 *    - Parses transcript to extract Q&A
 *    - Scores against central rubric (1-5 scale)
 *    - Synthesizes TOP 3 strengths + improvements
 *    - Calculates statistics
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { formatRubricForPrompt } from './rubrics/CentralRubric';
import { geminiModel } from '@/lib/ai.config';
import {
  CentralRubricScores,
  QuestionEvaluation,
  InterviewContext,
  AggregatedEvaluationResult,
  JudgeEvaluation,
} from '@/types/evaluation';

type GoogleModel = typeof geminiModel;

export class Aggregator {
  /**
   * Aggregate entire interview evaluation
   *
   * @param params - Interview evaluation parameters
   * @param apiKey - Google AI API key for Gemini calls
   * @returns Complete aggregated evaluation
   */
  async aggregateInterview(
    params: {
      fullTranscript: string;
      questions: string[];
      interviewContext: InterviewContext;
      judgeEvaluationsPerQuestion: JudgeEvaluation[][];
      parsedQA?: Array<{ questionId: string; question: string; answer: string }>;
    },
    _apiKey?: string
  ): Promise<AggregatedEvaluationResult> {
    console.log('[Aggregator] Starting interview-level aggregation...');

    const model = geminiModel;

    // Step 1: Parse transcript to extract Q&A pairs (skip if already parsed)
    let parsedQA: Array<{ questionId: string; question: string; answer: string }>;
    if (params.parsedQA) {
      console.log('[Aggregator] Step 1/4: Using pre-parsed Q&A (skipping transcript parse).');
      parsedQA = params.parsedQA;
    } else {
      console.log('[Aggregator] Step 1/4: Parsing transcript with AI...');
      parsedQA = await this.parseTranscript(
        params.fullTranscript,
        params.questions,
        model
      );
    }

    // Step 2: Combine with judge evaluations
    const questionEvaluations: QuestionEvaluation[] = parsedQA.map(
      (qa, idx) => ({
        questionId: qa.questionId,
        question: qa.question,
        answer: qa.answer,
        judgeEvaluations: params.judgeEvaluationsPerQuestion[idx] ?? [],
      })
    );

    // Step 3: Score against central rubric (1-5 scale)
    console.log(
      '[Aggregator] Step 2/4: Scoring against central rubric (1-5 scale)...'
    );
    const centralScores = await this.scoreCentralRubric(
      questionEvaluations,
      params.interviewContext,
      model
    );

    // Step 4: Calculate overall score (mean of 4 dimensions, rounded to nearest 0.5 band)
    const rawScore = this.mean([
      centralScores.coherenceStructure,
      centralScores.fluency,
      centralScores.technical,
      centralScores.softSkill,
    ]);
    const overallScore = Math.round(rawScore * 2) / 2;

    // Canonical judge mean (0-4 scale) — mean of all judges' overallScores
    const allJudgeScores = questionEvaluations
      .flatMap((q) => q.judgeEvaluations)
      .map((j) => j.overallScore);
    const meanScore = allJudgeScores.length > 0
      ? Math.round(this.mean(allJudgeScores) * 100) / 100
      : 0;

    console.log(`[Aggregator] Overall Score: ${overallScore.toFixed(2)}/5.0`);

    // Step 5: Synthesize TOP 3 strengths + improvements (for prominent display)
    console.log(
      '[Aggregator] Step 3/4: Synthesizing top 3 strengths + improvements...'
    );
    const allJudgeEvaluations = questionEvaluations.flatMap(
      (q) => q.judgeEvaluations
    );
    const synthesized = await this.synthesizeWithAI(
      {
        centralScores,
        judgeEvaluations: allJudgeEvaluations,
        questionEvaluations,
      },
      model
    );

    // Step 6: Calculate statistics
    console.log(
      '[Aggregator] Step 4/4: Calculating agreement and confidence...'
    );
    const judgeAgreement = this.calculateJudgeAgreement(allJudgeEvaluations);
    const confidenceScore = this.calculateConfidence(
      allJudgeEvaluations,
      centralScores,
      judgeAgreement.overall
    );

    console.log(
      `[Aggregator] Complete! Overall: ${overallScore.toFixed(2)}/5.0, Confidence: ${(confidenceScore * 100).toFixed(0)}%`
    );

    return {
      questionEvaluations,
      centralRubricScores: centralScores,
      overallScore,
      meanScore,
      strengths: synthesized.strengths,       // Top 3 for prominent display
      improvements: synthesized.improvements, // Top 3 for prominent display
      judgeAgreement,
      confidenceScore,
    };
  }

  /**
   * Parse transcript to extract Q&A pairs using AI
   */
  async parseTranscript(
    fullTranscript: string,
    questions: string[],
    model: GoogleModel = geminiModel
  ): Promise<Array<{ questionId: string; question: string; answer: string }>> {
    const schema = z.object({
      questionAnswers: z.array(
        z.object({
          questionId: z.string(),
          question: z.string(),
          answer: z.string(),
        })
      ),
    });

    const { object } = await generateObject({
      model,
      schema,
      prompt: `
You are parsing a mock interview transcript to extract question-answer pairs.

INTERVIEW QUESTIONS (in order):
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

FULL TRANSCRIPT:
${fullTranscript}

TASK:
Extract the candidate's answer to EACH question from the transcript.
The transcript includes interviewer (assistant/system) and candidate (user) messages.

For each question, combine ALL candidate responses related to that question into a single answer.

Return JSON:
{
  "questionAnswers": [
    {
      "questionId": "question-0",
      "question": "exact question text",
      "answer": "candidate's complete answer"
    }
  ]
}

IMPORTANT:
- questionId format: "question-0", "question-1", etc.
- Include the FULL question text exactly as provided
- Combine multiple candidate turns if answering the same question
- If candidate didn't answer, set answer to "" (empty string)
      `.trim(),
    });

    return object.questionAnswers;
  }

  /**
   * Score interview against central rubric using AI
   * Returns scores on 1-5 scale (what users see first)
   */
  private async scoreCentralRubric(
    questionEvaluations: QuestionEvaluation[],
    context: InterviewContext,
    model: GoogleModel
  ): Promise<CentralRubricScores> {
    const allQA = questionEvaluations
      .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`)
      .join('\n\n');

    const rubricPrompt = formatRubricForPrompt();

    const schema = z.object({
      coherenceStructure: z.number().min(1).max(5),
      fluency: z.number().min(1).max(5),
      technical: z.number().min(1).max(5),
      softSkill: z.number().min(1).max(5),
    });

    const { object } = await generateObject({
      model,
      schema,
      prompt: `
You are evaluating a complete mock interview against a standardized rubric.

INTERVIEW CONTEXT:
- Role: ${context.role}
- Field: ${context.field}
- Experience Level: ${context.stage}

FULL INTERVIEW TRANSCRIPT:
${allQA}

CENTRAL RUBRIC (1-5 scale):
${rubricPrompt}

TASK:
Evaluate the candidate's OVERALL PERFORMANCE across ALL questions on each dimension.
Score each dimension from 1 (lowest) to 5 (highest).

These scores will be shown PROMINENTLY to the user, so be fair and accurate.

Consider patterns across all answers, not just individual responses.

Examples:
- If candidate used STAR structure in 2/3 questions well → Coherence: 4
- If frequent filler words ("um", "uh") throughout → Fluency: 2-3
- If technical answers were detailed and accurate → Technical: 4-5

Return scores for all 4 dimensions on the 1-5 scale.
      `.trim(),
    });

    return object;
  }

  /**
   * Synthesize strengths and improvements via direct merge.
   * Pools all judge strings, deduplicates on exact match (case-insensitive trim),
   * and returns them as-is — no AI call, no keyword analysis.
   */
  private synthesizeWithAI(
    params: {
      centralScores: CentralRubricScores;
      judgeEvaluations: JudgeEvaluation[];
      questionEvaluations: QuestionEvaluation[];
    },
    _model: GoogleModel
  ): Promise<{ strengths: string[]; improvements: string[] }> {
    const seen = new Set<string>();

    const strengths = params.judgeEvaluations
      .flatMap((j) => j.strengths)
      .map((s) => (typeof s === 'string' ? s : JSON.stringify(s)))
      .filter((s) => {
        const key = s.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    seen.clear();

    const improvements = params.judgeEvaluations
      .flatMap((j) => j.improvements)
      .map((s) => (typeof s === 'string' ? s : JSON.stringify(s)))
      .filter((s) => {
        const key = s.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return Promise.resolve({ strengths, improvements });
  }

  /**
   * Calculate judge agreement
   */
  private calculateJudgeAgreement(evaluations: JudgeEvaluation[]): {
    overall: number;
    disagreements: string[];
  } {
    if (evaluations.length < 2) {
      return { overall: 1.0, disagreements: [] };
    }

    const overallScores = evaluations.map((e) => e.overallScore);
    const agreement = this.calculateAgreement(overallScores);

    // Find dimensions with disagreement
    const dimensionGroups: Record<string, number[]> = {};
    evaluations.forEach((evaluation) => {
      evaluation.dimensions.forEach((dim) => {
        if (!dimensionGroups[dim.name]) {
          dimensionGroups[dim.name] = [];
        }
        dimensionGroups[dim.name].push(dim.score);
      });
    });

    const disagreements: string[] = [];
    Object.entries(dimensionGroups).forEach(([name, scores]) => {
      if (this.stdDev(scores) > 1.0) {
        disagreements.push(name);
      }
    });

    return { overall: agreement, disagreements };
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(
    judgeEvaluations: JudgeEvaluation[],
    centralScores: CentralRubricScores,
    judgeAgreement: number
  ): number {
    const avgJudgeConfidence =
      judgeEvaluations.length > 0
        ? this.mean(judgeEvaluations.map((e) => e.confidence))
        : 0.5;

    const centralScoreValues = [
      centralScores.coherenceStructure,
      centralScores.fluency,
      centralScores.technical,
      centralScores.softSkill,
    ];

    const centralConsistency = 1 - this.stdDev(centralScoreValues) / 5;

    const confidence =
      judgeAgreement * 0.5 +
      avgJudgeConfidence * 0.3 +
      centralConsistency * 0.2;

    return Math.round(confidence * 100) / 100;
  }

  private calculateAgreement(scores: number[]): number {
    const stdDev = this.stdDev(scores);
    const agreement = Math.max(0, 1 - stdDev / 2);
    return Math.round(agreement * 100) / 100;
  }

  // ========== Statistical Helper Methods ==========

  private mean(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    return Math.round((sum / numbers.length) * 100) / 100;
  }

  private stdDev(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const avg = this.mean(numbers);
    const squareDiffs = numbers.map((value) => Math.pow(value - avg, 2));
    const avgSquareDiff = this.mean(squareDiffs);
    return Math.round(Math.sqrt(avgSquareDiff) * 100) / 100;
  }

  /**
   * @deprecated Use aggregateInterview() instead. Old 0-100 scoring system has been removed.
   */
  aggregate(_evaluations: JudgeEvaluation[]): never {
    throw new Error(
      'DEPRECATED: Use aggregateInterview() instead. Old 0-100 scoring system has been removed.'
    );
  }
}
