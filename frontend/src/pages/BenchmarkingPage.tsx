import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BarChart3, TrendingUp, CheckCircle } from 'lucide-react';

export const BenchmarkingPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        const res = await apiClient.get('/benchmarking');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenchmarks();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" /> Peer & Industry Benchmarking
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comparative profile analysis against industry standards and candidate benchmarks.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !data ? (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 text-center text-slate-500 text-xs font-medium">
          Unable to compute benchmarks. Please add skills and projects first.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-400">Candidate Score</span>
              <div className="text-2xl font-extrabold text-emerald-700">{data.userMetrics?.overallScore || 0} / 100</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-400">Market Avg Score</span>
              <div className="text-2xl font-extrabold text-slate-800">{data.marketBenchmarks?.avgScore || 0} / 100</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-400">Target Percentile Rank</span>
              <div className="text-2xl font-extrabold text-teal-700 flex items-center gap-1">
                <TrendingUp className="w-5 h-5" /> Top {data.rankPercentile || 50}%
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Benchmarking Metrics</h2>
            <div className="space-y-3 text-xs text-slate-700 font-medium">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span>Verified Skills Count</span>
                <span className="font-bold text-emerald-700">{data.userMetrics?.skillsCount} vs Industry Avg ({data.marketBenchmarks?.avgSkillsCount})</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span>Engineering Projects Cataloged</span>
                <span className="font-bold text-emerald-700">{data.userMetrics?.projectCount} vs Industry Avg ({data.marketBenchmarks?.avgProjectCount})</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span>Resume Document Uploaded</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {data.userMetrics?.resumeUploaded ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
