'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg shadow-emerald-500/20">
            HN
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            HireNova
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
            AI Interview Room
          </span>
        </Link>

        {/* Security / Proctoring Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium text-slate-300">AI Proctored Session</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
