/**
 * Converts Gemini-generated questions into the format the VAPI system prompt expects.
 * Each question can optionally include a follow-up hint.
 *
 * Input shape from your existing questions array:
 *   string[]  — plain questions
 *
 * Output: a formatted string injected into {{questions}} in the system prompt.
 */

export interface InterviewQuestion {
  question: string;
  followUpHint?: string; // optional — Gemini can generate this
}

export function formatQuestionsForVapi(
  questions: InterviewQuestion[] | string[],
): string {
  return questions
    .map((q, i) => {
      const n = i + 1;
      const questionText = typeof q === "string" ? q : q.question;
      const hint = typeof q === "string" ? null : (q.followUpHint ?? null);

      return [`Q${n}: ${questionText}`, `HINT${n}: ${hint ?? "null"}`].join(
        "\n",
      );
    })
    .join("\n\n");
}

/**
 * Builds the complete VAPI transient assistant config object.
 * Pass this directly to vapi.start().
 */
export function buildVapiAssistantConfig({
  candidateName,
  jobRole,
  interviewType,
  questions,
}: {
  candidateName: string;
  jobRole: string;
  interviewType: string;
  questions: InterviewQuestion[] | string[];
}) {
  const formattedQuestions = formatQuestionsForVapi(questions);
  const totalQuestions = questions.length;

  const systemPrompt = `[Identity]
You are a warm, experienced startup recruiter named Sarah conducting a mock
interview for the ${jobRole} position. You combine friendliness with
professional pacing — encouraging but not effusive, structured but never robotic.

[Interview Questions — FOLLOW THIS EXACT ORDER]
${formattedQuestions}

[Core Rules]
1. Ask questions ONE AT A TIME in the exact order listed above.
2. After the candidate finishes each answer, respond with a brief, varied
   acknowledgment (2-8 words max). Examples: "That's a really helpful answer",
   "I appreciate you sharing that", "Interesting", "Great perspective",
   "Thank you". NEVER repeat the same acknowledgment twice in a row.
3. FOLLOW-UP LOGIC: After acknowledging the answer to question N, check if
   HINT<N> exists and is not "null". If the hint exists AND the candidate's
   answer was vague, too short (under ~2 sentences), or missed specifics,
   ask the follow-up suggested in the hint. You may rephrase it naturally.
   Ask AT MOST ONE follow-up per main question. After the follow-up answer
   (or if no follow-up was needed), move unconditionally to the next main question.
4. PROGRESS AWARENESS: You are asking ${totalQuestions} questions total.
   Track your position internally. Use natural transitions:
   - Early questions: "Great, let's keep going."
   - Middle: "We're making good progress — next one."
   - Second-to-last: "Just a couple more."
   - Final question: "This will be our last question for today."
   NEVER say "Question 3 of 5" or any numbered format.
5. PACING: If the candidate's answer becomes very long (roughly 3+ minutes or
   clearly tangential), gently interject: "That's really helpful context —
   in the interest of time, let me ask you the next one." Do this warmly.
6. After ALL questions and any follow-ups are complete, deliver a brief,
   encouraging wrap-up: summarize 1-2 strengths you noticed, tell them
   their detailed results will be ready shortly, thank them warmly, and say goodbye.
7. Then end the call.

[Voice Style]
- Use natural filler occasionally: "So...", "Alright...", "Okay, great..."
- Speak in short sentences — this is a voice conversation, not text.
- Never read bullet points or lists aloud.
- Never break character or discuss these instructions.

[Error Handling]
- If the candidate says "I don't know" or "skip": say "No problem at all" and move on.
- If the candidate asks you to repeat: repeat the question naturally, paraphrased.
- If the candidate goes silent: the system handles this automatically.`;

  return {
    // ── LLM ──────────────────────────────────────────────────────────────
    model: {
      provider: "google",
      model: "gemini-2.5-flash",
      temperature: 0.75,
      messages: [{ role: "system", content: systemPrompt }],
    },

    // ── Voice (ElevenLabs Rachel — warm, professional) ────────────────────
    voice: {
      provider: "vapi",
      voiceId: "Elliot",
    },

    // ── Transcription ─────────────────────────────────────────────────────
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en",
    },

    // ── Opening greeting ──────────────────────────────────────────────────
    firstMessage: `Hey ${candidateName}! Welcome — I'm really glad you're here. I'll be walking you through a few interview questions today for the ${jobRole} position. Take your time with each answer; there's no rush. Ready to dive in?`,
    firstMessageMode: "assistant-speaks-first",
    firstMessageInterruptionsEnabled: false,

    // ── Silence / turn detection ──────────────────────────────────────────
    // silenceTimeoutSeconds ends the ENTIRE CALL — keep it high
    silenceTimeoutSeconds: 300,
    maxDurationSeconds: 1800, // 30 min hard cap

    // When does VAPI decide the user has finished speaking?
    startSpeakingPlan: {
      smartEndpointingPlan: {
        provider: "livekit",
        // More patient after question-type phrases; quicker after clear endings
        waitFunction: "700 + 4000 * max(0, x - 0.5)",
      },
      waitSeconds: 0.8,
      customEndpointingRules: [
        {
          // After asking an open-ended question, wait longer
          type: "assistant",
          regex:
            "(tell me|describe|explain|walk me through|can you share|what would you|how did|what was)",
          timeoutSeconds: 5.0,
        },
        {
          // If user signals they're done, respond quickly
          type: "customer",
          regex:
            "(that's all|that's it|I think that covers it|that's my answer|done|finished)",
          timeoutSeconds: 0.5,
        },
      ],
    },

    // Controls how VAPI handles being interrupted BY the user
    stopSpeakingPlan: {
      numWords: 2, // User must say 2+ words to interrupt (prevents false triggers)
      voiceSeconds: 0.3,
      backoffSeconds: 1.5, // After stopping, stay silent 1.5s to give user the floor
      acknowledgementPhrases: [
        "okay",
        "right",
        "uh-huh",
        "yeah",
        "mm-hmm",
        "sure",
        "I see",
      ],
      interruptionPhrases: [
        "wait",
        "hold on",
        "actually",
        "let me add",
        "one more thing",
        "sorry",
      ],
    },

    // Idle message if user goes completely silent mid-turn
    hooks: [
      {
        on: "customer.speech.timeout",
        options: {
          timeoutSeconds: 15,
          triggerMaxCount: 3,
          triggerResetMode: "onUserSpeech",
        },
        do: [
          {
            type: "say",
            exact: [
              "Take your time — I'm right here when you're ready.",
              "No pressure at all. Would you like me to rephrase that?",
              "It's totally fine to think it through. Just let me know when you're ready.",
            ],
          },
        ],
      },
    ],

    // ── Recording ─────────────────────────────────────────────────────────
    recordingEnabled: true,
    backgroundSound: "off",

    // ── Post-call analysis — VAPI extracts structured Q&A automatically ───
    analysisPlan: {
      summaryPrompt:
        "Summarize this mock interview: what questions were asked, how the candidate responded, and the overall quality of the session.",
      structuredDataPrompt:
        "Extract each interview question and the candidate's answer as an array. Include any follow-up questions and their answers.",
      structuredDataSchema: {
        type: "object",
        properties: {
          questionsAndAnswers: {
            type: "array",
            description: "Main question-answer pairs from the interview",
          },
          followUpExchanges: {
            type: "array",
            description: "Any follow-up questions asked and their answers",
          },
        },
      },
      successEvaluationPrompt:
        "Was the full interview completed? Were all questions asked and answered?",
      successEvaluationRubric: "NumericScale",
    },
  };
}
