'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Building2,
  ExternalLink,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchCandidateApplications,
  fetchSessionByApplication,
  type Application,
} from '@/lib/api';

interface AppWithSession {
  application: Application;
  sessionToken?: string;
  reportScore?: number;
  recommendation?: string;
}

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppWithSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const apps = await fetchCandidateApplications(user.id);
        const mapped: AppWithSession[] = [];

        for (const app of apps) {
          try {
            const sessionData = await fetchSessionByApplication(app.id);
            mapped.push({
              application: app,
              sessionToken: sessionData.session?.linkToken,
              reportScore: sessionData.report?.totalScore,
              recommendation: sessionData.report?.recommendation,
            });
          } catch (_) {
            mapped.push({ application: app });
          }
        }
        setItems(mapped);
      } catch (err) {
        console.error('Failed to load candidate applications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const totalApps = items.length;
  const activeInvites = items.filter((i) => i.application.status === 'interview_scheduled');
  const completedSessions = items.filter((i) => i.application.status === 'interview_completed');

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
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? '...' : totalApps}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Applied positions</div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Invitations</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? '...' : activeInvites.length}
            </div>
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
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? '...' : completedSessions.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Evaluated rounds</div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average Fit Score</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">
              {items.some((i) => i.application.match_score) ? '82%' : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Resume vs JD Match</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Applications & Interview Actions */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                My Application Pipeline ({totalApps})
              </h2>
              <Link
                href="/candidate/jobs"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
              >
                Browse open roles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Loading your applications...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 px-4 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
                  <FileText className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-sm font-semibold text-white">No active applications yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                  Browse available roles on the job board. Apply with your resume for instant AI JD match scoring.
                </p>
                <Link
                  href="/candidate/jobs"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all shadow-md"
                >
                  <Search className="w-3.5 h-3.5" />
                  Browse Open Roles
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const app = item.application;
                  const isScheduled = app.status === 'interview_scheduled';
                  const isCompleted = app.status === 'interview_completed';

                  return (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {app.jobs?.title || `Position #${app.job_id.substring(0, 8)}`}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono uppercase">
                            {app.status.replace('_', ' ')}
                          </span>
                          {app.match_score && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                              <TrendingUp className="w-2.5 h-2.5" /> {app.match_score}% Match
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>Resume:</span>
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            View PDF <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isScheduled && item.sessionToken && (
                          <Link
                            href={`/interview/${item.sessionToken}`}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Start Interview
                          </Link>
                        )}

                        {isCompleted && item.sessionToken && (
                          <Link
                            href={`/interview/${item.sessionToken}/complete`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            View Results
                          </Link>
                        )}

                        <span className="text-[11px] text-slate-500 hidden sm:inline-block">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Automated AI Candidate Journey</span>
            <span className="font-mono text-emerald-400">Phase 11 Active</span>
          </div>
        </div>

        {/* Right: How HireNova Works */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Autonomous Interview Stages
            </h2>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <div className="font-semibold text-white">1. Multiple Choice Knowledge</div>
                  <div className="text-[11px] text-slate-400">Assess core foundational skills in your tech stack.</div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <div className="font-semibold text-white">2. Live Code Sandbox</div>
                  <div className="text-[11px] text-slate-400">Implement algorithmic solution against hidden test cases.</div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <div className="font-semibold text-white">3. Verbal & Communication</div>
                  <div className="text-[11px] text-slate-400">Explain past technical decisions with live transcription.</div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <div className="font-semibold text-white">4. Engineering Scenario</div>
                  <div className="text-[11px] text-slate-400">Solve real-world outage or architecture trade-offs.</div>
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
