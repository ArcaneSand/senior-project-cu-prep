/**
 * Competency-Based Judge
 * 
 * Evaluates interview answers based on behavioral competencies:
 * Problem-Solving, Communication, Initiative, and Impact
 */

import { BaseJudge, JudgeEvaluation, EvaluationDimension } from '../BaseJudge';
import { COMPETENCY_RUBRIC, COMPETENCY_STANDARDS } from '../rubrics/CompetencyRubric';
import { generateText } from "ai";
import { geminiModel } from "@/lib/ai.config";

export default class CompetencyJudge extends BaseJudge {
  judgeId = 'competency-gemini-judge';
  judgeName = 'Competency Evaluator';

  private model = geminiModel;

  constructor(_apiKey: string) {
    super();
  }
  
  /**
   * Evaluate an interview answer based on competencies
   */
  async evaluate({
    question,
    answer,
    context
  }: {
    question: string;
    answer: string;
    context?: Record<string, unknown>;
  }): Promise<JudgeEvaluation> {
    try {
      // Build evaluation prompt
      const prompt = this.buildEvaluationPrompt(question, answer);
      
      // Call Gemini API
      console.log('CompetencyJudge: Calling Gemini API...');
      const { text: responseText } = await generateText({
        model: this.model,
        prompt,
      });
      
      console.log('CompetencyJudge: Received response, parsing...');
      
      // Parse response
      const parsed = this.parseResponse(responseText);
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore(parsed.dimensions);
      
      console.log(`CompetencyJudge: Evaluation complete. Score: ${overallScore}/5.0`);
      
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
      console.error('CompetencyJudge evaluation failed:', error);
      throw new Error(`CompetencyJudge evaluation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Build detailed evaluation prompt for Gemini
   */
  private buildEvaluationPrompt(question: string, answer: string): string {
    return `You are an expert interview evaluator specializing in behavioral competency assessment.

EVALUATION RUBRIC:
${JSON.stringify(COMPETENCY_RUBRIC, null, 2)}

REFERENCE EXCELLENT COMPETENCY DEMONSTRATION (score 5.0):
${COMPETENCY_STANDARDS.excellent}

REFERENCE POOR COMPETENCY DEMONSTRATION (score ~1.0):
${COMPETENCY_STANDARDS.poor}

INTERVIEW QUESTION:
${question}

CANDIDATE'S ANSWER:
${answer}

TASK: Evaluate this answer using the Competency rubric above. Focus on SKILLS DEMONSTRATED, not structural format. You MUST:

1. Score each of the 4 competency dimensions (Problem-Solving, Communication, Initiative, Impact) on the 1-5 scale
2. For EACH dimension:
   - Assess what competency level was demonstrated in the answer
   - Provide specific reasoning citing the rubric criteria
   - Extract evidence from the answer showing this competency
   - Focus on WHAT was demonstrated, not HOW it was formatted

3. Identify 2-3 specific STRENGTHS:
   - What competencies were demonstrated well?
   - Quote specific evidence of these competencies
   - Explain why these demonstrate strong skills

4. Provide 2-3 specific, ACTIONABLE improvements:
   - What competencies could be demonstrated better?
   - How to show these competencies more clearly
   - Provide concrete examples

CRITICAL RULES:
- Focus on COMPETENCIES (skills, thinking, impact), NOT structure or format
- Evidence array MUST contain actual quotes showing the competency
- Someone can have poor STAR structure but excellent competencies (or vice versa)
- Do NOT penalize for using "we" if strong problem-solving is evident
- Do NOT give all 5s or all 1s - evaluate each competency independently
- Communication score is about CLARITY of the story, not STAR format compliance

Return ONLY valid JSON in this EXACT format:
{
  "dimensions": [
    {
      "name": "Problem-Solving",
      "score": 5,
      "maxScore": 5,
      "reasoning": "Demonstrated systematic analytical approach with clear root cause identification using profiling tools (New Relic APM). Evidence of data-driven decision making and consideration of multiple solution components.",
      "evidence": ["I profiled the application using New Relic APM", "identified that N+1 database queries were the primary bottleneck"]
    },
    {
      "name": "Communication",
      "score": 4,
      "maxScore": 5,
      "reasoning": "...",
      "evidence": ["..."]
    },
    {
      "name": "Initiative",
      "score": 5,
      "maxScore": 5,
      "reasoning": "...",
      "evidence": ["..."]
    },
    {
      "name": "Impact",
      "score": 5,
      "maxScore": 5,
      "reasoning": "...",
      "evidence": ["..."]
    }
  ],
  "strengths": [
    "Exceptional problem-solving with systematic root cause analysis using profiling tools",
    "Outstanding quantified impact with multiple business metrics (92% improvement, 15% engagement, 85% complaint reduction)"
  ],
  "improvements": [
    "Could strengthen communication by adding more explicit transitions between analysis and solution phases",
    "Could demonstrate even more initiative by describing how you convinced stakeholders of this approach"
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
        throw new Error('Response missing dimensions array');
      }
      
      if (!parsed.strengths || !Array.isArray(parsed.strengths)) {
        throw new Error('Response missing strengths array');
      }
      
      if (!parsed.improvements || !Array.isArray(parsed.improvements)) {
        throw new Error('Response missing improvements array');
      }
      
      // Validate dimensions
      if (parsed.dimensions.length !== 4) {
        throw new Error(`Expected 4 dimensions, got ${parsed.dimensions.length}`);
      }
      
      // Validate each dimension has required fields
      (parsed.dimensions as EvaluationDimension[]).forEach((dim, idx) => {
        if (!dim.name || typeof dim.score !== 'number' || !dim.reasoning || !dim.evidence) {
          throw new Error(`Dimension ${idx} missing required fields`);
        }
      });
      
      return parsed;
      
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Raw response:', response);
      throw new Error(`Failed to parse evaluation response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Calculate overall score as average of dimension scores
   */
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