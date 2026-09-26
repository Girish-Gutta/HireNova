'use client';

import React from 'react';
import { FileText, Sparkles, Inbox, CheckCircle2 } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          AI Interview Evaluation Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed company-facing interview evaluations, scoring breakdowns, and recommendation justifications
        </p>
      </div>

      <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">No interview reports generated yet</h2>
        <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
          After a candidate completes an autonomous interview session (Phase 5-10), the Analysis Agent synthesizes multi-phase signals (coding, speaking, scenario, MCQs) into a comprehensive report.
        </p>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 max-w-lg text-left space-y-1.5">
          <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Report Structure (Phase 10 Target)
          </div>
          <p className="text-[11px] text-slate-400">
            • Recommendation: Strong Hire, Hire, Borderline, or No Hire.<br />
            • Sub-scores with proctoring integrity flags and speech tone metrics.<br />
            • Recruiter override form allowing human HR to modify decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
