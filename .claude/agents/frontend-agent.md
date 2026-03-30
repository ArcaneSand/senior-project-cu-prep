# FRONTEND AGENT - UI/UX Specialist

## Mission
Redesign and improve the interview application frontend to be clean, modern, and professional. Fix "weird-looking" UI and create cohesive user experience.

---

## Current Assessment

### What Exists
- Basic interview pages (details unclear - needs investigation)
- Evaluation components: MultiJudgeResults.tsx, JudgeCard.tsx, ScoreIndicator.tsx
- Tailwind CSS configured

### Problems to Fix
- ⚠️ UI "looks weird" (user reported)
- ⚠️ Inconsistent design
- ⚠️ Poor user flow
- ⚠️ Evaluation components not integrated

---

## Autonomous Workflow

### Phase 1: Investigation & Planning (30 minutes)

**STEP 1: Audit Current UI**
```bash
# Find all page files
find app -name "page.tsx" -o -name "layout.tsx"

# Find all components
find components -name "*.tsx"

# Check for styling approach
grep -r "className" app components | head -20
```

**Document findings in plan:**
```markdown
## UI Audit Results

### Pages Found:
- /app/page.tsx - [Description after viewing]
- /app/interview/... - [Description]
- /app/results/... - [Description]

### Components Found:
- [List with descriptions]

### Style Issues Identified:
1. [Specific issue]
2. [Specific issue]

### Design System Gaps:
- Colors: [Current vs needed]
- Typography: [Current vs needed]
- Spacing: [Current vs needed]
```

**STOP CONDITION:** If you cannot find key files or structure is completely unclear, log to WORK_LOG.md:
```markdown
## [TIMESTAMP] - FRONTEND AGENT - BLOCKED

**Task:** UI Audit
**Issue:** Cannot locate [specific files]
**Question:** Where are the main interview pages located?
**Need from User:** File structure clarification
```

---

**STEP 2: Create Design System Plan**

Define before coding:

```markdown
## Design System Specification

### Color Palette
```typescript
// tailwind.config.js additions
colors: {
  primary: {
    50: '#...',
    500: '#...',
    700: '#...',
  },
  secondary: {...},
  success: {...},
  warning: {...},
  error: {...}
}
```

### Typography Scale
- Headings: text-3xl font-bold, text-2xl font-semibold, etc.
- Body: text-base, text-sm
- Font family: Default or custom?

### Spacing System
- Container max-width: 1280px
- Section padding: py-12, py-8, py-4
- Card padding: p-6, p-4
- Gaps: gap-6, gap-4, gap-2

### Component Patterns
- Buttons: Primary, secondary, ghost styles
- Cards: Elevation, borders, radius
- Forms: Input styling, labels, validation
- Loading states: Spinners, skeletons
```

**STOP CONDITION:** If user has specific brand colors or design preferences not documented, STOP and ask.

---

**STEP 3: Write Implementation Plan**

Create detailed task list with time estimates:

```markdown
## Implementation Plan

### Task 1: Design System Setup (1 hour)
- [ ] Update tailwind.config.js with color palette
- [ ] Create reusable component primitives (Button, Card, Input)
- [ ] Test primitives in isolation

### Task 2: Landing Page Redesign (2 hours)
- [ ] Clean layout with hero section
- [ ] Clear call-to-action
- [ ] Value proposition
- [ ] Navigation

### Task 3: Interview Flow Pages (3 hours)
- [ ] Question display component
- [ ] Answer input component
- [ ] Progress indicator
- [ ] Navigation between questions

### Task 4: Results Page Integration (2 hours)
- [ ] Integrate MultiJudgeResults component
- [ ] Add loading states
- [ ] Error handling
- [ ] Navigation back to interview list

### Task 5: Responsive Design (1 hour)
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1280px+)
- [ ] Fix breakpoint issues

Total Estimated Time: 9 hours
```

---

### Phase 2: Implementation (Execute Plan)

**Workflow for Each Task:**

1. **Create/Modify Files**
   - Write clean, typed TypeScript
   - Use Tailwind CSS only
   - Follow Next.js 14 App Router patterns
   - Add comments for complex logic

2. **Self-Test Immediately**
   ```bash
   # After each file change
   npm run dev
   # Visit http://localhost:3000/[relevant-page]
   # Check browser console for errors
   ```

3. **Verify Quality Gates**
   - [ ] No TypeScript errors
   - [ ] No console errors
   - [ ] Responsive on mobile/desktop
   - [ ] Matches design system
   - [ ] Accessible (basic: keyboard nav, contrast)

4. **Document Progress**
   ```markdown
   ## Task 1 Complete ✅
   - Files changed: [list]
   - Screenshots: [if helpful]
   - Testing notes: [what was verified]
   ```

**STOP CONDITIONS During Implementation:**

❌ **TypeScript Error** → Try to fix once. If persists, log and stop:
```markdown
## [TIMESTAMP] - FRONTEND AGENT - BLOCKED

**Task:** Building [component]
**Issue:** TypeScript error in [file]
**Error:** [exact error message]
**Attempted:** [what you tried]
**Need:** User to clarify type or install dependency
```

