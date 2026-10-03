import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AtsReadabilityAnalyzer } from '../components/resume/AtsReadabilityAnalyzer';
import {
  FileCheck2,
  Map,
  Lightbulb,
  Sparkles,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';

export const AtsAnalyzerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || undefined;
  const resumeParam = searchParams.get('resumeId') || undefined;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              ATS + Human Readability Analyzer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Phase 4B
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated Applicant Tracking System compatibility, role-specific keyword density, section structure validation, and 6-second recruiter scanning diagnostics.
          </p>
        </div>

        {/* Quick Nav Links to Other Phases */}
        <div className="flex items-center gap-2">
          {roleParam && (
            <Link
              to={`/recommendations?role=${encodeURIComponent(roleParam)}`}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Phase 2D: Recommendations</span>
            </Link>
          )}
          <Link
            to={roleParam ? `/roadmap?role=${encodeURIComponent(roleParam)}` : '/roadmap'}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 3: Learning Roadmap</span>
          </Link>
          <Link
            to={roleParam ? `/simulator?role=${encodeURIComponent(roleParam)}` : '/simulator'}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Phase 4A: Simulator</span>
          </Link>
        </div>
      </div>

      {/* Main Analyzer Component */}
      <AtsReadabilityAnalyzer initialResumeId={resumeParam} initialRole={roleParam} />
    </div>
  );
};
