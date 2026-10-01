'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchSessionByToken,
  generateQuestions,
  submitPhaseResult,
  completeInterview,
  type SessionVerificationResponse,
  type GeneratedQuestion,
  type InterviewPhaseConfig,
} from '@/lib/api';
import { useProctoring } from '@/hooks/useProctoring';
import { AvatarPresence, type AvatarState } from '@/components/interview/AvatarPresence';
import { MCQPhase } from '@/components/interview/phases/MCQPhase';
import { CodingPhase } from '@/components/interview/phases/CodingPhase';
import { SpeakingPhase } from '@/components/interview/phases/SpeakingPhase';
import { ScenarioPhase } from '@/components/interview/phases/ScenarioPhase';
import {
  Loader2,
  AlertCircle,
  Clock,
  Video,
  VideoOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function InterviewRoomPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionData, setSessionData] = useState<SessionVerificationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Phase Progression State
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [currentQuestions, setCurrentQuestions] = useState<GeneratedQuestion[]>([]);
  const [isPhaseLoading, setIsPhaseLoading] = useState<boolean>(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [avatarMessage, setAvatarMessage] = useState<string>('Welcome! I will guide you through each phase.');

  // Proctoring Hook
  const { isWebcamActive, videoRef, violations } = useProctoring(
    sessionData?.session?.id || null
  );

  // 1. Initial verification on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      try {
        const data = await fetchSessionByToken(token);
        if (!isMounted) return;

        if (data.session.status === 'completed') {
          router.replace(`/interview/${token}/complete`);
          return;
        }

        setSessionData(data);
        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMsg(err.message || 'Failed to verify interview token.');
        setIsLoading(false);
      }
    }
    loadSession();
    return () => {
      isMounted = false;
    };
  }, [token, router]);

  // 2. Load questions whenever phase changes
  const phases: InterviewPhaseConfig[] = sessionData?.phases || [
    { type: 'mcq', order: 1, durationMinutes: 10, weight: 0.15 },
    { type: 'coding', order: 2, durationMinutes: 30, weight: 0.35 },
    { type: 'speaking', order: 3, durationMinutes: 15, weight: 0.20 },
    { type: 'scenario', order: 4, durationMinutes: 15, weight: 0.30 },
  ];

  const currentPhase = phases[currentPhaseIndex];

  useEffect(() => {
    if (!sessionData || !currentPhase) return;
    const sessionId = sessionData.session.id;
    const phaseType = (currentPhase.type === 'listening' ? 'speaking' : currentPhase.type) as
      | 'mcq'
      | 'coding'
      | 'speaking'
      | 'scenario';

    let isMounted = true;
    async function loadPhaseQuestions() {
      setIsPhaseLoading(true);
      setAvatarState('speaking');
      setAvatarMessage(`Welcome to the ${phaseType.toUpperCase()} phase. Generating tailored questions...`);

      try {
        const questions = await generateQuestions(sessionId, phaseType);
        if (!isMounted) return;
        setCurrentQuestions(questions);
        setIsPhaseLoading(false);
        setAvatarState('idle');
        setAvatarMessage(`Please review the prompt and begin your ${phaseType.toUpperCase()} response.`);
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Question generation failed, using defaults:', err.message);
        setIsPhaseLoading(false);
        setAvatarState('idle');
      }
    }

    loadPhaseQuestions();
    return () => {
      isMounted = false;
    };
  }, [currentPhaseIndex, sessionData]);

  // 3. Move to next phase or complete interview
  const handlePhaseComplete = async (rawAnswers: any, weightedScore: number) => {
    setIsPhaseLoading(true);
    setAvatarState('listening');
    setAvatarMessage('Recording your responses and sub-scores...');

    const phaseType = (currentPhase.type === 'listening' ? 'speaking' : currentPhase.type) as
      | 'mcq'
      | 'coding'
      | 'speaking'
      | 'scenario';

    try {
      await submitPhaseResult(token, {
        phaseType,
        rawAnswers,
        weightedScore,
      });

      if (currentPhaseIndex < phases.length - 1) {
        setCurrentPhaseIndex((prev) => prev + 1);
      } else {
        // All phases finished! Trigger completion & scoring agent
        setAvatarState('speaking');
        setAvatarMessage('All phases finished! Aggregating final evaluation report...');
        await completeInterview(token);
        router.push(`/interview/${token}/complete`);
      }
    } catch (err: any) {
      console.error('Error submitting phase:', err.message);
      setIsPhaseLoading(false);
    }
  };

  // Avatar helper
  const handleAvatarChange = (state: AvatarState, message?: string) => {
    setAvatarState(state);
    if (message) setAvatarMessage(message);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400">Verifying secure interview session...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-red-900/50 text-center space-y-4 shadow-xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Unable to Access Interview</h2>
        <p className="text-sm text-slate-400 leading-relaxed">{errorMsg}</p>
        <button
          onClick={() => router.push('/candidate/dashboard')}
          className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Top Banner: Job Title & Phase Progress Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              {sessionData?.job?.title || 'Technical Assessment'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Candidate: <span className="text-slate-200 font-medium">{sessionData?.session?.candidateName}</span>
              &nbsp;•&nbsp; Department: <span className="text-slate-200">{sessionData?.job?.department || 'Engineering'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Phase {currentPhaseIndex + 1} of {phases.length}
            </span>
          </div>
        </div>

        {/* Phase Stepper Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {phases.map((p, idx) => {
            const isDone = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : isDone
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400 line-through'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                )}
                <span className="capitalize">{p.type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Avatar Presence Banner */}
      <AvatarPresence
        state={avatarState}
        message={avatarMessage}
        interviewerName="Nova AI Interviewer"
      />

      {/* Proctoring Warning Notification (if violation detected) */}
      {violations.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-800/80 p-3.5 rounded-xl text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
          <span>
            <strong>Proctoring Notice:</strong> {violations[0].message} (Total integrity flags: {violations.length})
          </span>
        </div>
      )}

      {/* Current Phase Workspace */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        {isPhaseLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading phase prompts & test cases...</p>
          </div>
        ) : (
          <>
            {currentPhase.type === 'mcq' && (
              <MCQPhase
                questions={currentQuestions}
                onComplete={(answers, score) => handlePhaseComplete(answers, score)}
                onAvatarStateChange={handleAvatarChange}
              />
            )}

            {currentPhase.type === 'coding' && (
              <CodingPhase
                question={currentQuestions[0] || { id: 'code-1', type: 'coding', text: 'Write a solution for the challenge.' }}
                onComplete={(code, score) => handlePhaseComplete({ code }, score)}
                onAvatarStateChange={handleAvatarChange}
              />
            )}

            {currentPhase.type === 'speaking' && (
              <SpeakingPhase
                question={currentQuestions[0] || { id: 'spk-1', type: 'speaking', text: 'Tell us about your technical background.' }}
                onComplete={(transcript, metrics, score) => handlePhaseComplete({ transcript, metrics }, score)}
                onAvatarStateChange={handleAvatarChange}
              />
            )}

            {currentPhase.type === 'scenario' && (
              <ScenarioPhase
                question={currentQuestions[0] || { id: 'scn-1', type: 'scenario', text: 'Analyze this engineering scenario.' }}
                onComplete={(answer, score) => handlePhaseComplete({ answer }, score)}
                onAvatarStateChange={handleAvatarChange}
              />
            )}
          </>
        )}
      </div>

      {/* Fixed Picture-in-Picture Webcam Monitor in Bottom-Right Corner */}
      <div className="fixed bottom-4 right-4 z-40 w-44 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900 text-[10px] text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            {isWebcamActive ? (
              <Video className="w-3 h-3 text-emerald-400" />
            ) : (
              <VideoOff className="w-3 h-3 text-red-400" />
            )}
            <span>Camera</span>
          </div>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            REC
          </span>
        </div>
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
          {!isWebcamActive && (
            <span className="text-[10px] text-slate-500 text-center px-2">
              Camera connecting...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
