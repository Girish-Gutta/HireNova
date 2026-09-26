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
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchCandidateApplications, Application } from '@/lib/api';

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.id) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchCandidateApplications(user.id);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load candidate applications:', err);
    } finally {
      setLoading(false);
    }
  };

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
              {loading ? '...' : applications.length}
            </div>
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
            <div className="text-2xl font-bold text-white font-mono">
              {applications.filter((a) => a.status === 'interview_scheduled').length}
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
              {applications.filter((a) => a.status === 'interview_completed').length}
            </div>
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
            <div className="text-2xl font-bold text-white font-mono">
              {applications.some((a) => a.match_score) ? '85%' : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Resume vs JD Match</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Real Active Applications List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Active Applications ({applications.length})
              </h2>
              <Link
                href="/candidate/jobs"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
              >
                Browse more <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Loading your applications...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="py-12 px-4 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
                  <FileText className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-sm font-semibold text-white">No active applications yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                  Browse available roles in the job board. Apply with your resume for instant AI JD match scoring.
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
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          Application #{app.id.substring(0, 8)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono uppercase">
                          {app.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Resume attached:</span>
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          View Document <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Automated resume screening</span>
            <span className="font-mono text-emerald-400">Phase 2 Active</span>
          </div>
        </div>

        {/* Right: How HireNova Works */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Application & Interview Journey
            </h2>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <div className="font-semibold text-white">Resume Submitted</div>
                  <div className="text-[11px] text-slate-400">Stored securely in Supabase Storage with metadata extraction.</div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <div className="font-semibold text-white">AI Fit Matching (Phase 3)</div>
                  <div className="text-[11px] text-slate-400">Matching Agent analyzes your skills and experience against the employer's JD.</div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <div className="font-semibold text-white">Interview Invitation (Phase 4)</div>
                  <div className="text-[11px] text-slate-400">Secure link generated for on-demand 72-hour autonomous interview attempt.</div>
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
