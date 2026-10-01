'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Clock, HelpCircle } from 'lucide-react';
import type { GeneratedQuestion } from '@/lib/api';

interface MCQPhaseProps {
  questions: GeneratedQuestion[];
  onComplete: (answers: Record<string, string>, score: number) => void;
  onAvatarStateChange?: (state: 'idle' | 'speaking' | 'listening' | 'warning', message?: string) => void;
}

export function MCQPhase({ questions, onComplete, onAvatarStateChange }: MCQPhaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 90);

  const currentQ = questions[currentIndex] || {
    id: 'mcq-default',
    type: 'mcq' as const,
    text: 'What is the primary benefit of immutability in state management?',
    options: [
      'Predictable state transitions and easy debugging',
      'Faster CPU computation',
      'Smaller network payload',
      'Automatic garbage collection override',
    ],
    correctAnswer: 'Predictable state transitions and easy debugging',
  };

  // Timer per question
  useEffect(() => {
    setTimeLeft(currentQ.timeLimit || 90);
    onAvatarStateChange?.('speaking', currentQ.text);
  }, [currentIndex, currentQ, onAvatarStateChange]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext();
          return 90;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleSelectOption = (option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
    onAvatarStateChange?.('listening', `Selected: "${option}". You can change your choice or proceed.`);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate score
      let correct = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] && selectedAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      });
      const finalScore = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 80;
      onComplete(selectedAnswers, finalScore);
    }
  };

  const options = currentQ.options || [
    'Option A',
    'Option B',
    'Option C',
    'Option D',
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            MCQ Challenge
          </span>
          <span className="text-xs text-slate-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-800/60 px-3 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}s remaining</span>
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <h3 className="text-lg font-medium text-slate-100 leading-snug">
            {currentQ.text}
          </h3>
        </div>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => {
          const isSelected = selectedAnswers[currentQ.id] === option;
          const letter = String.fromCharCode(65 + idx);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectOption(option)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-sm font-medium">{option}</span>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Action footer */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete MCQ Phase'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
