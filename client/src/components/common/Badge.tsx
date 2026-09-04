import React from 'react';

export type BadgeVariant =
  | 'surplus'
  | 'deficit'
  | 'balanced'
  | 'active'
  | 'completed'
  | 'pending'
  | 'ai'
  | 'blockchain'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md' }) => {
  const styles: Record<BadgeVariant, string> = {
    surplus: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    deficit: 'bg-rose-50 text-rose-700 border-rose-200',
    balanced: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    ai: 'bg-violet-50 text-violet-700 border-violet-200',
    blockchain: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs ${sizeStyles[size]} ${styles[variant]}`}
    >
      {children}
    </span>
  );
};
