import React from 'react';
import type { Priority, LeadStatus, CaseStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'priority' | 'status' | 'source';
  value?: string;
  className?: string;
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  closed: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  archived: 'bg-slate-600/20 text-slate-500 border border-slate-600/30',
  new: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  under_review: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  verified: 'bg-green-500/20 text-green-400 border border-green-500/30',
  dismissed: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${priorityColors[priority] || priorityColors.low}`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: CaseStatus | LeadStatus | string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${statusColors[status] || statusColors.new}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : pct >= 40 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 ${className}`}>
      {children}
    </span>
  );
}
