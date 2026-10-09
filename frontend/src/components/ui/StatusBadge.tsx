import React from 'react';
import { clsx } from 'clsx';

export type ApplicationStatus =
  | 'submitted'
  | 'matched'
  | 'invited'
  | 'interview_in_progress'
  | 'interview_completed'
  | 'reviewed'
  | 'rejected'
  | 'hired';

export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'expired';

export type RecommendationLabel = 'strong_hire' | 'hire' | 'maybe' | 'no_hire';

interface StatusBadgeProps {
  status: ApplicationStatus | SessionStatus | RecommendationLabel | string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Application statuses
  submitted:             { label: 'Submitted',           className: 'bg-slate-800 border-slate-700 text-slate-300' },
  matched:               { label: 'AI Matched',          className: 'bg-sky-500/10 border-sky-500/30 text-sky-400' },
  invited:               { label: 'Invited',             className: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  interview_in_progress: { label: 'In Progress',         className: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  interview_completed:   { label: 'Completed',           className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  reviewed:              { label: 'Reviewed',            className: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
  rejected:              { label: 'Not Selected',        className: 'bg-rose-500/10 border-rose-500/30 text-rose-400' },
  hired:                 { label: 'Hired',               className: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold' },

  // Session statuses
  pending:               { label: 'Pending',             className: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  in_progress:           { label: 'In Progress',         className: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  completed:             { label: 'Completed',           className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  expired:               { label: 'Expired',             className: 'bg-slate-800 border-slate-700 text-slate-400' },

  // AI Recommendations
  strong_hire:           { label: '⭐ Strong Hire',      className: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' },
  hire:                  { label: '✓ Hire',              className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  maybe:                 { label: '~ Borderline',        className: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  no_hire:               { label: '✕ No Hire',           className: 'bg-rose-500/10 border-rose-500/30 text-rose-400' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status.replace(/_/g, ' '),
    className: 'bg-slate-800 border-slate-700 text-slate-300',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center border rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

/** Match score pill — colour-coded from 0–100 */
export function MatchScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-xs text-slate-500 tabular-nums">—</span>;

  const pct = Math.round(score);
  const color =
    pct >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
    pct >= 60 ? 'text-sky-400 border-sky-500/30 bg-sky-500/10' :
    pct >= 40 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                'text-rose-400 border-rose-500/30 bg-rose-500/10';

  return (
    <span className={clsx('inline-flex items-center border rounded-full text-xs px-2.5 py-0.5 font-mono font-semibold tabular-nums', color)}>
      {pct}%
    </span>
  );
}