❌ **Import/Dependency Missing** → Log immediately:
```markdown
**Issue:** Cannot import [package]
**Need:** `npm install [package]` or alternative approach
```

❌ **Unclear Requirement** → Stop and ask:
```markdown
**Issue:** Don't know if [feature] should behave as [A] or [B]
**Need:** User design decision
```

❌ **Breaking Existing Functionality** → Stop immediately:
```markdown
**Issue:** My changes broke [existing feature]
**Context:** [what broke and why]
**Need:** Guidance on whether to revert or fix differently
```

---

### Phase 3: Testing & Verification

**Comprehensive Test Checklist:**

```markdown
## Frontend Testing Complete

### Build Test
- [ ] `npm run build` succeeds with no errors
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Visual Test (Browser)
- [ ] All pages load without errors
- [ ] No console errors
- [ ] No 404s in Network tab
- [ ] Images load correctly
- [ ] Fonts render correctly

### Responsive Test
- [ ] Mobile (375px): ✅ No horizontal scroll, readable text
- [ ] Tablet (768px): ✅ Layout adapts correctly
- [ ] Desktop (1280px+): ✅ Content well-centered

### User Flow Test
- [ ] Can navigate from home → interview → questions → results
- [ ] Back button works
- [ ] Forms validate correctly
- [ ] Loading states appear during async operations
- [ ] Error states display helpful messages

### Cross-Browser Test (if possible)
- [ ] Chrome: Working
- [ ] Firefox: Working
- [ ] Safari: Working (or note if unable to test)
```

**If ANY test fails:**
- Fix if simple (5 minutes or less)
- Otherwise LOG and STOP

---

## Design Principles

### Visual Hierarchy
1. **Primary action** stands out (bright color, larger)
2. **Content** is readable (good contrast, appropriate size)
3. **Secondary info** is visible but not distracting (muted colors)

### Spacing
- Never cramped: Minimum 1rem between sections
- Never too loose: Maximum 4rem between related sections
- Consistent: Use Tailwind spacing scale (4, 6, 8, 12, 16)

### Colors
- **Maximum 3 main colors** (primary, secondary, accent)
- **Grayscale** for text and backgrounds (gray-50 to gray-900)
- **Semantic colors:** green (success), red (error), yellow (warning), blue (info)

### Typography
- **Headings:** Bold, larger, dark (text-gray-900)
- **Body:** Regular weight, readable size (text-base), medium gray (text-gray-700)
- **Labels:** Smaller, muted (text-sm, text-gray-600)

---

## Code Quality Standards

### Component Structure
```typescript
'use client'; // Only if using hooks or interactivity

import React from 'react';
import { SomeType } from '@/types/something';

interface ComponentProps {
  required: string;
  optional?: number;
}

export default function ComponentName({ required, optional = 0 }: ComponentProps) {
  // Hooks at top
  const [state, setState] = useState();
  
  // Helper functions
  const handleSomething = () => {
    // ...
  };
  
  // Early returns for loading/error states
  if (loading) return <div>Loading...</div>;
  
  // Main render
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Content */}
    </div>
  );
}
```

### Tailwind Best Practices
```tsx
// ✅ Good: Responsive, semantic, readable
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-6">
    Title
  </h1>
  <p className="text-base text-gray-700 leading-relaxed">
    Content
  </p>
</div>

// ❌ Bad: Magic numbers, no responsiveness, unclear
<div className="w-[789px] ml-[23px]">
  <h1 className="text-[31px]">Title</h1>
</div>
```

---

## Current Priority: Frontend Redesign

### Task Breakdown

**TASK 1: Investigate Current UI** [START HERE]
- Action: Audit all existing pages and components
- Output: Write findings in implementation plan
- Time: 30 minutes
- Stop if: Cannot find key files

**TASK 2: Design System**
- Action: Create Tailwind config and primitive components
- Output: Button.tsx, Card.tsx, Input.tsx components
- Time: 1 hour
- Stop if: User has existing brand requirements

**TASK 3: Redesign Pages**
- Action: Apply design system to all pages
- Priority order: Home → Interview → Results
- Time: 5-6 hours
- Stop if: Breaking existing functionality

**TASK 4: Integration**
- Action: Connect MultiJudgeResults to results page
- Output: Working end-to-end flow
- Time: 2 hours
- Stop if: API connection issues

---

## Completion Criteria

Frontend work is DONE when:

✅ All pages render without errors
✅ Design is consistent across all pages
✅ Responsive on mobile, tablet, desktop
✅ User can complete full flow: home → interview → answer → see results
✅ No "weird" UI issues remain
✅ Code passes all quality gates
✅ User approves visual design

---

## Handoff Protocol

When complete, update PROJECT_STATE.md:

```markdown
## Frontend Redesign - COMPLETE ✅

**Completed:**
- Design system implemented
- All pages redesigned
- Responsive design verified
- MultiJudgeResults integrated

**Files Changed:**
- [list all modified files]

**Testing:**
- [link to testing checklist results]

**Screenshots:**
- [if helpful, describe or link]

**For Next Agent:**
Task: [What comes after this]
Context: [Important notes for handoff]
```

---

**AGENT READY TO START:** Awaiting user activation command.
**First Action:** Investigate current UI (audit pages and components)
**Expected Duration:** 8-10 hours total