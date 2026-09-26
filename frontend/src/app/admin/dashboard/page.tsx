'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Award, 
  Plus, 
  ArrowUpRight, 
  Inbox, 
  Clock, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Recruiter'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous recruitment pipeline for {user?.companyName || 'HireNova Partner'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Opening</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Jobs</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Ready for Phase 2 job creation</div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Candidates Screened</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Resume JD matching pipeline</div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AI Interviews Done</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Proctored multi-phase rounds</div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Candidate Score</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">—</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Awaiting first evaluations</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline and Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Applications Shell */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Recent Applications & Match Scores
              </h2>
              <Link 
                href="/admin/candidates" 
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Deliberate Empty State */}
            <div className="py-12 px-4 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
                <Inbox className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">No applicants yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                When you publish a job opening, candidates who apply will automatically be matched and scored against your JD by the AI Matching Agent.
              </p>
              <Link
                href="/admin/jobs"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                Post your first role
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Automated AI Screening Loop</span>
            <span className="font-mono">Phase 2 Target</span>
          </div>
        </div>

        {/* Right Column: AI Interview Insights */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Autonomous Engine Status
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Matching Agent</div>
                  <div className="text-[11px] text-slate-400">JD skill extraction & resume fit calculation</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Scheduling Agent</div>
                  <div className="text-[11px] text-slate-400">Secure 72h on-demand tokens & invitations</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Proctoring Guard</div>
                  <div className="text-[11px] text-slate-400">Client-side face & tab security verification</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Human-in-the-loop: You hold full override power over all AI recommendations.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
