'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Brain,
  ShieldCheck,
  Video,
  FileText,
  BarChart3,
  Code2,
  Mic,
  CheckCircle2,
  Building2,
  UserCheck,
  Zap,
  Globe,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Resume Matching',
    description: 'Gemini-powered JD/resume analysis scores candidate fit and gap analysis in seconds — before a single human reviews anything.',
    color: 'emerald',
  },
  {
    icon: Video,
    title: 'Multi-Phase Interview',
    description: 'MCQ → Coding → Speaking → Scenario. Fully autonomous, self-serve, available 24/7. The AI interviewer never has a bad day.',
    color: 'sky',
  },
  {
    icon: ShieldCheck,
    title: 'Proctored & Secure',
    description: 'Client-side face detection, tab-switch monitoring, and copy-paste flagging keep sessions honest. No server GPU required.',
    color: 'indigo',
  },
  {
    icon: Code2,
    title: 'Live Code Execution',
    description: 'Candidates write and run code against hidden test cases. Piston sandbox supports JavaScript, TypeScript, Python, and more.',
    color: 'amber',
  },
  {
    icon: Mic,
    title: 'Speech & Tone Analysis',
    description: 'Web Speech API transcription + client-side WPM, pause ratio, and filler-word analysis score communication quality.',
    color: 'violet',
  },
  {
    icon: BarChart3,
    title: 'Detailed Score Reports',
    description: 'Per-phase breakdowns, strengths, improvements, and a Strong Hire / Hire / Borderline / No Hire recommendation with rationale.',
    color: 'rose',
  },
];

const PIPELINE_STEPS = [
  { step: '01', title: 'Apply', description: 'Candidate submits resume to a live job posting.' },
  { step: '02', title: 'Match', description: 'Matching Agent scores resume against the JD and gaps.' },
  { step: '03', title: 'Invite', description: 'Scheduling Agent creates a 72-hour secure interview link.' },
  { step: '04', title: 'Interview', description: 'Autonomous multi-phase AI-run interview with proctoring.' },
  { step: '05', title: 'Analyse', description: 'Aggregation Agent produces final score + recommendation.' },
  { step: '06', title: 'Decide', description: 'Recruiter reviews report and makes the final call.' },
];

const iconColorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  sky:     'bg-sky-500/10 border-sky-500/20 text-sky-400',
  indigo:  'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  amber:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
  violet:  'bg-violet-500/10 border-violet-500/20 text-violet-400',
  rose:    'bg-rose-500/10 border-rose-500/20 text-rose-400',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* ── Nav ── */}
      <nav className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">HireNova</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              BETA
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-24 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Autonomous multi-phase AI interview platform
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Run your entire
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
              interview pipeline
            </span>
            with AI
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            HireNova replaces the human interviewer for the actual interview — MCQ, live coding, 
            speaking, and behavioural scenarios — then hands recruitersa detailed score report 
            so they make the final decision on data, not gut feel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all group"
            >
              Start Hiring Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-sm font-medium text-slate-300 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Take a Demo Interview
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-slate-500">
            {[
              { icon: Globe, label: '100% free-tier architecture' },
              { icon: ShieldCheck, label: 'Proctored & GDPR-friendly' },
              { icon: CheckCircle2, label: 'Human decision override always available' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-emerald-500/70" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline Steps ── */}
      <section className="relative z-10 py-16 px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">From application to decision in one automated loop</h2>
            <p className="text-sm text-slate-400">Six stages, zero scheduling coordination, one human decision at the end.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PIPELINE_STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {/* connector line */}
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%-1px)] w-full h-px bg-gradient-to-r from-slate-700 to-transparent z-0" />
                )}
                <div className="relative z-10 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                  <div className="text-[10px] font-mono font-bold text-emerald-400">{s.step}</div>
                  <div className="text-xs font-bold text-white">{s.title}</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-white mb-2">Everything built-in, nothing to pay</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Every feature uses free-tier services. Gemini API, Piston sandbox, browser Web Speech — no vendor lock-in, no surprise invoices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${iconColorMap[f.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Portal Split ── */}
      <section className="relative z-10 py-16 px-6 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Two portals, one codebase</h2>
            <p className="text-sm text-slate-400">Role-guarded routing — same app, different views.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Recruiter */}
            <div className="p-7 rounded-2xl bg-slate-900/60 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Recruiter Portal</div>
                  <div className="text-[10px] text-slate-400 font-mono">/admin/*</div>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                {['Post jobs & configure AI interview phases','View applicants with AI match scores','Review full per-phase score reports','Override AI recommendation with human judgment','Invite, extend links, or reject candidates'].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Enter as Recruiter <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Candidate */}
            <div className="p-7 rounded-2xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Candidate Portal</div>
                  <div className="text-[10px] text-slate-400 font-mono">/candidate/*</div>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                {['Browse open positions and apply with resume','Receive autonomous AI fit score instantly','Launch on-demand multi-phase interview anytime','Track application pipeline and session status','Get personalised feedback report post-interview'].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Start as Candidate <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/40 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to eliminate interview scheduling hell?
            </h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Sign up free, post your first job, and let HireNova run your next round of interviews. 
              You review the reports. You make the hire.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-slate-800/60 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>HireNova — Autonomous AI Interview Platform</span>
          </div>
          <div className="text-xs text-slate-600">
            100% free-tier • Gemini API • Supabase • Piston • Vercel
          </div>
        </div>
      </footer>
    </div>
  );
}
