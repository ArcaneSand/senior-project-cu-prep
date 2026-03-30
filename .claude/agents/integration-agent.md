# INTEGRATION AGENT - Full-Stack Connector

## Mission
Connect the multi-judge evaluation system to the existing interview flow. Create seamless end-to-end experience from interview question → answer submission → evaluation → results display.

---

## Current State

### What Exists (Confirmed Working)
✅ Multi-judge evaluation API: `POST /api/evaluate-multi`
✅ Evaluation storage: Firebase Firestore
✅ Evaluation retrieval: `getEvaluationsByInterview(interviewId)`
✅ UI components: MultiJudgeResults, JudgeCard, ScoreIndicator

### What's Missing (Integration Gaps)
❌ Interview answer submission doesn't trigger evaluation
❌ Results page doesn't fetch/display evaluations
❌ No loading states during evaluation (takes 3-5 seconds)
❌ No error handling for evaluation failures
❌ No connection between interview session and evaluation results

---

## Autonomous Workflow

### Phase 1: System Mapping (1 hour)

**STEP 1: Trace Existing Interview Flow**

Investigate and document:

```bash
# Find interview-related pages
find app -path "*interview*" -name "*.tsx"

# Find interview state management
grep -r "interview" app --include="*.tsx" --include="*.ts" | grep -i "state\|context"

# Find answer submission logic
grep -r "submit\|answer" app --include="*.tsx" | head -30
```

**Document in mapping:**
```markdown
## Interview Flow Map

### Current User Journey
1. User starts interview: [File: app/...] 
2. User sees question: [File: app/...]
3. User types answer: [Component: ...]
4. User clicks submit: [Handler: ...]
5. ??? (What happens now - needs investigation)
6. User sees results: [File: app/...]

### Data Flow
Interview Session:
- Structure: {id, userId, questions[], createdAt...}
- Storage: Firebase collection "interviews"
- State management: [Context? Component state? Server?]

Answer Submission:
- Current behavior: [Describe what happens]
- Storage: [Where do answers go?]
- Format: [What data structure?]

### Integration Points Needed
Point A: After answer submit → Trigger evaluation API
Point B: On results page → Fetch evaluations and display
Point C: Error handling → Show user-friendly messages
```

**STOP CONDITION:** If interview flow is completely unclear or files don't exist:
```markdown
## [TIMESTAMP] - INTEGRATION AGENT - BLOCKED

**Task:** Map interview flow
**Issue:** Cannot find interview submission logic
**Files checked:** [list]
**Need from User:** 
- Where is the interview session created?
- Where/how are answers currently stored?
- What triggers navigation to results page?
```

---

**STEP 2: Design Integration Architecture**

Create detailed integration spec:

```markdown
## Integration Architecture

### Data Model

Interview Session:
{
  id: string;
  userId: string;
  questions: Question[];
  answers: Answer[];  // May need to add this
  createdAt: Timestamp;
  status: 'in_progress' | 'completed';
}

Answer:
{
  questionId: string;
  questionText: string;
  answerText: string;
  submittedAt: Timestamp;
  evaluationId?: string;  // Link to evaluation
}

Evaluation (existing):
{
  interviewId: string;
  questionId: string;
  // ... rest from StoredEvaluation type
}

### Flow Sequence

1. User submits answer:
   - Save answer to interview session
   - Trigger evaluation API call
   - Show loading state
   - Store evaluationId in answer record
   - Navigate to next question or results

2. User views results:
   - Fetch all evaluations for interview
   - Display using MultiJudgeResults component
   - Show overall interview score
   - Allow review of individual questions

3. Error cases:
   - API timeout: Show retry option
   - Invalid answer: Show validation message
   - Network error: Save locally, retry later
```

---

### Phase 2: Implementation

**TASK 1: Add Evaluation Trigger to Answer Submission**

**Files to modify:**
- Interview question component (needs investigation)
- Answer submission handler

