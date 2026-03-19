/**
 * Competency-Based Rubric and Reference Standards
 * 
 * This file contains evaluation criteria focused on behavioral competencies
 * rather than structural format (complementary to STAR method).
 */

export const COMPETENCY_RUBRIC = {
  name: "Behavioral Competency Evaluation",
  description: "Evaluates interview answers based on demonstrated professional competencies",
  
  dimensions: [
    {
      name: "Problem-Solving",
      description: "Analytical thinking, root cause analysis, and solution design",
      levels: [
        {
          score: 4,
          criteria: "Systematic analytical approach with clear root cause identification, multiple solutions considered, data-driven decision making, and evidence of iterative problem-solving"
        },
        {
          score: 3,
          criteria: "Clear problem identification with logical solution approach, some analysis of root causes, reasonable solution with justification"
        },
        {
          score: 2,
          criteria: "Problem identified but solution approach not well-reasoned, limited analysis, or jumps to solution without clear thinking process"
        },
        {
          score: 1,
          criteria: "Minimal problem-solving demonstrated, unclear thinking process, or solution appears arbitrary"
        },
        {
          score: 0,
          criteria: "No problem-solving approach evident, or problem not clearly identified"
        }
      ],
      evidenceKeywords: [
        "analyzed",
        "investigated",
        "root cause",
        "identified",
        "diagnosed",
        "researched",
        "evaluated options",
        "compared",
        "tested",
        "hypothesized"
      ],
      failurePatterns: [
        "just did it",
        "obvious solution",
        "didn't think about it",
        "someone told me",
        "randomly tried"
      ]
    },
    
    {
      name: "Communication",
      description: "Clarity, structure, and articulation of ideas",
      levels: [
        {
          score: 4,
          criteria: "Exceptionally clear and well-structured response with logical flow, easy to follow, uses concrete examples, and demonstrates strong articulation of complex ideas"
        },
        {
          score: 3,
          criteria: "Clear communication with good structure, mostly easy to follow, some good examples, minor organizational issues"
        },
        {
          score: 2,
          criteria: "Understandable but lacks clear structure, jumps between ideas, or missing important context that would aid comprehension"
        },
        {
          score: 1,
          criteria: "Unclear or disorganized, difficult to follow the narrative, or missing critical information"
        },
        {
          score: 0,
          criteria: "Incomprehensible, extremely disorganized, or fails to communicate the story"
        }
      ],
      evidenceKeywords: [
        "first",
        "then",
        "next",
        "because",
        "therefore",
        "as a result",
        "for example",
        "specifically"
      ],
      failurePatterns: [
        "and then",
        "and stuff",
        "you know",
        "like",
        "whatever",
        "things",
        "it"
      ]
    },
    
    {
      name: "Initiative",
      description: "Proactivity, ownership, and self-direction",
      levels: [
        {
          score: 4,
          criteria: "Strong proactive ownership, identified problem without prompting, took full responsibility, drove solution independently, went beyond assigned duties"
        },
        {
          score: 3,
          criteria: "Clear ownership when responsibility assigned, took initiative within scope, showed self-direction in execution"
        },
        {
          score: 2,
          criteria: "Participated but limited personal ownership, followed direction, or unclear if action was self-directed vs assigned"
        },
        {
          score: 1,
          criteria: "Minimal initiative shown, primarily reactive, or heavily dependent on others for direction"
        },
        {
          score: 0,
          criteria: "No initiative demonstrated, or entirely passive role"
        }
      ],
      evidenceKeywords: [
        "I noticed",
        "I identified",
        "I proposed",
        "I volunteered",
        "took initiative",
        "proactively",
        "on my own",
        "independently"
      ],
      failurePatterns: [
        "was assigned",
        "was told to",
        "had to",
        "manager asked",
        "someone said"
      ]
    },
    
    {
      name: "Impact",
      description: "Business or technical impact achieved, value delivered",
      levels: [
        {
          score: 4,
          criteria: "Significant quantified impact on business metrics, users, or technical systems with clear value demonstration and long-term benefits articulated"
        },
        {
          score: 3,
          criteria: "Clear positive impact with some quantification, demonstrated value to stakeholders, or measurable improvement shown"
        },
        {
          score: 2,
          criteria: "Positive impact mentioned but not quantified, or unclear magnitude of value delivered"
        },
        {
          score: 1,
          criteria: "Minimal or unclear impact, or success criteria not met"
        },
        {
          score: 0,
          criteria: "No measurable impact demonstrated, or outcome unclear/negative"
        }
      ],
      evidenceKeywords: [
        "improved",
        "increased",
        "reduced",
        "saved",
        "enabled",
        "delivered",
        "%",
        "users",
        "revenue",
        "cost",
        "time"
      ],
      failurePatterns: [
        "worked out",
        "was good",
        "went well",
        "successful",
        "completed"
      ]
    }
  ]
};

/**
 * Reference standards for competency evaluation
 */
export const COMPETENCY_STANDARDS = {
  excellent: `Demonstrated exceptional problem-solving by conducting systematic root cause analysis using profiling tools to identify N+1 database queries as the bottleneck, rather than guessing. Showed strong initiative by proactively identifying the performance issue before it became critical and proposing a comprehensive three-part solution independently. Communicated the technical solution with outstanding clarity, using a logical sequence (profiling → identification → solution design → implementation → validation). Delivered significant measurable impact with 92% performance improvement, 15% user engagement increase, and customer retention, clearly demonstrating business value beyond just technical metrics.`,
  
  poor: `Problem-solving is unclear - mentions database issues but no evidence of analytical approach or investigation process. Shows minimal initiative as it's unclear if the candidate identified the problem or was directed to fix it (uses 'we' throughout). Communication is extremely vague and unstructured, jumping from problem to solution without clear flow. Impact is not quantified ('got better', 'people were happier') making it impossible to assess actual value delivered.`
};

/**
 * TypeScript types for competency rubric
 */
export type CompetencyLevel = {
  score: number;
  criteria: string;
};

export type CompetencyDimension = {
  name: string;
  description: string;
  levels: CompetencyLevel[];
  evidenceKeywords: string[];
  failurePatterns: string[];
};

export type CompetencyRubricType = {
  name: string;
  description: string;
  dimensions: CompetencyDimension[];
};