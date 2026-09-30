import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { CareerRoadmapRecord } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Map, Plus, CheckCircle2, Circle } from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<CareerRoadmapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchRoadmaps = async () => {
    try {
      const res = await apiClient.get<CareerRoadmapRecord[]>('/roadmap');
      setRoadmaps(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole) return;
    setGenerating(true);
    try {
      await apiClient.post('/roadmap/generate', { targetRole });
      setTargetRole('');
      fetchRoadmaps();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-600" /> Career Growth Roadmap
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Progressive stage-by-stage learning path structured for target role readiness.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Generate Target Role Roadmap</h2>
        <div className="flex gap-3">
          <input
            type="text"
            required
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Data Analyst / Senior Backend Engineer"
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={generating || !targetRole}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Roadmap'}
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : roadmaps.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No Career Roadmap Generated"
          description="Specify your target role above to generate a customized stage-by-stage learning plan."
        />
      ) : (
        <div className="space-y-6">
          {roadmaps.map((r) => (
            <div key={r._id} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{r.targetRole} Roadmap</h2>
                  <p className="text-xs text-slate-500 font-medium">Total Stages: {r.stages?.length || 0}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 block">Overall Completion</span>
                  <span className="text-xl font-extrabold text-emerald-700">{r.progress}%</span>
                </div>
              </div>

              <div className="space-y-4">
                {r.stages?.map((stage) => (
                  <div key={stage.order} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {stage.order}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900">{stage.title}</h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                          {stage.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{stage.description}</p>
                      
                      <div className="space-y-1.5 pt-2">
                        {stage.tasks?.map((t) => (
                          <div key={t.id} className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
                            {t.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className={t.completed ? 'line-through text-slate-400' : ''}>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
