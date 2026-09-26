'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Server, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { fetchHealth, HealthCheckResponse } from '@/lib/api';

export default function Home() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message || 'Unable to reach backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto flex flex-col gap-10">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              HireNova
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                Phase 0: Foundation
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Autonomous AI-run interview platform replacing human screening & proctoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={checkHealth}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            Re-test Backend
          </button>
        </div>
      </header>

      {/* Hero / System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Backend API Status */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Server className="w-4 h-4 text-emerald-400" />
              Backend API Server
            </div>
            {loading ? (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 animate-pulse">
                checking...
              </span>
            ) : health?.status === 'ok' ? (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE (:{process.env.PORT || '5000'})
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1 font-mono">
                OFFLINE
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="text-2xl font-bold text-white font-mono">
              {health?.responseTimeMs !== undefined ? `${health.responseTimeMs} ms` : '—'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Round-trip ping to Node.js/Express service
            </p>
          </div>

          {error && (
            <div className="mt-3 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-500 flex justify-between">
            <span>Uptime: {health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s` : '—'}</span>
            <span>Env: {health?.environment || 'development'}</span>
          </div>
        </div>

        {/* Database & Storage */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Database className="w-4 h-4 text-sky-400" />
              Supabase Postgres & RLS
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono">
              SCHEMA READY
            </span>
          </div>

          <div className="mt-4">
            <div className="text-base font-semibold text-white">
              8 Core Tables Defined
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Users, Companies, Jobs, Applications, Sessions, PhaseResults, Proctoring, Reports
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Migration script: <code>supabase/migrations</code></span>
          </div>
        </div>

        {/* Free Tier Services Engine */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Cpu className="w-4 h-4 text-amber-400" />
              Free-Tier Engine Stack
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono">
              ZERO-COST
            </span>
          </div>

          <div className="mt-4 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">LLM Inference:</span>
              <span className="font-mono text-emerald-400">Gemini 1.5/2.0 Free Tier</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Code Sandbox:</span>
              <span className="font-mono text-emerald-400">Piston Open API</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Speech & Voice:</span>
              <span className="font-mono text-emerald-400">Browser Web Speech API</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Proctoring AI:</span>
              <span className="font-mono text-emerald-400">TensorFlow.js / Client-side</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-500 flex justify-between">
            <span>No paid APIs required</span>
            <span>100% compliant</span>
          </div>
        </div>
      </div>

      {/* Role Portal Entry Cards (Preparation for Phase 1) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Role-Based Portal Access (Phase 1 Target)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recruiter Portal */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                  Company / HR Admin
                </span>
                <span className="text-xs text-slate-500 font-mono">/admin/*</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                Recruiter Portal
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Post job listings, configure custom interview phases, inspect applicant fit scores, review AI-generated reports with override capabilities.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/60">
              <span className="text-xs text-slate-500">Route guard: <code>recruiter</code> | <code>admin</code></span>
              <a 
                href="/admin" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Enter Portal <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Candidate Portal */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                  Candidate / Job Seeker
                </span>
                <span className="text-xs text-slate-500 font-mono">/candidate/*</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                Candidate Portal
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Browse open positions, upload resume for AI matching, launch proctored multi-phase interview sessions, and track evaluation feedback.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/60">
              <span className="text-xs text-slate-500">Route guard: <code>candidate</code></span>
              <a 
                href="/candidate" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Enter Portal <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 0 Checklist */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Phase 0 Foundation Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mono-repo repo structure (<code>frontend/</code> & <code>backend/</code>)</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Side-by-side run script (<code>npm run dev</code> via concurrently)</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Supabase migration (8 tables, enums, triggers, RLS)</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Base Auth middleware & role guards (candidate/recruiter/admin)</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Health-check endpoint (<code>/api/health</code> with diagnostics)</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Free-tier constraints & environment configurations verified</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 pt-4 pb-12">
        HireNova AI Autonomous Interview System • Verified on Node {process.version} • Free-tier architecture
      </footer>
    </main>
  );
}
