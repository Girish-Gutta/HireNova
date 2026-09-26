'use client';

import React from 'react';
import { Users, Filter, Search, Sparkles, Inbox } from 'lucide-react';

export default function AdminCandidatesPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          Applicants & AI Fit Screening
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review candidates scored against job requirements by the Resume/JD Matching Agent
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            disabled
            placeholder="Search candidates by name, email, or skill fit..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled
          className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 self-stretch sm:self-auto justify-center"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>All Statuses</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Inbox className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">No candidate applications yet</h2>
        <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
          Once jobs are created in Phase 2 and candidate resumes are uploaded, the AI Matching Agent will rank candidates with match percentages and skill gap breakdowns.
        </p>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 max-w-lg text-left">
          <span className="font-semibold text-indigo-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Human Recruiter Control
          </span>
          <p className="text-[11px] text-slate-400">
            Recruiters will be able to manually invite candidates to interview links, adjust matching thresholds, or reject applications.
          </p>
        </div>
      </div>
    </div>
  );
}
