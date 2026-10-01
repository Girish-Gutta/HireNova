'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  TrendingUp,
  Award,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  fetchAllApplications,
  fetchSessionByApplication,
  type Application,
  type ScoreReport,
} from '@/lib/api';

interface ReportCardItem {
  application: Application;
  report: ScoreReport;
  sessionToken: string;
  proctoringFlagsCount: number;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportCardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Human Recruiter Override local state
  const [overrides, setOverrides] = useState<Record<string, { recommendation: string; note: string }>>({});

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const apps = await fetchAllApplications();
      const list: ReportCardItem[] = [];

      for (const app of apps) {
        try {
          const sessionData = await fetchSessionByApplication(app.id);
          if (sessionData.report) {
            list.push({
              application: app,
              report: sessionData.report,
              sessionToken: sessionData.session?.linkToken,
              proctoringFlagsCount: sessionData.proctoringFlagsCount || 0,
            });
          }
        } catch (_) {}
      }

      setReports(list);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideChange = (appId: string, recommendation: string, note: string) => {
    setOverrides((prev) => ({
      ...prev,
      [appId]: { recommendation, note },
    }));
  };

  const filteredReports = reports.filter(
    (r) =>
      r.application.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.application.candidate_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.report.recommendation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'strong_hire':
        return { label: 'Strong Hire', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'hire':
        return { label: 'Hire', color: 'bg-teal-950 text-teal-300 border-teal-800' };
      case 'maybe':
        return { label: 'Borderline / Review', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'no_hire':
      default:
        return { label: 'No Hire', color: 'bg-red-950 text-red-300 border-red-800' };
    }
  };

  // KPIs
  const totalEvaluated = reports.length;
  const avgScore = totalEvaluated > 0 ? Math.round(reports.reduce((acc, r) => acc + r.report.totalScore, 0) / totalEvaluated) : 0;
  const strongHireCount = reports.filter((r) => r.report.recommendation === 'strong_hire' || r.report.recommendation === 'hire').length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          AI Interview Evaluation Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed candidate assessment reports, multi-phase scores, and recruiter override controls
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Total Evaluated</span>
          <div className="text-2xl font-bold text-slate-100">{totalEvaluated}</div>
          <span className="text-[11px] text-slate-500">Autonomous sessions completed</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Average AI Score</span>
          <div className="text-2xl font-bold text-emerald-400">{avgScore}/100</div>
          <span className="text-[11px] text-slate-500">Across all phases</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Hire Recommendation Rate</span>
          <div className="text-2xl font-bold text-indigo-400">
            {totalEvaluated > 0 ? Math.round((strongHireCount / totalEvaluated) * 100) : 0}%
          </div>
          <span className="text-[11px] text-slate-500">{strongHireCount} recommend hire</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter reports by candidate name or recommendation..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
        />
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Loading evaluation reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-white">No completed interview reports yet</h2>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-4 leading-relaxed">
            Invite candidates from the Applicants page. When candidates finish their interview session, their comprehensive AI scoring breakdown will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((item) => {
            const isExpanded = expandedId === item.application.id;
            const currentOverride = overrides[item.application.id];
            const activeRecommendation = currentOverride?.recommendation || item.report.recommendation;
            const badge = getRecommendationBadge(activeRecommendation);

            return (
              <div
                key={item.application.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.application.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/90 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-bold text-white">
                        {item.application.candidate_name || 'Candidate'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {currentOverride && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                          Recruiter Override
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {item.application.candidate_email} • Score:{' '}
                      <strong className="text-emerald-400 font-bold">{item.report.totalScore}/100</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      {item.proctoringFlagsCount === 0 ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="w-4 h-4" /> Integrity Clean
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400">
                          <ShieldAlert className="w-4 h-4" /> {item.proctoringFlagsCount} Flag(s)
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/40 space-y-6 text-xs">
                    {/* Narrative Summary */}
                    <div>
                      <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                        Executive Evaluation Summary
                      </span>
                      <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        {item.report.summary}
                      </p>
                    </div>

                    {/* Phase Breakdown Grid */}
                    {item.report.phaseBreakdown && (
                      <div>
                        <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                          Phase Performance Breakdown
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {Object.entries(item.report.phaseBreakdown).map(([phase, score]) => (
                            <div key={phase} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                              <span className="text-slate-400 capitalize block mb-1">{phase}</span>
                              <div className="text-lg font-bold text-emerald-400">{score}/100</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {item.report.strengths && item.report.strengths.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                            Key Strengths
                          </span>
                          <ul className="space-y-1 text-slate-300">
                            {item.report.strengths.map((str, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.report.improvements && item.report.improvements.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                            Identified Growth Areas
                          </span>
                          <ul className="space-y-1 text-slate-300">
                            {item.report.improvements.map((imp, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Human Recruiter Override Form */}
                    <div className="p-4 bg-slate-900/80 rounded-xl border border-indigo-900/40 space-y-3">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                        <Award className="w-4 h-4" />
                        <span>Human-in-the-Loop Override Decision</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        As a recruiter, you can override the AI recommendation and record your hiring rationale.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <select
                          value={activeRecommendation}
                          onChange={(e) =>
                            handleOverrideChange(
                              item.application.id,
                              e.target.value,
                              currentOverride?.note || ''
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="strong_hire">Strong Hire</option>
                          <option value="hire">Hire</option>
                          <option value="maybe">Borderline / Additional Review</option>
                          <option value="no_hire">No Hire</option>
                        </select>

                        <input
                          type="text"
                          value={currentOverride?.note || ''}
                          onChange={(e) =>
                            handleOverrideChange(
                              item.application.id,
                              activeRecommendation,
                              e.target.value
                            )
                          }
                          placeholder="Optional recruiter note or justification..."
                          className="flex-1 w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
