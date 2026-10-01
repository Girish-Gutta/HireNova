'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ArrowRight, Activity, Clock } from 'lucide-react';
import type { GeneratedQuestion } from '@/lib/api';

interface SpeakingPhaseProps {
  question: GeneratedQuestion;
  onComplete: (transcript: string, metrics: { wpm: number; durationSeconds: number; wordCount: number }, score: number) => void;
  onAvatarStateChange?: (state: 'idle' | 'speaking' | 'listening' | 'warning', message?: string) => void;
}

export function SpeakingPhase({ question, onComplete, onAvatarStateChange }: SpeakingPhaseProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentInterim = '';
      let finalSpeech = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSpeech += event.results[i][0].transcript + ' ';
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (finalSpeech) {
        setTranscript((prev) => prev + finalSpeech);
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: any) => {
      console.warn('[SpeakingPhase] Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current && isSupported) return;
    setIsRecording(true);
    setElapsedSeconds(0);
    onAvatarStateChange?.('listening', 'I am listening attentively to your response. Speak clearly at your natural pace.');

    try {
      recognitionRef.current?.start();
    } catch (_) {}

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    onAvatarStateChange?.('speaking', 'Recording paused. Review your transcript or submit your answer.');

    try {
      recognitionRef.current?.stop();
    } catch (_) {}

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Metrics computation
  const fullText = (transcript + ' ' + interimTranscript).trim();
  const wordCount = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(elapsedSeconds / 60, 0.1);
  const wpm = Math.round(wordCount / minutes);

  const handleSubmit = () => {
    stopRecording();
    // Scoring heuristic: reasonable word count (>= 30 words), reasonable pace (80-160 WPM)
    let score = 75;
    if (wordCount >= 50) score += 10;
    if (wpm >= 90 && wpm <= 160) score += 10;
    if (wordCount < 20) score = Math.max(score - 25, 45);

    onComplete(fullText, { wpm, durationSeconds: elapsedSeconds, wordCount }, Math.min(score, 95));
  };

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
          <Volume2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-slate-100">Verbal & Communication Phase</h3>
        </div>

        <p className="text-base text-slate-200 leading-relaxed font-medium">
          {question.text || 'Describe a technically complex challenge you solved and how you communicated trade-offs.'}
        </p>

        {question.scoringRubric && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Evaluation Focus: </span>
            {question.scoringRubric}
          </div>
        )}
      </div>

      {/* Recording Control & Audio Visualizer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              {isRecording ? 'Listening & Transcribing...' : 'Ready to Record'}
            </h4>
            <p className="text-xs text-slate-400">
              {isRecording
                ? 'Click the red button when finished speaking'
                : 'Click the microphone to start your verbal answer'}
            </p>
          </div>
        </div>

        {/* Real-time speech statistics */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-300 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{elapsedSeconds}s</span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{wpm} WPM</span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div>{wordCount} words</div>
        </div>
      </div>

      {/* Live Transcript Display / Manual Edit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Live Speech Transcription (editable)</span>
          {!isSupported && (
            <span className="text-amber-400">Speech API unavailable in this browser; you can type your answer directly.</span>
          )}
        </div>

        <textarea
          value={fullText}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={
            isRecording
              ? 'Listening... words will appear here as you speak.'
              : 'Your spoken transcript will appear here. You can also edit or type manually.'
          }
          className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
        />
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Submit Verbal Answer
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