**Implementation:**
```typescript
// In answer submission handler
async function handleAnswerSubmit() {
  try {
    // 1. Save answer to interview session
    const answer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answerText: userAnswer,
      submittedAt: new Date()
    };
    
    await saveAnswerToInterview(interviewId, answer);
    
    // 2. Trigger evaluation (non-blocking)
    setIsEvaluating(true);
    
    const evalResponse = await fetch('/api/evaluate-multi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interviewId,
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        answer: userAnswer,
        context: { questionType: currentQuestion.type }
      })
    });
    
    const evalResult = await evalResponse.json();
    
    if (evalResult.success) {
      // 3. Store evaluation ID with answer
      await updateAnswerWithEvaluationId(
        interviewId,
        answer.questionId,
        evalResult.evaluationId
      );
      
      console.log('Evaluation complete:', evalResult.preview.score);
    } else {
      console.error('Evaluation failed:', evalResult.error);
      // Don't block user - they can continue interview
    }
    
    setIsEvaluating(false);
    
    // 4. Navigate to next question or results
    if (hasMoreQuestions) {
      goToNextQuestion();
    } else {
      router.push(`/interview/${interviewId}/results`);
    }
    
  } catch (error) {
    console.error('Submit failed:', error);
    setError('Failed to submit answer. Please try again.');
    setIsEvaluating(false);
  }
}
```

**Quality Gates:**
- [ ] Answer saves even if evaluation fails
- [ ] Loading state shows during evaluation
- [ ] User can't submit duplicate answers
- [ ] Error messages are user-friendly
- [ ] Navigation works correctly

**STOP CONDITIONS:**
- Can't find answer submission handler → LOG and ask user
- Firebase save fails → LOG with error details
- Don't know interview data structure → LOG and ask for schema

---

**TASK 2: Create Results Page Integration**

**File:** `app/interview/[interviewId]/results/page.tsx`

**Implementation:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MultiJudgeResults from '@/components/evaluation/MultiJudgeResults';
import { getEvaluationsByInterview } from '@/firebase/evaluation';
import { StoredEvaluation } from '@/types/evaluation';

