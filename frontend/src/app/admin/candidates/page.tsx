'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Sparkles,
  Inbox,
  ExternalLink,
  Loader2,
  FileText,
  Video,
  CheckCircle2,
  Copy,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  fetchAllApplications,
  createInterviewSession,
  fetchSessionByApplication,
  type Application,
} from '@/lib/api';

export default function AdminCandidatesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [createdLinks, setCreatedLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchAllApplications();
      setApplications(data);

      // Pre-check existing sessions
      const linkMap: Record<string, string> = {};
      for (const app of data) {
        try {
          const sessionData = await fetchSessionByApplication(app.id);
          if (sessionData.session?.linkToken) {
            linkMap[app.id] = `${window.location.origin}/interview/${sessionData.session.linkToken}`;
          }
        } catch (_) {}
      }
      setCreatedLinks(linkMap);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (appId: string) => {
    setInvitingId(appId);
    try {
      const { interviewUrl, session } = await createInterviewSession(appId, 72);
      setCreatedLinks((prev) => ({
        ...prev,
        [appId]: interviewUrl,
      }));
      // update app status locally
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'interview_scheduled' } : a))
      );
    } catch (err: any) {
      alert(`Failed to create interview invitation: ${err.message}`);
    } finally {
      setInvitingId(null);
    }
  };

  const copyToClipboard = (text: string, appId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(appId);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const filteredApps = applications.filter(
    (app) =>
      (app.candidate_name && app.candidate_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.candidate_email && app.candidate_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      app.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          Applicants & AI Fit Screening
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review candidate match scores and issue secure 72h on-demand interview links
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates by name, email, or status..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Loading applicants...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Inbox className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-white">No candidate applications yet</h2>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-4 leading-relaxed">
            When candidates submit their resumes via the Candidate Portal, applications appear here with automated fit screening.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const hasLink = createdLinks[app.id];
            const isCompleted = app.status === 'interview_completed';

            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-white">
                      {app.candidate_name || 'Candidate'}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono uppercase">
                      {app.status.replace('_', ' ')}
                    </span>

                    {/* Match Score Badge */}
                    {app.match_score !== null && app.match_score !== undefined ? (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Fit: {app.match_score}% Match
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Fit: Scoring...</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span>{app.candidate_email}</span>
                    <span>•</span>
                    <span>Job ID: <code className="text-slate-300">{app.job_id.substring(0, 8)}...</code></span>
                  </div>

                  {/* Matching Rationale Snippet */}
                  {app.match_details?.rationale && (
                    <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                      &ldquo;{app.match_details.rationale}&rdquo;
                    </p>
                  )}

                  <div className="pt-0.5">
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Resume</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Right Action Box */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/60">
                  <span className="text-[11px] text-slate-500">
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {hasLink ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(hasLink, app.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedToken === app.id ? 'Copied Link!' : 'Copy Link'}
                        </button>
                        <a
                          href={hasLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                          title="Open Interview Room"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleInvite(app.id)}
                        disabled={invitingId === app.id}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm disabled:opacity-50"
                      >
                        {invitingId === app.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Video className="w-3.5 h-3.5" />
                        )}
                        Invite to AI Interview
                      </button>
                    )}

                    {isCompleted && (
                      <Link
                        href="/admin/reports"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
