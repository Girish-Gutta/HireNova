'use client';

import React from 'react';
import { Briefcase, Plus, Search, Filter, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminJobsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Job Postings & JD Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage roles, customize interview phases (MCQ, coding, speaking, scenario) and weights
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Phase 2 will unlock full Job Creation form with Supabase storage.')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job (Phase 2)</span>
        </button>
      </div>

      {/* Filter / Search Bar Shell */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            disabled
            placeholder="Search active roles or required skill tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled
          className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 self-stretch sm:self-auto justify-center"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter</span>
        </button>
      </div>

      {/* Jobs List Shell / Empty State */}
      <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">No active job listings</h2>
        <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
          Job postings created in Phase 2 will be saved to Supabase with custom phase order (MCQ → Coding → Speaking → Scenario) and AI scoring criteria.
        </p>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 max-w-lg text-left space-y-1.5">
          <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 2 Scope Preparation
          </div>
          <p className="text-[11px] text-slate-400">
            • Recruiter will define required skills, seniority, and JD text.<br />
            • Phase configs will specify time limits and weightings per round.<br />
            • Live candidates can apply directly from the Candidate Portal.
          </p>
        </div>
      </div>
    </div>
  );
}