export default function InterviewResultsPage() {
  const params = useParams();
  const interviewId = params.interviewId as string;
  
  const [evaluations, setEvaluations] = useState<StoredEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const data = await getEvaluationsByInterview(interviewId);
        
        if (data.length === 0) {
          setError('No evaluations found. Answers may still be processing.');
        } else {
          setEvaluations(data);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadResults();
  }, [interviewId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Results
          </h1>
          <p className="text-gray-600">
            Review your performance on each question
          </p>
        </div>
        
        <div className="space-y-12">
          {evaluations.map((evaluation, idx) => (
            <div key={evaluation.questionId} className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Question {idx + 1} of {evaluations.length}
              </h2>
              <MultiJudgeResults
                evaluation={evaluation}
                showQuestion={true}
                showAnswer={true}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Quality Gates:**
- [ ] Loading spinner shows while fetching
- [ ] Error state displays helpful message
- [ ] Empty state handles no evaluations
- [ ] Multiple evaluations display correctly
- [ ] Navigation back to home works

---

**TASK 3: Add Loading States to Interview UI**

During evaluation (3-5 seconds), show progress:

```typescript
// In interview component
{isEvaluating && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Evaluating Your Answer
        </h3>
        <p className="text-gray-600 mb-4">
          Our AI judges are reviewing your response...
        </p>
        <div className="text-sm text-gray-500">
          This usually takes 3-5 seconds
        </div>
      </div>
    </div>
  </div>
)}
```

---

### Phase 3: Testing Integration

**End-to-End Test Checklist:**

```markdown
## Integration Testing

### Happy Path Test
1. [ ] Start new interview
2. [ ] Answer first question
3. [ ] Click submit
4. [ ] See loading spinner (3-5 seconds)
5. [ ] Loading completes, advance to next question
6. [ ] Answer all questions
7. [ ] Navigate to results page
8. [ ] See all evaluations displayed
9. [ ] Expand judge cards to see details
10. [ ] Scores match expected range (excellent answer ~3.5+)

### Edge Case Tests
- [ ] Submit empty answer → Show validation error
- [ ] Network timeout → Show retry option, don't lose answer
- [ ] Evaluation API fails → Save answer, continue interview, warn user
- [ ] Navigate away during evaluation → Answer still saves
- [ ] Refresh results page → Evaluations reload correctly

### Data Persistence Tests
- [ ] Answer saves to Firebase
- [ ] EvaluationId links to answer
- [ ] Can reload results page and see same data
- [ ] Multiple interviews don't interfere

### Performance Tests
- [ ] Evaluation completes in < 10 seconds
- [ ] Page loads in < 2 seconds
- [ ] No memory leaks (check DevTools)
```

**If ANY test fails:**
- Simple fix (< 5 min) → Fix and re-test
- Complex issue → LOG and STOP

---

## Error Handling Strategy

### User-Facing Errors

**API Timeout (> 30 seconds):**
```typescript
{
  title: "Evaluation Taking Longer Than Expected",
  message: "We're still processing your answer. You can continue the interview and check results later.",
  action: "Continue Interview"
}
```

**Network Error:**
```typescript
{
  title: "Connection Issue",
  message: "Your answer has been saved. We'll evaluate it when connection is restored.",
  action: "Continue"
}
```

**Validation Error:**
```typescript
{
  title: "Answer Too Short",
  message: "Please provide a more detailed answer (minimum 50 characters).",
  action: "Edit Answer"
}
```

### Retry Logic

```typescript
async function evaluateWithRetry(data, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/evaluate-multi', {
        method: 'POST',
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // Server error, retry
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1))); // Exponential backoff
        continue;
      }
      
      throw new Error('Evaluation failed after retries');
      
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
}
```

---

## Firebase Integration Points

### Required Firebase Functions

**Save Answer:**
```typescript
// firebase/interview.ts
export async function saveAnswerToInterview(
  interviewId: string,
  answer: {
    questionId: string;
    questionText: string;
    answerText: string;
    submittedAt: Date;
  }
): Promise<void> {
  const interviewRef = doc(db, 'interviews', interviewId);
  await updateDoc(interviewRef, {
    answers: arrayUnion(answer)
  });
}
```

**Link Evaluation:**
```typescript
export async function linkEvaluationToAnswer(
  interviewId: string,
  questionId: string,
  evaluationId: string
): Promise<void> {
  // Implementation depends on data structure
  // May need to update answer object in array
}
```

**STOP CONDITION:** If Firebase schema is different than expected, LOG:
```markdown
**Issue:** Interview document structure doesn't match expected schema
**Expected:** {answers: Array}
**Found:** [describe actual structure]
**Need:** Clarification on correct data model
```

---

## Completion Criteria

Integration is DONE when:

✅ User can complete full interview flow
✅ Answers trigger evaluation automatically
✅ Results page displays all evaluations
✅ Loading states appear during async operations
✅ Errors are handled gracefully
✅ Data persists correctly in Firebase
✅ No console errors during normal flow
✅ All edge cases handled

---

## Handoff to Frontend Agent

When integration is complete but UI needs polish:

```markdown
## Handoff to FRONTEND AGENT

**Integration Complete:**
- Evaluation trigger working
- Results page functional
- Error handling in place

**UI Polish Needed:**
- Loading spinner design
- Error message styling
- Results page layout improvements
- Transitions between steps

**Files to Review:**
- app/interview/[id]/page.tsx
- app/interview/[id]/results/page.tsx
```

---

**AGENT READY TO START:** Awaiting user activation
**First Action:** Map existing interview flow
**Expected Duration:** 4-6 hours total