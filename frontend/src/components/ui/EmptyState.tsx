import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'emerald' | 'indigo';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  iconColor?: 'emerald' | 'indigo' | 'slate' | 'amber';
}

const iconColorMap = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  indigo:  'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  slate:   'bg-slate-800/60 border-slate-700/60 text-slate-400',
  amber:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
};

const btnColorMap = {
  emerald: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20',
  indigo:  'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20',
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  iconColor = 'slate',
}: EmptyStateProps) {
  return (
    <div className="py-14 px-6 flex flex-col items-center justify-center text-center rounded-2xl bg-slate-900/40 border border-slate-800 animate-fade-in">
      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${iconColorMap[iconColor]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-5">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all ${btnColorMap[action.variant ?? 'emerald']}`}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
