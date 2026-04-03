/**
 * Central Rubric - Standardized Interview Evaluation
 * Scale: 1 (Lowest) to 5 (Highest/Excellent)
 *
 * This is what users see FIRST in their feedback.
 */

export interface RubricDimension {
  name: string;
  description: string;
  scale: {
    5: string;
    4: string;
    3: string;
    2: string;
    1: string;
  };
}

export const CentralRubric: { dimensions: RubricDimension[] } = {
  dimensions: [
    {
      name: "Coherence Structure",
      description: "Logical flow, STAR/SAR structure, storytelling quality",
      scale: {
        5: "Clear, concise answer to all aspects. Perfect logical flow with STAR structure (Introduction, Detail, Summarization).",
        4: "Clear answers to most aspects with generally good organization. Behavioral questions mostly structured with partial STAR/SAR.",
        3: "Answers main question but some aspects missing. Some logical structure present but inconsistent. Limited use of STAR/SAR.",
        2: "Partially relevant but fragmented or inconsistent sequence. No clear introduction, explanation, or conclusion.",
        1: "Disorganized, unclear, or mostly irrelevant. No observable structure. Ideas disconnected or incomplete.",
      },
    },
    {
      name: "Fluency",
      description: "Speaking confidence, filler words, self-corrections, grammar, and appropriate vocabulary (lexical resource)",
      scale: {
        5: "Full confidence; rare fillers or silence; rare grammatical errors; appropriate and varied vocabulary used; <=1 fatal mistake per 2 min",
        4: "Decent confidence; occasional fillers/silence/errors; mostly appropriate vocabulary; <=1 fatal mistake per 1 min",
        3: "Moderate fluency; occasional errors and fillers; adequate vocabulary; 2-3 fatal mistakes per 1 min",
        2: "Basic fluency; limited vocabulary flexibility; frequent fillers and errors; 4-5 fatal mistakes per 1 min",
        1: "Cannot sustain basic communication; inappropriate vocabulary commonly used; constant fillers; >6 fatal mistakes",
      },
    },
    {
      name: "Technical",
      description: "Domain knowledge and technical proficiency for the role",
      scale: {
        5: "Complete proficiency in technical knowledge required for the position. All concepts explained correctly.",
        4: "Strong proficiency with only minor inaccuracies or incomplete details. Most technical concepts explained correctly.",
        3: "Moderate understanding of technical knowledge. Basic concepts correct but lack depth or clarity.",
        2: "Limited technical understanding. Answers often incomplete, vague, or partially incorrect.",
        1: "Minimal or no understanding. Most answers incorrect, irrelevant, or unable to address the question.",
      },
    },
    {
      name: "Soft Skill",
      description: "Communication, interpersonal awareness, collaboration skills",
      scale: {
        5: "Complete set of soft skills required for the position. Excellent communication and interpersonal awareness.",
        4: "Strong demonstration of most soft skills. Good communication with minor gaps.",
        3: "Moderate level of soft skills. Basic communication and interpersonal awareness present.",
        2: "Limited soft skills. Communication and responses may appear unclear, underdeveloped, or partially relevant.",
        1: "Minimal or no soft skills demonstrated. Poor communication throughout.",
      },
    },
  ],
};

/**
 * Format rubric for AI prompts
 */
export function formatRubricForPrompt(): string {
  return CentralRubric.dimensions
    .map(
      (d) => `
${d.name}: ${d.description}
  5 (Excellent) = ${d.scale[5]}
  4 (Good) = ${d.scale[4]}
  3 (Satisfactory) = ${d.scale[3]}
  2 (Needs Improvement) = ${d.scale[2]}
  1 (Poor) = ${d.scale[1]}
  `
    )
    .join('\n');
}
