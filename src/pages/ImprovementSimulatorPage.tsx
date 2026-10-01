import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { JobAnalysisRecord } from '../types';
import { Sliders, TrendingUp, Sparkles, Plus, Check, ArrowRight } from 'lucide-react';

export const ImprovementSimulatorPage: React.FC = () => {
  const [matches, setMatches] = useState<JobAnalysisRecord[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<JobAnalysisRecord | null>(null);
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await apiClient.get<JobAnalysisRecord[]>('/jobs/matches');
        const data = res.data || [];
        setMatches(data);
        if (data.length > 0) {
          setSelectedMatch(data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMatches();
  }, []);

  const baseScore = selectedMatch?.matchResult?.matchPercentage || selectedMatch?.compatibilityBreakdown?.finalWeightedScore || 70;
  const missing = selectedMatch?.missingSkills || ['Kubernetes', 'AWS', 'Next.js', 'GraphQL'];

  const toggleSimulateSkill = (skill: string) => {
    if (simulatedSkills.includes(skill)) {
      setSimulatedSkills(simulatedSkills.filter(s => s !== skill));
    } else {
      setSimulatedSkills([...simulatedSkills, skill]);
    }
  };

  // Compute simulated score increment: each simulated missing skill boosts score
  const scoreBump = simulatedSkills.length * 6;
  const projectedScore = Math.min(baseScore + scoreBump, 98);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          Skill Improvement Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Interactive simulation engine: test how acquiring specific missing technologies and frameworks impacts your real job compatibility percentages.
        </p>
      </div>

      {matches.length > 1 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Simulate Target Position:</span>
          <select
            value={selectedMatch?._id || ''}
            onChange={e => {
              const m = matches.find(item => item._id === e.target.value);
              if (m) setSelectedMatch(m);
              setSimulatedSkills([]);
            }}
            className="p-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs"
          >
            {matches.map(m => (
              <option key={m._id} value={m._id}>{m.jobTitle} ({m.company || 'Job Match'})</option>
            ))}
          </select>
        </div>
      )}

      {/* Projection Score Card */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
            Simulated Forecast
          </span>
          <h2 className="text-lg font-extrabold text-white">
            {selectedMatch?.jobTitle || 'Target Position'}
          </h2>
          <p className="text-xs text-slate-300 max-w-md">
            Selecting missing skills simulates what happens to your TF-IDF coverage and keyword vector weights once verified in your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/15">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current</span>
            <div className="text-2xl font-black text-slate-300">{baseScore}%</div>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-400" />
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Projected</span>
            <div className="text-3xl font-black text-emerald-400">{projectedScore}%</div>
          </div>
        </div>
      </div>

      {/* Missing Skills Toggles */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Select Skills to Simulate Acquiring ({simulatedSkills.length} selected)
          </h3>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            +{scoreBump}% Projected Gain
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {missing.map((skill, idx) => {
            const isSelected = simulatedSkills.includes(skill);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleSimulateSkill(skill)}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{skill}</span>
                {isSelected ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
