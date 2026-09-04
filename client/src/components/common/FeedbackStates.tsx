import React from 'react';
import { Loader2, AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const LoadingState: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading data...',
  className = 'py-12',
}) => (
  <div className={`flex flex-col items-center justify-center text-center ${className}`}>
    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
    <p className="text-sm font-medium text-slate-500">{message}</p>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-2xs">
    <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl mb-4">
      {icon || <Inbox className="w-8 h-8" />}
    </div>
    <h4 className="text-base font-bold text-slate-900 mb-1">{title}</h4>
    <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
    {actionText && onAction && (
      <Button variant="outline" size="sm" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center p-6 bg-rose-50/70 border border-rose-200 rounded-2xl">
    <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl mb-3">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-bold text-rose-900 mb-1">{title}</h4>
    <p className="text-xs text-rose-700 max-w-md mb-4">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry} className="bg-white border-rose-200 text-rose-800">
        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
        Retry
      </Button>
    )}
  </div>
);
