# PROJECT STATE - Current Snapshot

> **Last Updated:** 2026-03-28
> **Updated By:** Code mapping pass

---

## ⚙️ Environment

**Node Version:** (check with `node -v`)
**Package Manager:** npm
**Framework:** Next.js 16.0.10 (App Router)
**React:** 19.2.0
**TypeScript:** Yes ✅
**Database:** Firebase Firestore (client: firebase 12.5.0, admin: firebase-admin 13.6.0)
**AI Provider:** Gemini 2.5-flash (via Vercel AI SDK `ai` 5.0.104 + `@ai-sdk/google` 2.0.44)
**Voice:** Vapi (`@vapi-ai/web` 2.5.1)
**Styling:** Tailwind CSS v4

**Key Environment Variables (all required):**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
NEXT_PUBLIC_VAPI_WEB_TOKEN
NEXT_PUBLIC_VAPI_WORKFLOW_ID
GOOGLE_GENERATIVE_AI_API_KEY
```

---

## 📂 Project Structure (Verified)

```
project-root/
├── app/
│   ├── layout.tsx                          # ✅ Root layout — Geist font, Sonner toaster, Navbar
│   ├── (auth)/
│   │   ├── layout.tsx                      # ✅ Minimal auth wrapper
│   │   ├── sign-in/page.tsx                # ✅ Renders AuthForm type="sign-in"
│   │   └── sign-up/page.tsx                # ✅ Renders AuthForm type="sign-up"
│   └── (root)/
│       ├── layout.tsx                      # ✅ Protected — redirects to /sign-in if no session
│       ├── page.tsx                        # ✅ Shows Hero (unauthed) or Dashboard (authed)
│       ├── profile/page.tsx                # ✅ User profile + sign-out action
│       ├── gei/page.tsx                    # ⚠️ PLACEHOLDER — minimal UI, no real functionality
│       └── interview/
│           ├── layout.tsx                  # ✅ Protected interview layout
│           ├── page.tsx                    # ✅ PreInterviewForm — setup new interview
│           └── [id]/
│               ├── page.tsx                # ✅ Voice interview conduct page — renders Agent
│               └── feedback/page.tsx       # ✅ Feedback results page — scores, strengths, improvements
│
├── app/api/
│   ├── vapi/generate/route.ts              # ✅ POST — generates questions via Gemini, saves to Firestore
│   └── evaluate-multi/route.ts             # ❌ EMPTY FILE — multi-judge system not wired up
│
├── components/
│   ├── Agent.tsx                           # ✅ Core voice interview component (Vapi, transcript, createFeedback)
│   ├── AuthForm.tsx                        # ✅ Sign-in/sign-up form with Firebase Auth
│   ├── FormField.tsx                       # ✅ Generic form field (input/radio/checkbox/textarea)
│   ├── PreInterviewForm.tsx                # ✅ Interview setup form (context, focus, role, field, stage, amount)
│   ├── InterviewCard.tsx                   # ✅ Interview summary card for dashboard
│   ├── Navbar.tsx                          # ✅ Top nav — logo, links, auth button
│   ├── page/root/
│   │   ├── Hero.tsx                        # ✅ Landing page hero for unauthenticated users
│   │   ├── Dashboard.tsx                   # ✅ Authenticated dashboard — fetches & displays interviews
│   │   └── root.tsx                        # ❌ EMPTY FILE — unused
│   ├── ui/                                 # ✅ Shadcn/ui components (button, input, form, checkbox, etc.)
│   └── evaluation/
│       ├── MultiJudgeResults.tsx           # ⚠️ EXISTS — not integrated into any page
│       ├── JudgeCard.tsx                   # ⚠️ EXISTS — not integrated into any page
│       └── ScoreIndicator.tsx              # ⚠️ EXISTS — not integrated into any page
│
├── lib/
│   ├── ai.config.ts                        # ✅ Exports geminiModel = google("gemini-2.5-flash")
│   ├── utils.ts                            # ✅ cn() utility for Tailwind class merging
│   ├── vapi.sdk.ts                         # ✅ Singleton Vapi instance
│   ├── actions/
│   │   ├── auth.action.ts                  # ✅ signUp, signIn, signOut, getCurrentUser, setSessionCookie
│   │   └── general.action.ts               # ✅ generateQuestions, createFeedback, getInterviewsByUserId, getFeedbackByInterviewId
│   ├── evaluation/
│   │   ├── BaseJudge.ts                    # ✅ Abstract base — EvaluationDimension, JudgeEvaluation interfaces
│   │   ├── Aggregator.ts                   # ✅ Statistical aggregation — mean/median/stdDev, confidence score
│   │   ├── judges/
│   │   │   ├── StarJudge.ts                # ✅ STAR method evaluator (Situation/Task/Action/Result)
│   │   │   └── CompetencyJudge.ts          # ✅ Competency evaluator (Problem-Solving/Communication/Initiative/Impact)
│   │   └── rubrics/
│   │       ├── StarRubric.ts               # ✅ 5-level STAR scoring criteria + reference answers
│   │       └── CompetencyRubric.ts         # ✅ 5-level competency scoring criteria + reference standards
│   └── vapi-action/
│       └── interview-formatter.ts          # ✅ buildVapiAssistantConfig() — formats questions for Vapi system prompt
│
├── firebase/
│   ├── admin.ts                            # ✅ Firebase Admin SDK singleton (server-side)
│   └── client.ts                           # ✅ Firebase client SDK singleton (client-side)
│   # NOTE: firebase/evaluation.ts referenced in MASTER_AGENT.md does NOT EXIST
│
├── types/
│   ├── index.d.ts                          # ✅ All global types: User, Interview, Feedback, AgentProps, etc.
│   └── declarations.d.ts                   # ✅ CSS module declaration
│   # NOTE: types/evaluation.ts referenced in MASTER_AGENT.md does NOT EXIST
│
└── constants/
    └── index.ts                            # ✅ feedbackSchema (Zod) + old interviewer config (unused)
