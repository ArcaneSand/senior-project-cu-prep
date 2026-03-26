import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { geminiModel } from "@/lib/ai.config";

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU!" }, { status: 200 });
}

export async function POST(request: Request) {
  const { context, focus, role, field, stage, amount, userid, additionalInfo } =
    await request.json();

  try {
    const contextLabel: Record<string, string> = {
      job: "a full-time job application",
      internship: "an internship application",
    };

    const focusLabel: Record<string, string> = {
      behavioral:
        "behavioral questions only (situational, past experience, STAR-method style)",
      technical:
        "technical questions only (domain knowledge, problem-solving, role-specific skills)",
      mixed: "a balanced mix of behavioral and technical questions",
    };

    const stageLabel: Record<string, string> = {
      student: "a current student with limited work experience",
      freshgrad: "a fresh graduate entering the workforce",
      experienced: "an experienced professional",
    };

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
5. Questions will be read aloud by a voice assistant. Do not use any special characters such as * / # : ( ) or markdown formatting of any kind.
6. Do not number the questions. Do not add explanations or notes.
7. Return ONLY a JSON array of strings, with no additional text before or after. Format:
["Question one", "Question two", "Question three"]
      `.trim(),
    });

    const interview = {
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

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error }, { status: 500 });
  }
}
