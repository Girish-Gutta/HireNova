'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Video, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CandidateDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome, {user?.fullName || 'Candidate'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your job applications, fit match scores, and on-demand AI interview invitations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/candidate/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Explore Open Roles</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Applications</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Applied positions</div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Invites</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <div className="text-[11px] text-slate-500 mt-0.5">72h secure interview links</div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Completed Sessions</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Evaluated rounds</div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Fit Score</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">—</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Resume vs JD Match</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Interview Callout / Active Applications */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Active Applications
              </h2>
              <Link
                href="/candidate/jobs"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
              >
                Browse openings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Empty State */}
            <div className="py-12 px-4 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
                <FileText className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">No active applications yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                Browse available roles in the job board. In Phase 2, you can upload your PDF/Word resume for instant AI JD match scoring.
              </p>
              <Link
                href="/candidate/jobs"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                Browse Open Roles
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Automated resume screening</span>
            <span className="font-mono">Supabase Storage</span>
          </div>
        </div>

        {/* Right: How HireNova Works */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              How AI Interviews Work
            </h2>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <div className="font-semibold text-white">On-Demand Secure Link</div>
                  <div className="text-[11px] text-slate-400">Take the interview whenever convenient within 72 hours. No human scheduling delays.</div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <div className="font-semibold text-white">Multi-Phase AI Rounds</div>
                  <div className="text-[11px] text-slate-400">Adaptive MCQs, in-browser coding sandbox, and real-time voice speech analysis.</div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <div className="font-semibold text-white">Objective Evaluation</div>
                  <div className="text-[11px] text-slate-400">Unbiased AI evaluation report with clear strength and improvement breakdowns.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>AI acts as the interviewer; human hiring managers make final decisions.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
