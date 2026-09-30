import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface JobMatchCardProps {
  targetRole?: string;
  matchScore?: number;
  matchingCount?: number;
  partialCount?: number;
  missingCount?: number;
}

export const JobMatchCard: React.FC<JobMatchCardProps> = ({
  targetRole = 'Data Analyst',
  matchScore = 72,
  matchingCount = 10,
  partialCount = 3,
  missingCount = 4
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Job Match
          </h2>
          <Link
            to="/jobs"
            className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold transition-colors"
          >
            Analyze New Job →
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around my-4 gap-6">
          {/* Donut Score Gauge */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-100"
                fill="transparent"
              />
              <motion.circle
                cx="56"
                cy="56"
                r="44"
                stroke="#10b981"
                strokeWidth="8"
                strokeDasharray="276"
                initial={{ strokeDashoffset: 276 }}
                animate={{ strokeDashoffset: 276 - (276 * matchScore) / 100 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-extrabold text-slate-900 leading-none block">
                {matchScore}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 uppercase tracking-wider">
                Match Score
              </span>
            </div>
          </div>

          {/* Role & Breakdown Legend */}
          <div className="space-y-3 flex-1 max-w-xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Target Role
              </span>
              <span className="text-base font-bold text-slate-900 block">
                {targetRole}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong className="font-bold text-slate-900">{matchingCount}</strong> Matching Skills</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span><strong className="font-bold text-slate-900">{partialCount}</strong> Partial Skills</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span><strong className="font-bold text-slate-900">{missingCount}</strong> Missing Skills</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
