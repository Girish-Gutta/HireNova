'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('HireNova Client Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h1 className="text-xl font-bold text-white">Something went wrong</h1>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
        An error occurred while loading this page. You can try refreshing or navigate back to the main portal.
      </p>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try again</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
}
