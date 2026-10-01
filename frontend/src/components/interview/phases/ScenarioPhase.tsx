'use client';

import React, { useState } from 'react';
import { Briefcase, ArrowRight, Lightbulb } from 'lucide-react';
import type { GeneratedQuestion } from '@/lib/api';

interface ScenarioPhaseProps {
  question: GeneratedQuestion;
  onComplete: (answer: string, score: number) => void;
  onAvatarStateChange?: (state: 'idle' | 'speaking' | 'listening' | 'warning', message?: string) => void;
}

export function ScenarioPhase({ question, onComplete, onAvatarStateChange }: ScenarioPhaseProps) {
  const [answer, setAnswer] = useState<string>('');

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
    if (wordCount > 50 && wordCount % 40 === 0) {
      onAvatarStateChange?.('listening', 'Solid structural depth. Be sure to articulate trade-offs and mitigation steps.');
    }
  };

  const handleSubmit = () => {
    // Scoring heuristic: depth, clarity, structure
    let score = 70;
    if (wordCount >= 100) score += 15;
    if (wordCount >= 200) score += 10;
    if (wordCount < 40) score = Math.max(score - 25, 45);

    onComplete(answer, Math.min(score, 95));
  };

  return (
    <div className="space-y-6">
      {/* Scenario Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-slate-100">Situational & Behavioral Scenario</h3>
        </div>

        <div className="text-base text-slate-200 leading-relaxed font-medium whitespace-pre-line">
          {question.text ||
            'You discover a critical security vulnerability in a service 2 hours before a major product launch. The fix requires taking the service offline for 30 minutes. What do you do?'}
        </div>

        {question.scoringRubric && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Rubric: </span>
            {question.scoringRubric}
          </div>
        )}
      </div>

      {/* Thought Starter Tips */}
      <div className="flex items-start gap-3 bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 block mb-1">Recommended Response Structure:</strong>
          1. Immediate actions & triage &nbsp;|&nbsp; 2. Technical analysis & containment &nbsp;|&nbsp; 3. Stakeholder communication &nbsp;|&nbsp; 4. Long-term post-mortem & prevention
        </div>
      </div>

      {/* Response Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Your Comprehensive Response</span>
          <span className={wordCount >= 100 ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
            {wordCount} words {wordCount < 100 ? '(aim for 100+ words)' : '✓'}
          </span>
        </div>

        <textarea
          value={answer}
          onChange={handleChange}
          rows={10}
          placeholder="Describe your step-by-step approach, rationale, communication plan, and long-term resolution..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-y leading-relaxed font-sans"
        />
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Submit Scenario Response
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
