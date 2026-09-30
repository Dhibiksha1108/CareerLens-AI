import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { RecommendationRecord } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Lightbulb, CheckCircle, Clock } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const [recs, setRecs] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = async () => {
    try {
      const res = await apiClient.get<RecommendationRecord[]>('/recommendations');
      setRecs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleStatus = async (id: string, status: 'completed' | 'in_progress') => {
    try {
      await apiClient.patch(`/recommendations/${id}/status`, { status });
      fetchRecs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-emerald-600" /> Recommended Action Items
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Prioritized engineering project suggestions, skill acquisition steps, and profile improvements.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : recs.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No Recommendations Available"
          description="Complete target job gap analysis or upload projects to receive custom recommendations."
        />
      ) : (
        <div className="space-y-3">
          {recs.map((item) => (
            <div key={item._id} className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {item.type}
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 uppercase">
                    {item.priority} priority
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {item.status === 'completed' ? (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-200">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                ) : (
                  <button
                    onClick={() => handleStatus(item._id, 'completed')}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
