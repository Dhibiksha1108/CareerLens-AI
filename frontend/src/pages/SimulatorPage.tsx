import React, { useState } from 'react';
import { apiClient } from '../services/apiClient';
import { Sliders, Play, TrendingUp } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [addedSkills, setAddedSkills] = useState('Power BI, Machine Learning');
  const [addedProjects, setAddedProjects] = useState('Python Data Analysis Showcase');
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole) return;
    setSimulating(true);
    try {
      const skillsArr = addedSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const projArr = addedProjects.split(',').map((p) => p.trim()).filter(Boolean);
      const res = await apiClient.post('/simulator/simulate', {
        targetRole,
        addedSkills: skillsArr,
        addedProjects: projArr
      });
      setSimResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" /> Career Readiness Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Simulate target role match improvements by adding hypothetical skills & projects.
        </p>
      </div>

      <form onSubmit={handleSimulate} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Simulation Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Data Analyst"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hypothetical Skills to Add</label>
            <input
              type="text"
              value={addedSkills}
              onChange={(e) => setAddedSkills(e.target.value)}
              placeholder="Power BI, Machine Learning"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hypothetical Projects to Add</label>
            <input
              type="text"
              value={addedProjects}
              onChange={(e) => setAddedProjects(e.target.value)}
              placeholder="Data Analysis Showcase"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={simulating}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {simulating ? 'Simulating...' : 'Run Simulation'}
        </button>
      </form>

      {simResult && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Simulation Outcome</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 block">Baseline Match Score</span>
              <span className="text-xl font-extrabold text-slate-700">{simResult.currentMatchScore}%</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 block">Simulated Score</span>
              <span className="text-xl font-extrabold text-emerald-700">{simResult.projectedMatchScore}%</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 block">Score Lift (Delta)</span>
              <span className="text-xl font-extrabold text-teal-700 flex items-center justify-center gap-1">
                <TrendingUp className="w-5 h-5" /> +{simResult.delta}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
