'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { fetchSessionReport, type ScoreReport, type InterviewSession } from '@/lib/api';
import {
  CheckCircle2,
  Award,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function InterviewCompletePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      try {
        const data = await fetchSessionReport(token);
        if (!isMounted) return;
        setReport(data.report);
        setSession(data.session);
        setIsLoading(false);
      } catch (err: any) {
        console.warn('Failed to load session report:', err.message);
        if (!isMounted) return;
        setIsLoading(false);
      }
    }
    loadReport();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const getRecommendationBadge = (rec: string = '') => {
    switch (rec) {
      case 'strong_hire':
        return { label: 'Strong Hire', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'hire':
        return { label: 'Hire Recommended', bg: 'bg-teal-950 text-teal-300 border-teal-800' };
      case 'maybe':
        return { label: 'Borderline Review', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'no_hire':
      default:
        return { label: 'Under Review', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      {/* Celebration Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800 inline-block mb-3">
            Assessment Completed
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Interview Successfully Submitted!
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            Thank you, {session?.candidateName || 'Candidate'}. Your responses across all assessment phases have been recorded and evaluated by Nova AI.
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Proctoring Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Comprehensive Scoring</span>
          </div>
        </div>
      </div>

      {/* AI Score Report Card (if evaluated) */}
      {isLoading ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Finalizing candidate performance summary...</p>
        </div>
      ) : report ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-slate-200">AI Evaluation Summary</h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                getRecommendationBadge(report.recommendation).bg
              }`}
            >
              {getRecommendationBadge(report.recommendation).label}
            </span>
          </div>

          {/* Overall Score Meter */}
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 block">Overall AI Score</span>
              <span className="text-2xl font-bold text-emerald-400">{report.totalScore}/100</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Integrity Signals</span>
              <span className="text-sm font-medium text-slate-300">
                {report.proctoringFlags === 0 ? '✓ Zero Violations' : `${report.proctoringFlags} flag(s) logged`}
              </span>
            </div>
          </div>

          {/* AI Narrative Summary */}
          <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Feedback Summary:</span>
            {report.summary}
          </div>

          {/* Key Strengths */}
          {report.strengths && report.strengths.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                Identified Strengths
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      {/* Return to Portal Action */}
      <div className="flex justify-center pt-2">
        <Link
          href="/candidate/dashboard"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Return to Candidate Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
