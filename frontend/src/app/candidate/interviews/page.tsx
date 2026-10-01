'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  fetchCandidateApplications,
  fetchSessionByApplication,
  type Application,
} from '@/lib/api';
import {
  Video,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface SessionWithApp {
  application: Application;
  sessionToken?: string;
  status: string;
  reportScore?: number;
  recommendation?: string;
  expiresAt?: string;
}

export default function CandidateInterviewsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [interviewList, setInterviewList] = useState<SessionWithApp[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!user) return;
      try {
        const apps = await fetchCandidateApplications(user.id);
        const results: SessionWithApp[] = [];

        for (const app of apps) {
          try {
            const sessionData = await fetchSessionByApplication(app.id);
            results.push({
              application: app,
              sessionToken: sessionData.session?.linkToken,
              status: sessionData.session?.status || app.status,
              reportScore: sessionData.report?.totalScore,
              recommendation: sessionData.report?.recommendation,
              expiresAt: sessionData.session?.expiresAt,
            });
          } catch (_) {
            if (app.status === 'interview_scheduled' || app.status === 'interview_completed') {
              results.push({
                application: app,
                status: app.status,
              });
            }
          }
        }

        if (isMounted) {
          setInterviewList(results);
          setLoading(false);
        }
      } catch (err: any) {
        console.warn('Failed to load candidate interviews:', err.message);
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs text-slate-400 ml-2">Loading interview schedules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          My AI Interview Sessions
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Launch your 72h interview invitations or review past performance summaries
        </p>
      </div>

      {interviewList.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Video className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-white">No active interview invitations</h2>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-6 leading-relaxed">
            When an employer invites you to an interview, your secure 72-hour link will appear here with an on-demand start button.
          </p>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 max-w-md text-left space-y-1.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Interview Environment Checklist
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              • Requires webcam & microphone for client-side AI proctoring.<br />
              • Real-time speech transcription via browser Web Speech API.<br />
              • Live code execution in sandboxed environment.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {interviewList.map((item, idx) => {
            const isCompleted = item.status === 'completed' || item.status === 'interview_completed';
            const token = item.sessionToken;

            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Ready to Start'}
                    </span>
                    {item.reportScore !== undefined && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Score: {item.reportScore}/100
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-100">
                    {item.application.jobs?.title || 'Technical Assessment'}
                  </h3>

                  <p className="text-xs text-slate-400">
                    Applied on: {new Date(item.application.created_at).toLocaleDateString()}
                    {item.expiresAt && (
                      <span className="text-amber-400 ml-2">
                        • Expires: {new Date(item.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>

                {/* Action CTA */}
                <div>
                  {isCompleted && token ? (
                    <Link
                      href={`/interview/${token}/complete`}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                    >
                      View Report Summary
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : token ? (
                    <Link
                      href={`/interview/${token}`}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-medium text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Start AI Interview
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500">Session link pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
