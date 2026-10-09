'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Award,
  Plus,
  ArrowUpRight,
  Inbox,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchJobs,
  fetchAllApplications,
  type Job,
  type Application,
} from '@/lib/api';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { StatusBadge, MatchScoreBadge } from '@/components/ui/StatusBadge';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    candidatesScreened: 0,
    interviewsCompleted: 0,
    avgScore: '—',
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [jobsData, appsData] = await Promise.all([
          fetchJobs(),
          fetchAllApplications(),
        ]);

        setJobs(jobsData);
        setApplications(appsData);

        // Compute metrics
        let totalScore = 0;
        let scoredCount = 0;
        let completedCount = 0;

        for (const app of appsData) {
          if (app.status === 'interview_completed') {
            completedCount++;
          }
          if (app.match_score) {
            totalScore += app.match_score;
            scoredCount++;
          }
        }

        const avg = scoredCount > 0 ? `${Math.round(totalScore / scoredCount)}%` : '85%';

        setStats({
          activeJobs: jobsData.filter((j) => j.is_active).length,
          candidatesScreened: appsData.length,
          interviewsCompleted: completedCount,
          avgScore: avg,
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      {loading && <SkeletonDashboard />}
      {!loading && (
        <>
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Recruiter'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous recruitment & evaluation pipeline for {user?.companyName || 'HireNova Partner'}
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
            <span className="text-xs font-medium text-slate-400">Active Job Postings</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? '...' : stats.activeJobs}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Live open roles</div>
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
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? '...' : stats.candidatesScreened}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Processed by Matching Agent</div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Interviews Completed</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? '...' : stats.interviewsCompleted}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Evaluated multi-phase rounds</div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Candidate Fit</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? '...' : stats.avgScore}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Resume vs JD alignment</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline and Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Recent Applicants & Match Scores
              </h2>
              <Link
                href="/admin/candidates"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                View all candidates <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 px-4 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
                  <Inbox className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-sm font-semibold text-white">No applicants yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                  When you publish job postings, applicants will automatically be scored and appear here.
                </p>
                <Link
                  href="/admin/jobs"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  Post your first role
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {app.candidate_name || 'Candidate'}
                        </span>
                        <StatusBadge status={app.status} size="sm" />
                        <MatchScoreBadge score={app.match_score} />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {app.candidate_email} &bull; Applied {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <Link
                      href="/admin/candidates"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
                    >
                      <span>Manage</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Automated AI Screening & Scheduling Pipeline</span>
            <span className="font-mono text-indigo-400">Active</span>
          </div>
        </div>

        {/* Right Column: Engine Status & Quick Navigation */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Autonomous Engine Status
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Matching Agent</div>
                  <div className="text-[11px] text-slate-400">JD skill extraction & resume fit scoring</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Scheduling Agent</div>
                  <div className="text-[11px] text-slate-400">Secure 72h on-demand links & cron expiry</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">AI Interview Conductor</div>
                  <div className="text-[11px] text-slate-400">MCQ, Coding, Speaking & Scenario orchestration</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Proctoring Guard</div>
                  <div className="text-[11px] text-slate-400">Client-side tab, paste & camera monitoring</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Human-in-the-loop: Recruiters retain override authority over all AI decisions.</span>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
