import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'surplus' | 'deficit' | 'ai' | 'blockchain' | 'neutral';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  badge,
}) => {
  const variantStyles = {
    surplus: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
    deficit: 'bg-rose-50/70 border-rose-200 text-rose-900',
    ai: 'bg-violet-50/70 border-violet-200 text-violet-900',
    blockchain: 'bg-cyan-50/70 border-cyan-200 text-cyan-900',
    neutral: 'bg-white border-slate-200 text-slate-900',
  };

  const iconStyles = {
    surplus: 'text-emerald-600 bg-emerald-100',
    deficit: 'text-rose-600 bg-rose-100',
    ai: 'text-violet-600 bg-violet-100',
    blockchain: 'text-cyan-600 bg-cyan-100',
    neutral: 'text-slate-600 bg-slate-100',
  };

  return (
    <div className={`p-5 rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2 rounded-xl ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/80 border border-slate-200 shadow-2xs">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
