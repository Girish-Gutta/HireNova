'use client';

import React, { useState, useEffect } from 'react';
import { Users, Filter, Search, Sparkles, Inbox, ExternalLink, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { fetchAllApplications, Application } from '@/lib/api';

export default function AdminCandidatesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchAllApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter((app) =>
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
          Review candidates scored against job requirements by the Resume/JD Matching Agent
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
            placeholder="Search candidates by name, email, or application status..."
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
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
            When candidates submit their resumes via the Candidate Portal, applications appear here with real-time status tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white">
                    {app.candidate_name || 'Candidate'}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono uppercase">
                    {app.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                  <span>{app.candidate_email}</span>
                  <span>•</span>
                  <span>Job: <code className="text-slate-300">{app.job_id.substring(0, 8)}...</code></span>
                </div>

                <div className="pt-1">
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Submitted Resume Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <span className="text-[11px] text-slate-500">
                  Applied {new Date(app.created_at).toLocaleDateString()}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                  Matching Agent: Pending Phase 3
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
