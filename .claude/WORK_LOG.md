# WORK LOG - Agent Activity & Issue Tracking

## How This Works

**Agents log here when:**
- ✋ BLOCKED on something (missing info, unclear requirements, errors)
- ✅ COMPLETED a major task
- 🔄 HANDOFF to another agent
- ⚠️ ENCOUNTERED an issue but continued (non-blocking)

**User reviews and:**
- Provides missing information
- Makes design decisions
- Fixes environment issues
- Approves handoffs

---

## Active Issues (BLOCKERS)

<!-- Agents add entries here when stopped -->

### Template (Copy this when logging):
```markdown
## [YYYY-MM-DD HH:MM] - [AGENT NAME] - BLOCKED

**Task:** What were you working on?
**Issue:** What went wrong or what's unclear?
**Context:** 
- Relevant files: [list]
- What you tried: [describe attempts]
- Error message: [if applicable]

**Question for User:**
[Specific question that needs answering]

**Next Steps After Resolution:**
1. [What to do once user responds]
2. [...]

**Status:** 🔴 WAITING FOR USER
```

---

<!-- EXAMPLE ENTRY - DELETE WHEN CREATING REAL LOG -->

## [2024-03-28 14:30] - FRONTEND AGENT - BLOCKED (EXAMPLE)

**Task:** Redesigning interview question UI
**Issue:** Cannot find existing interview pages
**Context:**
- Searched: app/interview/, components/interview/
- Found: Only /app/page.tsx (landing page)
- Missing: Interview session flow pages

**Question for User:**
Where are the interview pages located? Are they:
1. In a different directory structure?
2. Not yet created (I should create from scratch)?
3. Using a different naming convention?

**Next Steps After Resolution:**
1. User provides directory path
2. I audit the existing UI
3. Create redesign plan
4. Begin implementation

**Status:** 🔴 WAITING FOR USER

<!-- END EXAMPLE -->

---

## Resolved Issues

<!-- Move entries here once user has responded and work continues -->

---

## Completed Tasks

<!-- Agents log major milestones here -->

### Template:
```markdown
## [YYYY-MM-DD] - [AGENT NAME] - COMPLETED: [Task Name]

**Duration:** X hours
**Files Changed:**
- path/to/file1.tsx
- path/to/file2.ts

**Testing:**
- [x] Tests passed
- [x] No console errors
- [x] Responsive design verified

**Next:**
[What comes after this, or HANDOFF to another agent]
```

---

<!-- EXAMPLE ENTRY - DELETE WHEN CREATING REAL LOG -->

## [2024-03-28] - INTEGRATION AGENT - COMPLETED: Evaluation Trigger Integration (EXAMPLE)

**Duration:** 3 hours
**Files Changed:**
- app/interview/[id]/page.tsx (added evaluation trigger)
- firebase/interview.ts (added saveAnswer function)
- types/interview.ts (updated Answer type)

**Testing:**
- [x] Answer submission triggers evaluation
- [x] Loading state appears during evaluation
- [x] EvaluationId links to answer
- [x] Error handling works
- [x] No console errors

**Next:**
HANDOFF to FRONTEND AGENT for:
- Loading spinner design improvement
- Error message styling
- Smooth transitions

**Status:** ✅ COMPLETE

<!-- END EXAMPLE -->

---

## Warnings (Non-Blocking Issues)

<!-- Log things that work but aren't ideal -->

### Template:
```markdown
## [YYYY-MM-DD] - [AGENT] - WARNING: [Issue]

**What:** Brief description
**Impact:** Low | Medium (works but could be better)
**Workaround:** How it's handled currently
**TODO:** Future improvement needed
```

---

## Agent Handoffs

<!-- Track when work passes between agents -->

### Template:
```markdown
## [YYYY-MM-DD] - HANDOFF: [FROM AGENT] → [TO AGENT]

**Completed by [FROM AGENT]:**
- [List deliverables]

**For [TO AGENT]:**
- Task: [What needs to happen]
- Context: [Important notes]
- Files: [Where to start]
```

---

## Daily Progress Summary

<!-- Quick snapshot for user to review -->

### [Date]

**Agents Active:** [List]
**Tasks Started:** X
**Tasks Completed:** Y
**Current Blockers:** Z
**Hours Logged:** ~X hours total

**Key Achievements:**
- [Major milestone 1]
- [Major milestone 2]

**Next Up:**
- [Planned task 1]
- [Planned task 2]

---

## Notes & Decisions

<!-- User can log decisions here for agents to reference -->

### Template:
```markdown
## [Date] - USER DECISION: [Topic]

**Decision:** [What was decided]
**Reasoning:** [Why]
**Affects:** [Which agents/tasks]
**Agents:** Please read before continuing work on [related task]
```

---

<!-- Add new entries above this line -->

---

**Log Created:** [Date]
**Last Updated:** [Date]
**Total Entries:** 0 blocked, 0 completed, 0 handoffs