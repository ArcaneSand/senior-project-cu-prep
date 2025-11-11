type AuthFormType = "sign-in" | "sign-up" 

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
  email: string;
  id: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
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
  type: string;
  role: string;
  level: string;
  techstack: string;
  amount: number;
  userid: string;
}