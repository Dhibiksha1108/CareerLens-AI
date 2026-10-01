import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { JobAnalysisRecord } from '../types';
import { Lightbulb, ArrowRight, BookOpen, Code, Compass, CheckCircle2 } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const [matches, setMatches] = useState<JobAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await apiClient.get<JobAnalysisRecord[]>('/jobs/matches');
        setMatches(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const latestMatch = matches[0];
  const missingSkills = latestMatch?.missingSkills || ['Kubernetes', 'AWS', 'Next.js'];
  const partialSkills = latestMatch?.partialSkills || [];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-emerald-600" />
          Personalized Career Recommendations
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Targeted project ideas, coursework modules, and resume improvements dynamically synthesized from your verified skills and recent job compatibility gap analyses.
        </p>
      </div>

      {latestMatch ? (
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Grounded in Recent Analysis</span>
            <p className="font-bold text-slate-900">
              Recommendations prioritized for <span className="underline decoration-emerald-500">{latestMatch.jobTitle}</span> ({latestMatch.matchResult?.matchPercentage || 80}% match)
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Code className="w-4 h-4 text-emerald-600" />
          Targeted Upskilling Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missingSkills.slice(0, 4).map((skill, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Bridge Skill Gap: {skill}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  High Impact
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Build an end-to-end production module leveraging <strong>{skill}</strong>. Containerize and integrate with automated CI/CD pipelines to furnish verifiable repository evidence.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <span>View recommended starter architecture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {partialSkills.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600" />
            Transferable Skills Positioning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partialSkills.map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="text-emerald-700 font-extrabold">{p.candidateSkill}</span>
                  <ArrowRight className="w-3 h-3 text-amber-600" />
                  <span className="text-slate-800">{p.jobSkill}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
