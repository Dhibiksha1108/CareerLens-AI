import React from 'react';
import { Sprout, Mountain } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const HeroBanner: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] || 'Dhibiksha';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* Welcome Greeting Box (Left 2/3) */}
      <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Good morning, {userName} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Here's an overview of your career profile.
            </p>
          </div>

          {/* Quote Badge */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center space-x-2 shrink-0 max-w-xs">
            <Sprout className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[11px] font-semibold text-amber-900 italic">
              "Small steps today, a stronger tomorrow."
            </p>
          </div>
        </div>
      </div>

      {/* Inspirational Illustration Banner (Right 1/3) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white shadow-xs flex flex-col justify-between relative overflow-hidden group">
        <div className="relative z-10 space-y-1">
          <h2 className="text-lg font-bold tracking-tight">
            You're on the right path.
          </h2>
          <p className="text-xs text-emerald-100 font-medium max-w-xs leading-relaxed">
            Keep building, keep learning, keep growing.
          </p>
        </div>

        <div className="relative z-10 pt-4 flex items-center space-x-2 text-[11px] font-semibold text-emerald-200">
          <Mountain className="w-4 h-4 text-emerald-300" />
          <span>Career Horizon • Phase 1B Active</span>
        </div>

        {/* Soft Background Art Shapes */}
        <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-emerald-500/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/20 rounded-full blur-lg" />
      </div>
    </div>
  );
};
