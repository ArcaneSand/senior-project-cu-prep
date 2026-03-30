'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { JudgeEvaluation } from '@/lib/evaluation/BaseJudge';

// Omit timestamp — it's a Firestore class and can't be passed to Client Components
type SerializableJudgeEvaluation = Omit<JudgeEvaluation, 'timestamp'>;

interface JudgeCardProps {
  evaluation: SerializableJudgeEvaluation;
  judgeNumber: number;
  totalJudges: number;
  defaultExpanded?: boolean;
}

export default function JudgeCard({
  evaluation,
  judgeNumber,
  totalJudges,
  defaultExpanded = false,
}: JudgeCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-700 rounded-xl bg-gray-900/60 overflow-hidden">
      {/* Header — always visible, click to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex justify-between items-center hover:bg-gray-800/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            Judge {judgeNumber} of {totalJudges}
          </span>
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold">
            {evaluation.judgeName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {evaluation.overallScore.toFixed(2)}
              <span className="text-sm text-gray-400 font-normal ml-1">/4.0</span>
            </div>
            <div className="text-xs text-gray-400">
              {(evaluation.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors shrink-0" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-4 space-y-5 border-t border-gray-700 bg-gray-800/20">
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-white">{evaluation.judgeName}</span>
            {' · '}Detailed Breakdown
          </p>

          {/* Dimension scores */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Dimension Scores</h4>
            {evaluation.dimensions.map((dim, i) => {
              const pct = Math.round((dim.score / dim.maxScore) * 100);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 font-medium">{dim.name}</span>
                    <span className="text-white font-semibold">{dim.score}/{dim.maxScore}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed pl-1">
                    <span className="text-gray-300 font-medium">Reasoning:</span> {dim.reasoning}
                  </p>
                  {dim.evidence.length > 0 && (
                    <ul className="space-y-1 pl-1">
                      {dim.evidence.map((quote, qi) => (
                        <li key={qi} className="text-xs text-gray-400 italic border-l-2 border-gray-600 pl-3">
                          "{quote}"
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Strengths */}
          {evaluation.strengths.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {evaluation.improvements.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Areas for Improvement
              </h4>
              <ul className="space-y-1.5">
                {evaluation.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
