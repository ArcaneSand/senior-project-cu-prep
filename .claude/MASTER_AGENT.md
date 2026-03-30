# MASTER AGENT - Project Coordinator

## Project: AI-Powered Mock Interview System

### Current Status: PHASE 2 - Integration & Frontend Redesign

**What's Working:**
- ✅ Multi-judge evaluation system (StarJudge + CompetencyJudge)
- ✅ Statistical aggregation with agreement metrics
- ✅ API endpoint: POST /api/evaluate-multi
- ✅ Firebase storage for evaluations
- ✅ Basic UI components (MultiJudgeResults, JudgeCard, ScoreIndicator)

**What Needs Work:**
- ⚠️ Frontend integration incomplete (judge system not connected to existing UI)
- ⚠️ Current UI "looks weird" (needs redesign)
- ⚠️ No user flow from interview → evaluation → results

---

## Architecture Overview

### Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** Firebase Firestore
- **AI:** Gemini API via Vercel AI SDK (`@ai-sdk/google`)
- **Voice:** VAPI (voice interaction, separate from evaluation)

### Environment Variables
```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

### Project Structure
```
/app
  /api
    /evaluate-multi         # Multi-judge evaluation endpoint
    /evaluations/[id]       # Fetch evaluation by ID
  /interview/[id]           # Interview session pages (EXISTING)
  /results/[id]             # Results display (NEEDS INTEGRATION)

/lib
  /evaluation
    BaseJudge.ts            # Abstract judge class
    Aggregator.ts           # Statistical aggregation
    /judges
      StarJudge.ts          # STAR method evaluator
      CompetencyJudge.ts    # Competency evaluator
    /rubrics
      StarRubric.ts         # STAR evaluation criteria
      CompetencyRubric.ts   # Competency criteria

/components
  /evaluation
    MultiJudgeResults.tsx   # Main results display
    JudgeCard.tsx           # Individual judge card
    ScoreIndicator.tsx      # Score visualization

/firebase
  config.ts                 # Firebase initialization
  evaluation.ts             # Evaluation CRUD helpers

/types
  evaluation.ts             # TypeScript definitions
```

---

## Agent Delegation Protocol

### When to Use Which Agent

**Frontend Agent** (`frontend-agent.md`)
- UI/UX redesign tasks
- Component creation/modification
- Styling and layout fixes
- User flow implementation
- Responsive design

**API Agent** (`api-agent.md`)
- API endpoint creation/modification
- Request/response handling
- Error handling
- Backend logic

**Evaluation Agent** (`evaluation-agent.md`)
- Judge system modifications
- Rubric updates
- Aggregation logic
- Evaluation algorithm improvements

**Integration Agent** (`integration-agent.md`)
- Connecting frontend ↔ API ↔ evaluation
- End-to-end user flows
- Data flow between systems
- Full-stack features

---

## Current Priority Tasks

### PHASE 2 GOALS (Current Sprint)

**Task 1: Frontend Redesign** [PRIORITY: HIGH]
- Agent: `frontend-agent.md`
- Scope: Redesign interview UI to be clean, modern, professional
- Deliverables: 
  - Updated landing/home page
  - Improved interview question UI
  - Better results display layout
  - Consistent design system

**Task 2: Judge System Integration** [PRIORITY: HIGH]
- Agent: `integration-agent.md`
- Scope: Connect existing interview flow to multi-judge evaluation
- Deliverables:
  - Submit answer → trigger evaluation API
  - Store evaluation in Firebase
  - Display results on results page
  - Handle loading states and errors

**Task 3: User Flow Completion** [PRIORITY: MEDIUM]
- Agent: `integration-agent.md`
- Scope: Complete end-to-end interview experience
- Deliverables:
  - Interview setup → questions → answers → evaluation → results
  - Navigation between steps
  - Progress indicators

---

## Work Log System

### When Things Go Wrong

**Protocol:**
1. **Stop immediately** when encountering:
   - Syntax errors that can't be fixed in 2 attempts
   - Missing dependencies or configuration
   - Unclear requirements or conflicting instructions
   - API/Firebase connection issues
   - Unexpected behavior that needs user clarification

2. **Log the issue** in `WORK_LOG.md`:
   ```markdown
   ## [TIMESTAMP] - [AGENT] - BLOCKED
   
   **Task:** Brief description
   **Issue:** What went wrong
   **Context:** Relevant code/files
   **Question for User:** What needs clarification
   **Next Steps:** What to do after resolution
   ```

3. **Wait for user input** - Don't proceed until user responds

4. **Resume work** after user provides:
   - Missing information
   - Corrected requirements
   - Environment fixes
   - Design decisions

---

## Quality Gates

### Before Marking Task Complete

Every agent must verify:
- ✅ Code runs without errors
- ✅ TypeScript types are correct
- ✅ No console errors in browser
- ✅ Changes work with existing code
- ✅ Responsive on mobile/desktop
- ✅ Follows project conventions (Tailwind, Next.js patterns)

### Testing Checklist
- [ ] Dev server starts: `npm run dev`
- [ ] No TypeScript errors: `npm run build`
- [ ] Page loads in browser
- [ ] User actions work as expected
- [ ] API calls succeed (check Network tab)
- [ ] Firebase saves data correctly

---

## Communication Protocol

### Status Updates Format

```markdown
## [AGENT NAME] Status Update

**Task:** What you're working on
**Progress:** What's been completed
**Next:** What's coming next
**Blockers:** None | [Issue description]
**ETA:** X hours remaining
```

### Handoff Between Agents

When one agent completes work that another needs:

```markdown
## Handoff to [NEXT AGENT]

**Completed:**
- File: path/to/file.tsx
- Changes: What was done
- Tested: ✅ Working

**For Next Agent:**
- File: path/to/next/file.tsx
- Task: What needs to happen
- Context: Important notes
```

---

## Project Conventions

### Code Style
- **TypeScript:** Strict mode, explicit types
- **React:** Functional components, hooks
- **Styling:** Tailwind CSS only (no CSS modules/styled-components)
- **File naming:** kebab-case for files, PascalCase for components
- **Imports:** Use `@/` alias for project root

### Git Workflow (if applicable)
- Meaningful commit messages
- One feature per commit
- Test before committing

### Error Handling Pattern
```typescript
try {
  const result = await someOperation();
  if (!result) {
    throw new Error('Operation failed');
  }
  return result;
} catch (error) {
  console.error('Context:', error);
  throw new Error(`User-friendly message: ${error.message}`);
}
```

---

## Next Steps

**User:** Review this master agent setup, then activate specific agents:

1. Review `.claude/agents/frontend-agent.md` for UI redesign
2. Review `.claude/agents/integration-agent.md` for judge system integration
3. Approve agent tasks or provide modifications
4. Agents begin autonomous work with planning → implementation → testing
5. Agents log blockers in `WORK_LOG.md` when stuck

---

**Last Updated:** [User should update this when making changes]
**Current Phase:** PHASE 2 - Integration & Frontend Redesign
**Active Agents:** None (awaiting user activation)