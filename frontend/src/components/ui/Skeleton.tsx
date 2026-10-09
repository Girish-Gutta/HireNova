import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={clsx('skeleton', className)} />;
}

/** A KPI card skeleton — matches the stat card shape used across dashboards */
export function SkeletonStatCard() {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

/** A list row skeleton — used for applicant / report list items */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-800/60 bg-slate-900/40">
      <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-xl" />
    </div>
  );
}

/** A card skeleton — for job postings, reports, etc. */
export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-lg" />
        <Skeleton className="h-5 w-20 rounded-lg" />
        <Skeleton className="h-5 w-14 rounded-lg" />
      </div>
    </div>
  );
}

/** Dashboard skeleton — stat grid + recent list */
export function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
