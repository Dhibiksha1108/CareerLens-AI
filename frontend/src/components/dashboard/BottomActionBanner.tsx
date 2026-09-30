import React from 'react';
import { Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BottomActionBanner: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Your Potential is Clear. Now Make It Real.
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Keep improving your profile and follow your personalized roadmap to reach your career goals.
          </p>
        </div>
      </div>

      <Link
        to="/recommendations"
        className="px-5 py-2.5 bg-[#064e3b] hover:bg-[#065f46] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all shrink-0 hover:shadow-md"
      >
        <span>Explore Recommendations</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
