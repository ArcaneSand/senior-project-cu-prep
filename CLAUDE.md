# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured. The `app/__tests__/evaluation/` directory exists but is empty.

## Architecture

**CU-Prep** is an AI-powered mock interview platform built with Next.js 16 App Router.

### Core Flow
1. User signs up/in via Firebase Auth (email/password, session stored in HTTP-only cookie)
2. User fills out `PreInterviewForm` (role, level, tech stack, question type, count)
3. `lib/actions/general.action.ts:generateQuestions` calls `/api/vapi/generate` → Google gemini-3.1-flash-lite-preview generates questions → saved to Firestore `interviews` collection
4. User conducts voice interview via `Agent.tsx` using the **Vapi** voice SDK (`@vapi-ai/web`)
5. After interview, `createFeedback` sends transcript to Gemini for structured evaluation → saved to Firestore `feedbacks` collection
6. User views feedback at `/interview/[id]/feedback`

### Route Groups
- `app/(auth)/` — Public sign-in/sign-up pages
- `app/(root)/` — Protected pages; layout redirects unauthenticated users to `/sign-in`

### Data Layer
Firebase Firestore (no ORM) with two collections:
- `interviews` — stores role, level, techstack, questions[], userId, finalized flag
- `feedbacks` — stores scores across 5 categories, strengths, areasForImprovement, finalAssessment

Server actions in `lib/actions/` use `firebase-admin` (server-side). Client components use `firebase/client.ts`.

### AI Integrations
- **Question generation**: POST `/api/vapi/generate` → Vercel AI SDK (`ai`) + `@ai-sdk/google` (	gemini-3.1-flash-lite-preview)
- **Feedback generation**: `createFeedback` in `lib/actions/general.action.ts` uses `generateObject` with a Zod schema for structured scoring
- **Voice interviews**: Vapi workflow triggered from `Agent.tsx` via `NEXT_PUBLIC_VAPI_WEB_TOKEN` and `NEXT_PUBLIC_VAPI_WORKFLOW_ID`
- **Multi-judge evaluation**: POST `/api/evaluate-multi` runs two parallel Gemini judges and aggregates their scores statistically (no AI in aggregation)

### Multi-Judge Evaluation System (`lib/evaluation/`)
Two independent judges each score on a 0–4 scale; `Aggregator` combines results using mean/median/stdDev — no AI involved in aggregation.

- `BaseJudge` — abstract base defining `JudgeEvaluation` and `EvaluationDimension` interfaces
- `StarJudge` — evaluates STAR method (Situation, Task, Action, Result) using `gemini-3.1-flash-lite-preview`
- `CompetencyJudge` — evaluates behavioral competencies (Problem-Solving, Communication, Initiative, Impact) using `gemini-3.1-flash-lite-preview`
- `Aggregator` — statistical combination: flags dimensions with stdDev > 1.0 as disagreements, calculates confidence from judge agreement + individual confidence + judge count

To add a new judge: extend `BaseJudge`, implement `evaluate()`, add it to the `/api/evaluate-multi` route alongside the existing judges.

### UI Stack
- **Tailwind CSS v4** with CSS variables for theming
- **Shadcn/ui** (new-york style) — components in `components/ui/`
- Path alias `@/` maps to the project root

## Environment Variables

Required in `.env.local`:
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

## Notes
- `next.config.ts` ignores TypeScript and ESLint errors during build (`ignoreBuildErrors: true`, `ignoreDuringBuilds: true`)
- Firebase Admin is initialized once (singleton pattern) in `firebase/admin.ts` using a service account
