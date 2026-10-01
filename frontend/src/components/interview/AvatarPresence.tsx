'use client';

import React from 'react';
import { Bot, Volume2, Mic, AlertTriangle } from 'lucide-react';

export type AvatarState = 'idle' | 'speaking' | 'listening' | 'warning';

interface AvatarPresenceProps {
  state: AvatarState;
  message?: string;
  interviewerName?: string;
}

export function AvatarPresence({
  state,
  message = "I'm ready when you are. Take your time to review the instructions.",
  interviewerName = 'Nova AI',
}: AvatarPresenceProps) {
  const getGlowColor = () => {
    switch (state) {
      case 'speaking':
        return 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]';
      case 'listening':
        return 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)]';
      case 'warning':
        return 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-bounce';
      case 'idle':
      default:
        return 'border-slate-700 shadow-[0_0_15px_rgba(100,116,139,0.2)]';
    }
  };

  const getStatusBadge = () => {
    switch (state) {
      case 'speaking':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
          </span>
        );
      case 'listening':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/80 text-blue-400 border border-blue-800">
            <Mic className="w-3 h-3 animate-pulse" /> Listening
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3 h-3" /> Flagged
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ready
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Avatar Face Icon with Animated Ring */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-slate-950 transition-all duration-300 ${getGlowColor()}`}
        >
          {state === 'warning' ? (
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          ) : (
            <Bot className="w-8 h-8 text-emerald-400" />
          )}
        </div>
        {/* Pulsing ring during speaking/listening */}
        {(state === 'speaking' || state === 'listening') && (
          <div
            className={`absolute -inset-1 rounded-full border opacity-50 animate-ping pointer-events-none ${
              state === 'speaking' ? 'border-emerald-500' : 'border-blue-500'
            }`}
          />
        )}
      </div>

      {/* Speech Bubble / Dialogue */}
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <span className="font-semibold text-sm text-slate-200">{interviewerName}</span>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          &ldquo;{message}&rdquo;
        </p>
      </div>
    </div>
  );
}
