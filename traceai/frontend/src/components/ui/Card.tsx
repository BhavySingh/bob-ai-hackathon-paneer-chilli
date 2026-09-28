import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glass?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, className = '', onClick, hover = false, glass = false, style }: CardProps) {
  return (
    <div
      className={`
          rounded-xl border border-slate-700/50 p-5
          ${glass ? 'glass' : 'bg-slate-800/60'}
          ${hover ? 'card-hover cursor-pointer' : ''}
          ${className}
        `}
        style={style}
        onClick={onClick}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon, color = 'blue', sub }: {
  label: string; value: string | number; icon: React.ReactNode; color?: string; sub?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10',
    red: 'text-red-400 bg-red-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  };
  return (
    <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}
