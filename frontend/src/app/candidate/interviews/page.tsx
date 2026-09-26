'use client';

import React from 'react';
import { Video, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function CandidateInterviewsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          My AI Interview Sessions
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Launch your scheduled 72h interview invitations or review past performance summaries
        </p>
      </div>

      {/* Empty State */}
      <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
          <Video className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">No active interview invitations</h2>
        <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
          When an employer invites you to an interview (Phase 4), a secure on-demand link will be issued with a 72-hour completion countdown.
        </p>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 max-w-lg text-left space-y-1.5">
          <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Interview Environment Checklist (Phase 5-7)
          </div>
          <p className="text-[11px] text-slate-400">
            • Requires webcam & microphone permissions for client-side AI proctoring.<br />
            • Voice answers transcribed in real-time via the browser Web Speech API.<br />
            • Full candidate results summary available immediately after submission.
          </p>
        </div>
      </div>
    </div>
  );
}
