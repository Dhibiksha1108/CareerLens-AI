import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4 rounded-2xl bg-white border border-slate-200/60">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200/60">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {description && (
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">{description}</p>
        )}
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