```

---

## 🎯 Current Features

### Working Features ✅

**Authentication:**
- [x] Sign up / Sign in with Firebase Auth (email/password)
- [x] Session via HTTP-only cookie (7-day)
- [x] Protected routes redirect to /sign-in
- [x] Sign out clears session cookie

**Interview Generation:**
- [x] PreInterviewForm collects: context, focus, role, field, stage, amount, additionalInfo
- [x] generateQuestions() calls Gemini, saves to Firestore `interviews` collection
- [x] Interview accessible at /interview/[id]

**Voice Interview (VAPI):**
- [x] Agent.tsx conducts voice interview via Vapi
- [x] "Sarah" AI interviewer persona with dynamic Gemini-powered config
- [x] Transcript collected throughout call
- [x] On call end: createFeedback() called with full transcript

**Feedback System (EXISTING, WORKING):**
- [x] createFeedback() sends transcript to Gemini
- [x] Gemini scores 5 categories: Communication, Technical Knowledge, Problem Solving, Cultural Fit, Confidence & Clarity
- [x] Scores + strengths + areasForImprovement + finalAssessment saved to Firestore `feedback` collection
- [x] Results displayed at /interview/[id]/feedback

**Multi-Judge Evaluation System (BUILT, NOT CONNECTED):**
- [x] StarJudge — evaluates STAR method (0-4 scale per dimension)
- [x] CompetencyJudge — evaluates behavioral competencies (0-4 scale)
- [x] Aggregator — statistical combination, disagreement flags, confidence score
- [x] UI components: MultiJudgeResults, JudgeCard, ScoreIndicator
- [ ] /api/evaluate-multi route is EMPTY — judges not callable via API
- [ ] Evaluation system not connected to interview or feedback flow

### Incomplete / Missing ❌

- [ ] /api/evaluate-multi route body (file exists but is empty)
- [ ] firebase/evaluation.ts (referenced in docs but doesn't exist)
- [ ] types/evaluation.ts (referenced in docs but doesn't exist)
- [ ] Integration: answer submission → multi-judge evaluation
- [ ] Integration: results page showing multi-judge scores
- [ ] gei/page.tsx has no real functionality

---

## 📊 Data Models (Verified)

### Firestore Collections

**`users`**
```typescript
{
  email: string;
  // (name stored in displayName via Firebase Auth, not Firestore)
}
```

**`interviews`**
```typescript
{
  id: string;          // auto-generated
  context: string;     // "job" | "internship"
  focus: string;       // "behavioral" | "technical" | "mixed"
  role: string;        // e.g., "Software Engineer"
  field: string;       // e.g., "Technology"
  stage: string;       // "student" | "freshgrad" | "experienced"
  questions: string[]; // array of question strings
  additionalInfo?: string;
  createAt: string;    // ISO date string
  userId: string;
  finalized: boolean;
}
```

**`feedback`**
```typescript
{
  id: string;          // auto-generated
  interviewId: string;
  userId: string;
  totalScore: number;  // 0-100
  categoryScores: Array<{
    name: string;      // "Communication Skills" | "Technical Knowledge" | "Problem Solving" | "Cultural Fit" | "Confidence and Clarity"
    score: number;     // 0-100
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}
```

**NOTE:** There is NO `evaluations` Firestore collection. The multi-judge system has never been wired to Firebase.

---

## 🔄 User Flow (Actual Current State)

```
Step 1: User lands on home page (/)
  - Unauthenticated: Hero component with CTA
  - Authenticated: Dashboard with interview history

Step 2: User starts interview
  - Clicks "Schedule New Interview" or "Start Practicing Free"
  - Navigates to /interview → PreInterviewForm

Step 3: User fills out form
  - Context (job/internship), Focus (behavioral/technical/mixed)
  - Role, Field, Stage, Number of Questions, Additional Info
  - Submit → generateQuestions() → saves to Firestore → redirects to /

Step 4: User clicks interview card to start
  - Navigates to /interview/[id]
  - Agent.tsx loads with Vapi voice interview
  - "Sarah" AI interviewer guides through questions

Step 5: Voice interview completes
  - User clicks "End Interview" or interview finishes
  - Agent calls createFeedback(transcript)
  - Gemini evaluates transcript → saves to Firestore `feedback`
  - Redirects to /interview/[id]/feedback

Step 6: User views feedback
  - Overall score (0-100)
  - 5 category scores with progress bars
  - Strengths and areas for improvement
  - Final assessment
  - "Retake Interview" / "Back to Dashboard" buttons
```

---

## 🧩 Dependencies (Verified from package.json)

```json
{
  "next": "16.0.10",
  "react": "19.2.0",
  "firebase": "12.5.0",
  "firebase-admin": "13.6.0",
  "ai": "5.0.104",
  "@ai-sdk/google": "2.0.44",
  "@vapi-ai/web": "2.5.1",
  "react-hook-form": "7.66.0",
  "@hookform/resolvers": "5.2.2",
  "zod": "4.1.12",
  "tailwindcss": "4",
  "lucide-react": "0.553.0",
  "sonner": "2.0.7",
  "dayjs": "1.11.19"
}
```

---

## 🐛 Known Issues

### Minor ⚠️

1. **`gei/page.tsx` is a placeholder** with no real functionality
2. **Build ignores errors:** `next.config.ts` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`
3. **`getInverviewsByID` alias** — `interview/[id]/page.tsx` still imports the old name via alias; refactor when touching that file

---

## 🎨 Design System

**Framework:** Tailwind CSS v4 with CSS variables for theming
**Component Library:** Shadcn/ui (new-york style) — `components/ui/`
**Icons:** lucide-react
**Notifications:** Sonner toast

**Current Colors:** Dark theme with CSS variables (check `app/globals.css`)
**Typography:** Geist font (Google Fonts)
**Path alias:** `@/` → project root

---

## 🚀 Deployment

**Hosting:** Vercel (inferred from Vercel AI SDK usage + next.config.ts)
**CI/CD:** Likely automatic via Vercel GitHub integration

---

## 👥 Team Context

**Solo Developer:** Yes ✅
**Current Branch:** `frontier`
**Main Branch:** `main`

---

## 🎯 Priorities

### Completed ✅

1. **Implemented `/api/evaluate-multi` route**
   - StarJudge + CompetencyJudge run in parallel, Aggregator combines results
   - `lib/actions/evaluation.action.ts` handles Firestore CRUD
   - `types/evaluation.ts` defines StoredEvaluation type

2. **Connected multi-judge evaluation to interview flow**
   - `Agent.tsx` fires per-question multi-judge evaluations (fire-and-forget) after call ends
   - Runs alongside existing `createFeedback` — both systems active

3. **Multi-judge results displayed on feedback page**
   - `/interview/[id]/feedback` shows AI Judge Analysis section per question
   - Dimension scores, strengths, improvements, disagreement flags, confidence
   - Graceful "still processing" state if evaluations aren't ready yet

4. **Frontend redesign**
   - Dark theme enforced globally via `dark` class on `<html>`
   - Navbar, Hero, Dashboard, AuthForm, interview pages all updated
   - Consistent use of `bgc`, `gradient-bg`, `grad-text` design tokens

5. **Fixed typo:** `getInverviewsByID` → aliased to `getInterviewById`, duplicate removed

6. **Cleaned up dead files:**
   - Deleted `components/page/root/root.tsx` (empty)
   - Removed unused `interviewer` GPT-4 config from `constants/index.ts`

### Remaining / Future

- **Interview page header** — `interview/[id]/page.tsx` uses `getInverviewsByID` alias; update import to `getInterviewById` when refactoring
- **Per-question answer extraction** — multi-judge currently sends full user transcript for every question; could improve by parsing transcript to isolate per-question responses
- **Vapi workflow for "generate" type** — Agent's `type="generate"` flow uses `NEXT_PUBLIC_VAPI_WORKFLOW_ID`; not tested recently
- **Profile page** — minimal implementation, could show interview stats
- **gei/page.tsx** — placeholder, no functionality

---

## 🤝 Communication Preferences

- Make reasonable assumptions, ask only when blocked
- Try reasonable defaults, log decision
- Don't stop for minor issues — fix and continue
