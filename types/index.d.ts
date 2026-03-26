type AuthFormType = "sign-in" | "sign-up";

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface User {
  name: string;
  email: string;
  id: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  type: "generate" | "interview";
  feedbackId?: string;
  interviewId?: string;
  questions?: string[];
}

interface Interview {
  id: string;
  context: string;
  focus: string;
  role: string;
  field: string;
  stage: string;
  questions: string[];
  additionalInfo?: string;
  createAt: string;
  userId: string;
  finalized: boolean;
}
interface InterviewCardProps {
  interviewId?: string;
  id: string;
  userId: string;
  role: string;
  context: string;
  focus: string;
  field: string;
  stage: string;
  questions: string[];
  createAt: string;
  finalized?: boolean;
}
interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface InterviewRequest {
  context: string; // "job" | "internship"
  focus: string; // "behavioral" | "technical" | "mixed"
  role: string; // position title
  field: string; // industry / field (replaces techstack)
  stage: string; // "student" | "freshgrad" | "experienced"
  amount: number;
  userid: string;
  additionalInfo?: string; // optional free-text grounding
}

type Message =
  | TranscriptMessage
  | FunctionCallMessage
  | FunctionCallResultMessage;
interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}
