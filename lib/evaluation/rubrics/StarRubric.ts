/**
 * STAR Method Rubric and Reference Answers
 * 
 * This file contains the complete evaluation criteria for the STAR
 * (Situation, Task, Action, Result) method used in behavioral interviews.
 */

export const STAR_RUBRIC = {
  name: "STAR Method Evaluation",
  description: "Evaluates behavioral interview answers using the STAR framework",
  
  dimensions: [
    {
      name: "Situation",
      description: "Clear context: who, what, where, when",
      levels: [
        {
          score: 5,
          criteria: "Comprehensive context with all elements: specific role, company/project name, timeline, and detailed problem description"
        },
        {
          score: 4,
          criteria: "Good context with most elements present, missing only 1-2 minor details like exact timeline or company name"
        },
        {
          score: 3,
          criteria: "Basic context provided but vague or missing key details such as role, timeline, or problem specifics"
        },
        {
          score: 2,
          criteria: "Minimal context provided, hard to understand the situation or background"
        },
        {
          score: 1,
          criteria: "No situation context provided, jumps straight to actions or results"
        }
      ],
      evidenceKeywords: [
        "I was working",
        "at my company",
        "when",
        "where",
        "my role",
        "on the team",
        "during",
        "at the time"
      ],
      failurePatterns: [
        "we were",
        "there was",
        "it happened",
        "at some point",
        "once"
      ]
    },
    
    {
      name: "Task",
      description: "Personal responsibility and specific goal",
      levels: [
        {
          score: 5,
          criteria: "Crystal clear personal responsibility stated explicitly with measurable, specific goal and success criteria"
        },
        {
          score: 4,
          criteria: "Clear personal responsibility stated, goal mentioned but not fully quantified or success criteria somewhat vague"
        },
        {
          score: 3,
          criteria: "Responsibility implied but not explicitly stated, or goal is vague without clear success criteria"
        },
        {
          score: 2,
          criteria: "Unclear what the candidate's personal responsibility was, or goal is extremely vague"
        },
        {
          score: 1,
          criteria: "No task or personal responsibility mentioned, unclear what candidate was trying to achieve"
        }
      ],
      evidenceKeywords: [
        "my responsibility",
        "I was responsible for",
        "I needed to",
        "my goal",
        "my task",
        "I had to",
        "my objective"
      ],
      failurePatterns: [
        "we needed to",
        "the team had to",
        "our goal",
        "we were supposed to",
        "the project required"
      ]
    },
    
    {
      name: "Action",
      description: "Specific first-person actions with technical details",
      levels: [
        {
          score: 5,
          criteria: "Multiple specific first-person actions with technical depth, clear sequence, and explanation of decision-making process"
        },
        {
          score: 4,
          criteria: "2-3 clear first-person actions with some technical details, but could be more specific or detailed"
        },
        {
          score: 3,
          criteria: "Actions mentioned but primarily team-focused (we/they) or lacking technical specificity and depth"
        },
        {
          score: 2,
          criteria: "Very vague actions or almost entirely team-focused with no clear individual contribution"
        },
        {
          score: 1,
          criteria: "No actions described, or completely unclear what the candidate actually did"
        }
      ],
      evidenceKeywords: [
        "I implemented",
        "I designed",
        "I built",
        "I analyzed",
        "I created",
        "I wrote",
        "I developed",
        "I configured",
        "I debugged",
        "I refactored"
      ],
      failurePatterns: [
        "we decided",
        "the team did",
        "it was done",
        "we implemented",
        "we built",
        "they made"
      ]
    },
    
    {
      name: "Result",
      description: "Quantified outcome and lessons learned",
      levels: [
        {
          score: 5,
          criteria: "Specific quantified metrics (numbers, percentages, time saved) AND meaningful lessons learned or insights gained"
        },
        {
          score: 4,
          criteria: "Quantified results with specific numbers OR detailed lessons learned, but not both; or metrics present but not very specific"
        },
        {
          score: 3,
          criteria: "Vague positive outcome mentioned without specific numbers or meaningful quantification"
        },
        {
          score: 2,
          criteria: "Outcome barely mentioned, extremely vague, or unclear if successful"
        },
        {
          score: 1,
          criteria: "No result or outcome provided, story incomplete"
        }
      ],
      evidenceKeywords: [
        "reduced by",
        "improved by",
        "increased",
        "decreased",
        "%",
        "x faster",
        "learned that",
        "discovered",
        "realized",
        "this taught me"
      ],
      failurePatterns: [
        "it worked",
        "was successful",
        "went well",
        "turned out good",
        "everything was fine",
        "problem solved"
      ]
    }
  ]
};

/**
 * Reference answers demonstrating excellent and poor STAR responses
 */
export const REFERENCE_ANSWERS = {
  excellent: `I was working as a backend engineer at TechCorp when our main API was experiencing severe performance issues, with response times averaging 5 seconds, causing a 30% drop in user engagement over two weeks. My specific responsibility was to identify and fix the root cause to reduce API latency to under 500ms within two weeks, as we were at risk of losing key enterprise customers. I started by profiling the application using New Relic APM and identified that N+1 database queries in our user profile endpoints were the primary bottleneck, accounting for 80% of the slow requests. I then designed and implemented a three-part solution: First, I refactored 15 critical API endpoints to use eager loading instead of lazy loading, eliminating the N+1 query pattern. Second, I implemented Redis caching for frequently accessed user profile data with a 5-minute TTL, which covered 60% of our read traffic. Third, I added composite indexes to the PostgreSQL database on commonly queried fields (user_id, created_at) to speed up the remaining queries. I also wrote comprehensive unit tests and load tests to validate the improvements before deployment. After deploying these changes to production, average API response time dropped from 5 seconds to 380ms, a 92% improvement. User engagement recovered to previous levels and actually increased by 15% due to the better experience. Customer complaints about slowness decreased by 85%, and we retained all at-risk enterprise accounts. The most valuable lesson I learned was that investing 2-3 days in proper profiling and root cause analysis before jumping to solutions prevents wasted effort on optimizing the wrong bottlenecks, which saved us from pursuing a costly database migration that wouldn't have solved the real problem.`,
  
  poor: `We had some performance problems at my company and the website was really slow. Users were complaining a lot about it. The team looked into it and we found some database issues that were causing problems. We made some changes to optimize things and added some caching to make it faster. After we did that, everything got better and the site was much faster. People stopped complaining as much and everything went back to normal. It was a good learning experience for everyone on the team.`
};

/**
 * TypeScript type for the rubric structure
 */
export type RubricLevel = {
  score: number;
  criteria: string;
};

export type RubricDimension = {
  name: string;
  description: string;
  levels: RubricLevel[];
  evidenceKeywords: string[];
  failurePatterns: string[];
};

export type Rubric = {
  name: string;
  description: string;
  dimensions: RubricDimension[];
};