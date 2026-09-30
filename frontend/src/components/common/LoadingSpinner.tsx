import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mb-2" />
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </div>
  );
};
