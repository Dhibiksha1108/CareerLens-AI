import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      {message && <p className="text-xs text-slate-500 font-medium">{message}</p>}
    </div>
  );
};
