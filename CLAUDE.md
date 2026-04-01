# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run start    # Start production server
pnpm run lint     # Run ESLint
```

No test framework is configured. The `app/__tests__/evaluation/` directory exists but is empty.

## Architecture

**CU-Prep** is an AI-powered mock interview platform built with Next.js 16 App Router.

### Route Groups
- `app/(auth)/` — Public sign-in/sign-up pages
- `app/(root)/` — Protected pages; layout redirects unauthenticated users to `/sign-in`

### Data Layer
Firebase Firestore (no ORM) with two collections:
- `interviews` — stores role, level, techstack, questions[], userId, finalized flag
- `feedbacks` — stores scores across 5 categories, strengths, areasForImprovement, finalAssessment

Server actions in `lib/actions/` use `firebase-admin` (server-side). Client components use `firebase/client.ts`.

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

## Conventions\
- TypeScript strict, no `any`\
- Dark mode first\

