'use client';

import React from 'react';
import { Briefcase, Search, Filter, Sparkles, Building2, MapPin } from 'lucide-react';

export default function CandidateJobsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          Explore Open Positions
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Apply with your resume to receive an automated AI fit score and an on-demand interview invitation
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            disabled
            placeholder="Search roles by title, technology stack, or company..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled
          className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 self-stretch sm:self-auto justify-center"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>All Departments</span>
        </button>
      </div>

      {/* Empty State / Phase 2 Transition */}
      <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">No active job listings found</h2>
        <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
          In Phase 2, job listings published by recruiters will appear here with detailed JD requirements, required skills, and one-click resume application.
        </p>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 max-w-lg text-left space-y-1">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Candidate Application Flow (Phase 2)
          </span>
          <p className="text-[11px] text-slate-400">
            Upload your resume PDF → Stored securely in Supabase Storage → AI Matching Agent analyzes skills match → Interview link generated.
          </p>
        </div>
      </div>
    </div>
  );
}
