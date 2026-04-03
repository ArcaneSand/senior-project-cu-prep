"use server";

import { db } from "@/firebase/admin";
import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { feedbackSchema } from "@/constants";
import { geminiModel } from "@/lib/ai.config";
import { serializeFirestoreDoc } from "@/lib/utils/serialize";

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createAt", "desc")
    .get();

  return interviews.docs.map((doc) =>
    serializeFirestoreDoc<Interview>({ id: doc.id, ...doc.data() })
  );
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const doc = await db.collection("interviews").doc(id).get();
  if (!doc.exists) return null;
  return serializeFirestoreDoc<Interview>({ id: doc.id, ...doc.data() });
}

// Alias kept for backward compatibility
export const getInverviewsByID = getInterviewById;

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId } = params;

  // Check "evaluations" collection since that is what is
  // actually populated after an interview completes.
  const querySnapshot = await db
    .collection("evaluations")
    .where("interviewId", "==", interviewId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  // Return a minimal Feedback-shaped object so callers that
  // only check for null/non-null continue to work correctly.
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as unknown as Feedback;
}

export async function saveTranscript(
  interviewId: string,
  transcript: string
): Promise<void> {
  await db.collection("interviews").doc(interviewId).update({
    transcript,
    finishedAt: new Date().toISOString(),
  });
}

export async function generateQuestions(params: InterviewRequest) {
  const {
    context,        // "job" | "internship"
    focus,          // "behavioral" | "technical" | "mixed"
    role,           // "Marketing Manager", "Software Engineer", etc.
    field,          // "Finance", "Healthcare", "Software Engineering", etc.
    stage,          // "student" | "freshgrad" | "experienced"
    amount,
    userid,
    additionalInfo, // optional free-text
  } = params;

  // ── Human-readable labels for the prompt ──────────────────────────────────

  const contextLabel: Record<string, string> = {
    job:        "a full-time job application",
    internship: "an internship application",
  };

  const focusLabel: Record<string, string> = {
    behavioral: "behavioral questions only (situational, past experience, STAR-method style)",
    technical:  "technical questions only (domain knowledge, problem-solving, role-specific skills)",
    mixed:      "a balanced mix of behavioral and technical questions",
  };

  const stageLabel: Record<string, string> = {
    student:    "a current student with limited work experience",
    freshgrad:  "a fresh graduate entering the workforce",
    experienced: "an experienced professional",
  };

  try {
    const { text: questions } = await generateText({
      model: geminiModel,
      prompt: `
You are an expert interview coach preparing mock interview questions.

INTERVIEW CONTEXT:
- Purpose: ${contextLabel[context] ?? context}
- Position being applied for: ${role}
- Industry or field: ${field}
- Applicant stage: ${stageLabel[stage] ?? stage}
- Question focus: ${focusLabel[focus] ?? focus}
- Number of questions to generate: ${amount}
${additionalInfo ? `\nADDITIONAL CONTEXT FROM THE APPLICANT:\n${additionalInfo}` : ""}

INSTRUCTIONS:
1. Generate exactly ${amount} interview questions tailored to the context above.
2. Questions must be realistic and match what a real interviewer at a ${field} organization would ask for a ${role} position.
3. Adjust difficulty and framing to the applicant stage: ${stageLabel[stage] ?? stage}. For students or fresh graduates, do not ask for years of experience — focus on potential, learning agility, and academic or project experience instead.
4. If additional context was provided, use it to make at least some questions specific to that background or situation.
5. Questions will be read aloud by a voice assistant. Do not use any special characters such as * / # : ( ) — or markdown formatting of any kind.
6. Do not number the questions. Do not add explanations or notes.
7. Return ONLY a JSON array of strings, with no additional text before or after. Format:
["Question one", "Question two", "Question three"]
      `.trim(),
    });

    const interview = {
      // New general fields
      context,
      focus,
      role,
      field,
      stage,
      additionalInfo: additionalInfo ?? "",
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      createAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return true;
  } catch (error) {
    console.error("generateQuestions error:", error);
    return false;
  }
}

