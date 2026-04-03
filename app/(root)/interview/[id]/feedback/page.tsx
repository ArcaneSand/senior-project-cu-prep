'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, Home, RotateCcw, Brain, RefreshCw } from 'lucide-react';
import { getEvaluationByInterview, getEvaluationById } from '@/lib/actions/evaluation.action';
import { getInterviewById } from '@/lib/actions/general.action';
import { StoredEvaluation } from '@/types/evaluation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [evaluation, setEvaluation] = useState<StoredEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [reevalMessage, setReevalMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvaluation() {
      try {
        setLoading(true);
        const data = await getEvaluationByInterview(interviewId);
        if (!data) {
          setError('No evaluation found for this interview.');
          return;
        }
        setEvaluation(data);
      } catch (err) {
        console.error('[Feedback] Error loading evaluation:', err);
        setError('Failed to load evaluation.');
      } finally {
        setLoading(false);
      }
    }
    loadEvaluation();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error ?? 'Evaluation not found'}</p>
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  async function handleReevaluate() {
    try {
      setIsReevaluating(true);
      setReevalMessage(null);

      console.log('[Reevaluate] Fetching interview data...');
      const interview = await getInterviewById(interviewId);
      if (!interview) throw new Error('Interview not found');

      if (!interview.transcript) {
        throw new Error('No transcript saved for this interview. Complete a new interview first.');
      }

      console.log('[Reevaluate] Calling evaluation API...');
      const response = await fetch('/api/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          userId: interview.userId,
          fullTranscript: interview.transcript,
          questions: interview.questions,
          interviewContext: {
            role:  interview.role  || 'Candidate',
            field: interview.field || 'General',
            stage: (interview.stage as 'student' | 'freshgrad' | 'experienced') || 'experienced',
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Reevaluation failed');
      }

      const result = await response.json();
      console.log('[Reevaluate] Success!', result);

      const newEvaluation = await getEvaluationById(result.evaluationId);
      if (newEvaluation) setEvaluation(newEvaluation);

      setReevalMessage(`Reevaluation complete! New band score: ${result.preview.overallScore}/5`);
    } catch (err) {
      console.error('[Reevaluate] Error:', err);
      setReevalMessage(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsReevaluating(false);
    }
  }

  const rubricDimensions = [
    { label: 'Coherence & Structure', value: evaluation.centralRubricScores.coherenceStructure },
    { label: 'Fluency',               value: evaluation.centralRubricScores.fluency },
    { label: 'Technical',             value: evaluation.centralRubricScores.technical },
    { label: 'Soft Skills',           value: evaluation.centralRubricScores.softSkill },
  ];

  const scoreColor = (v: number) =>
    v >= 4 ? 'text-green-600 dark:text-green-400'
    : v >= 3 ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400';

  const getBandDescription = (score: number): string => {
    if (score >= 5) return "Perfect! Outstanding performance across the board";
    if (score >= 4) return "Great performance! You're close to mastering this";
    if (score >= 2.5) return "Good progress! Keep refining your skills";
    return "Let's practice more — every expert was once a beginner!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Interview Complete
            </span>
          </div>
          <h1 className="text-3xl font-bold">Your Interview Feedback</h1>
        </div>

        {/* ── SECTION 1: Overall Score + Confidence (Always Visible) ── */}
        <div className="rounded-2xl border bg-card shadow-lg p-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Score circle */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <div className="w-24 h-24 rounded-full bg-background flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400 leading-none">
                    {evaluation.overallScore}
                  </span>
                  <span className="text-xs text-muted-foreground">Band / 5</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold">Overall Band Score</h2>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">
                {getBandDescription(evaluation.overallScore)}
              </p>
              <p className="text-muted-foreground">
                Confidence: <span className="font-semibold text-foreground">{Math.round(evaluation.confidenceScore * 100)}%</span>
              </p>
              {evaluation.judgeAgreement.disagreements.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Judges differed on: {evaluation.judgeAgreement.disagreements.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Central Rubric Breakdown ── */}
        <div className="rounded-2xl border bg-card shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Rubric Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rubricDimensions.map((dim) => (
              <div key={dim.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{dim.label}</span>
                  <span className={`font-bold ${scoreColor(dim.value)}`}>
                    {dim.value.toFixed(1)}<span className="text-muted-foreground font-normal">/5</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${(dim.value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top 3 Strengths + Improvements (Always Visible) ── */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-bold text-lg">Key Strengths</h3>
            </div>
            <ol className="space-y-3">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border bg-card shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-lg">Areas for Improvement</h3>
            </div>
            <ol className="space-y-3">
              {evaluation.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{imp}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── SECTION 2: Question Details (Collapsed by Default) ── */}
        {evaluation.questions && evaluation.questions.length > 0 && (
          <Collapsible open={questionsOpen} onOpenChange={setQuestionsOpen}>
            <CollapsibleTrigger className="w-full rounded-2xl border bg-card shadow p-6 hover:bg-secondary/40 transition-colors">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  📝 Question Details
                  <span className="text-sm text-muted-foreground font-normal">
                    ({evaluation.questions.length} questions)
                  </span>
                </h2>
                {questionsOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 pt-4">
              {evaluation.questions.map((q, qIdx) => (
                <QuestionCard
                  key={q.questionId}
                  question={q}
                  index={qIdx}
                  total={evaluation.questions.length}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => router.push(`/interview/${interviewId}`)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Interview
          </Button>
          <Button
            className="flex-1"
            onClick={handleReevaluate}
            disabled={isReevaluating}
            title="Retrigger AI evaluation using the saved transcript — no need to redo the interview"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isReevaluating ? 'animate-spin' : ''}`} />
            {isReevaluating ? 'Reevaluating...' : 'Reevaluate'}
          </Button>
        </div>

        {/* Reevaluation status */}
        {isReevaluating && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-4 text-sm text-blue-700 dark:text-blue-400">
            <p className="font-medium">⏳ Reevaluating interview… this takes 15–25 seconds.</p>
            <p className="text-xs mt-1 opacity-75">StarJudge → CompetencyJudge → Aggregator</p>
          </div>
        )}
        {reevalMessage && !isReevaluating && (
          <div className={`rounded-xl border p-4 text-sm ${
            reevalMessage.startsWith('Failed')
              ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 text-red-700 dark:text-red-400'
              : 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 text-green-700 dark:text-green-400'
          }`}>
            {reevalMessage}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-component: single question card ─────────────────────────────────────

function QuestionCard({
  question,
  index,
  total,
}: {
  question: StoredEvaluation['questions'][number];
  index: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full rounded-xl border bg-card p-5 hover:bg-secondary/30 transition-colors text-left">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Question {index + 1} of {total}
            </p>
            <p className="font-medium leading-snug">{question.question}</p>
          </div>
          {open ? (
            <ChevronUp className="shrink-0 h-5 w-5 text-muted-foreground mt-1" />
          ) : (
            <ChevronDown className="shrink-0 h-5 w-5 text-muted-foreground mt-1" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="rounded-xl border border-t-0 bg-secondary/20 px-5 pb-5 space-y-4">
        {/* Answer */}
        {question.answer && (
          <div className="pt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Your Answer</p>
            <p className="text-sm text-muted-foreground leading-relaxed bg-background/60 rounded-lg p-3">
              {question.answer}
            </p>
          </div>
        )}

        {/* Judge evaluations — each collapsed */}
        {question.judgeEvaluations?.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground pt-1">Judge Evaluations</p>
            {question.judgeEvaluations.map((judge, jIdx) => (
              <JudgeCard
                key={judge.judgeId}
                judge={judge}
                index={jIdx}
                total={question.judgeEvaluations.length}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Helper: coerce a judge strength/improvement item to a display string ──────
function toDisplayString(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    if (typeof obj.improvement === 'string') {
      return obj.problem ? `${obj.problem} → ${obj.improvement}` : obj.improvement;
    }
    if (typeof obj.problem === 'string') return obj.problem;
    return JSON.stringify(obj);
  }
  return String(item);
}

// ── Sub-component: single judge evaluation card ──────────────────────────────

function JudgeCard({
  judge,
  index,
  total,
}: {
  judge: StoredEvaluation['questions'][number]['judgeEvaluations'][number];
  index: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full rounded-lg border bg-card px-4 py-3 hover:bg-secondary/30 transition-colors text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Judge {index + 1} of {total}
            </p>
            <p className="font-medium text-sm">{judge.judgeName}</p>
            <p className="text-xs text-muted-foreground">
              Score: {judge.overallScore.toFixed(1)} / 5.0
            </p>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="rounded-b-lg border border-t-0 bg-card px-4 pb-4 space-y-4">
        {/* Dimensions */}
        <div className="pt-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Dimension Scores</p>
          <div className="space-y-2">
            {judge.dimensions.map((dim, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-medium">{dim.name}</span>
                  <span className="font-bold">{dim.score}/{dim.maxScore}</span>
                </div>
                {dim.reasoning && (
                  <p className="text-xs text-muted-foreground">{dim.reasoning}</p>
                )}
                {dim.evidence?.length > 0 && (
                  <p className="text-xs italic text-muted-foreground mt-0.5">
                    &quot;{dim.evidence[0]}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        {judge.strengths?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✓ Strengths</p>
            <ul className="space-y-1">
              {judge.strengths.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-green-500 shrink-0">•</span>
                  {toDisplayString(s)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {judge.improvements?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">→ Improvements</p>
            <ul className="space-y-1">
              {judge.improvements.map((imp, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-orange-500 shrink-0">•</span>
                  {toDisplayString(imp)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
