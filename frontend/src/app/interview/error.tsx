'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function InterviewErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Interview Room Error Caught:', error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-slate-900/90 border border-red-900/40 text-center space-y-5 shadow-2xl backdrop-blur-md">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Interview Session Interrupted</h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          An unexpected runtime issue occurred. Your completed phase responses have already been saved to the server.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Resume Interview</span>
        </button>

        <Link
          href="/candidate/dashboard"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
