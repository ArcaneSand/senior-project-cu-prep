/**
 * STAR Method Judge
 *
 * Evaluates interview answers using the STAR (Situation, Task, Action, Result)
 * framework with Gemini AI.
 */

import { BaseJudge, JudgeEvaluation, EvaluationDimension } from "../BaseJudge";
import { STAR_RUBRIC, REFERENCE_ANSWERS } from "../rubrics/StarRubric";
import { generateText } from "ai";
import { geminiModel } from "@/lib/ai.config";

export default class StarJudge extends BaseJudge {
  judgeId = "star-gemini-judge";
  judgeName = "STAR Method Evaluator";

  private model = geminiModel;

  constructor(_apiKey: string) {
    super();
  }

  /**
   * Evaluate an interview answer using STAR method
   */
  async evaluate({
    question,
    answer,
    context,
  }: {
    question: string;
    answer: string;
    context?: Record<string, unknown>;
  }): Promise<JudgeEvaluation> {
    try {
      // Build evaluation prompt
      const prompt = this.buildEvaluationPrompt(question, answer);

      // Call Gemini API
      console.log("StarJudge: Calling Gemini API...");
      const { text: responseText } = await generateText({
        model: this.model,
        prompt,
      });

      console.log("StarJudge: Received response, parsing...");

      // Parse response
      const parsed = this.parseResponse(responseText);

      // Calculate overall score
      const overallScore = this.calculateOverallScore(parsed.dimensions);

      console.log(`StarJudge: Evaluation complete. Score: ${overallScore}/5.0`);

      // Return structured evaluation
      return {
        judgeId: this.judgeId,
        judgeName: this.judgeName,
        dimensions: parsed.dimensions,
        overallScore: overallScore,
        strengths: parsed.strengths,
        improvements: parsed.improvements,
        confidence: 0.85,
      };
    } catch (error) {
      console.error("StarJudge evaluation failed:", error);
      throw new Error(
        `StarJudge evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Build detailed evaluation prompt for Gemini
   */
  private buildEvaluationPrompt(question: string, answer: string): string {
    return `You are an expert interview evaluator specializing in the STAR method (Situation, Task, Action, Result).

EVALUATION RUBRIC:
${JSON.stringify(STAR_RUBRIC, null, 2)}

REFERENCE EXCELLENT ANSWER (score 5.0):
${REFERENCE_ANSWERS.excellent}

REFERENCE POOR ANSWER (score ~1.0):
${REFERENCE_ANSWERS.poor}

INTERVIEW QUESTION:
${question}

CANDIDATE'S ANSWER:
${answer}

TASK: Evaluate this answer using the STAR rubric above. You MUST:

1. Score each of the 4 STAR dimensions (Situation, Task, Action, Result) on the 1-5 scale
2. For EACH dimension:
   - Match the answer against the rubric level criteria
   - Provide specific reasoning citing the exact rubric level
   - Extract direct quotes from the candidate's answer as evidence
   - Compare to the reference answers

3. Identify 2-3 specific STRENGTHS:
   - Quote specific parts of the answer
   - Explain why these are strengths according to the rubric

4. Provide 2-3 specific, ACTIONABLE improvements:
   - Point out the exact problem with a quote from the answer
   - Show how to fix it with a concrete example
   - Reference the rubric criteria

CRITICAL RULES:
- Evidence array MUST contain actual quotes from the candidate's answer
- Reasoning MUST reference specific rubric level criteria (e.g., "Matches level 3 criteria: 'Good context with most elements'")
- Improvements MUST show before/after examples
- Do NOT be lenient - score accurately according to rubric
- Do NOT give all 5s or all 1s - evaluate each dimension independently

Return ONLY valid JSON in this EXACT format:
{
  "dimensions": [
    {
      "name": "Situation",
      "score": 3,
      "maxScore": 5,
      "reasoning": "Candidate provided good context about working at TechCorp with API performance issues, matching level 3 criteria ('Good context with most elements'). However, missing specific timeline details would prevent a level 4 score.",
      "evidence": ["I was working as a backend engineer at TechCorp", "our API was experiencing severe performance issues"]
    },
    {
      "name": "Task",
      "score": 5,
      "maxScore": 5,
      "reasoning": "...",
      "evidence": ["..."]
    },
    {
      "name": "Action",
      "score": 2,
      "maxScore": 5,
      "reasoning": "...",
      "evidence": ["..."]
    },
    {
      "name": "Result",
      "score": 5,
      "maxScore": 5,
      "reasoning": "...",
      "evidence": ["..."]
    }
  ],
  "strengths": [
    "Strong quantified results with specific metrics (92% improvement, 15% engagement increase)",
    "Excellent technical depth in actions (New Relic APM, Redis caching, PostgreSQL indexes)"
  ],
  "improvements": [
    "Replace team-focused language: Change 'we decided to implement caching' to 'I designed and implemented Redis caching with 5-minute TTL'",
    "Add more specific timeline: Instead of 'after that', specify 'after 3 days of implementation and testing'"
  ]
}

IMPORTANT: Return ONLY the JSON object, no other text, no markdown code blocks, no preamble.`;
  }

  /**
   * Parse Gemini response and extract structured evaluation
   */
  private parseResponse(response: string): {
    dimensions: EvaluationDimension[];
    strengths: string[];
    improvements: string[];
  } {
    try {
      // Remove markdown code blocks if present
      let jsonStr = response.trim();

      // Try to extract from ```json blocks
      const jsonBlockMatch = jsonStr.match(/```json\s*\n([\s\S]*?)\n```/);
      if (jsonBlockMatch) {
        jsonStr = jsonBlockMatch[1];
      }

      // Try to extract from ``` blocks (without json specifier)
      const codeBlockMatch = jsonStr.match(/```\s*\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }

      // Remove any leading/trailing text before/after JSON
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      // Parse JSON
      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      if (!parsed.dimensions || !Array.isArray(parsed.dimensions)) {
        throw new Error("Response missing dimensions array");
      }

      if (!parsed.strengths || !Array.isArray(parsed.strengths)) {
        throw new Error("Response missing strengths array");
      }

      if (!parsed.improvements || !Array.isArray(parsed.improvements)) {
        throw new Error("Response missing improvements array");
      }

      // Validate dimensions
      if (parsed.dimensions.length !== 4) {
        throw new Error(
          `Expected 4 dimensions, got ${parsed.dimensions.length}`,
        );
      }

      // Validate each dimension has required fields
      (parsed.dimensions as EvaluationDimension[]).forEach((dim, idx) => {
        if (
          !dim.name ||
          typeof dim.score !== "number" ||
          !dim.reasoning ||
          !dim.evidence
        ) {
          throw new Error(`Dimension ${idx} missing required fields`);
        }
      });

      return parsed;
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      console.error("Raw response:", response);
      throw new Error(
        `Failed to parse evaluation response: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  protected calculateOverallScore(dimensions: EvaluationDimension[]): number {
    if (dimensions.length === 0) {
      return 0;
    }
    
    const sum = dimensions.reduce((acc, dim) => acc + dim.score, 0);
    const average = sum / dimensions.length;
    
    // Round to 2 decimal places
    return Math.round(average * 100) / 100;
  }
}
