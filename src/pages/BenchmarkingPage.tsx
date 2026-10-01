import React from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Award } from 'lucide-react';

export const BenchmarkingPage: React.FC = () => {
  const benchmarks = [
    { domain: 'Frontend Development (React, TypeScript)', candidateScore: 92, industryAverage: 78, percentile: 'Top 10%' },
    { domain: 'Backend & APIs (Node.js, Express, REST)', candidateScore: 88, industryAverage: 72, percentile: 'Top 15%' },
    { domain: 'Databases & Querying (PostgreSQL, Redis)', candidateScore: 85, industryAverage: 70, percentile: 'Top 18%' },
    { domain: 'DevOps & Tooling (Docker, Git, CI/CD)', candidateScore: 78, industryAverage: 65, percentile: 'Top 25%' },
    { domain: 'Cloud & Orchestration (AWS, Kubernetes)', candidateScore: 52, industryAverage: 60, percentile: 'Developing' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Market Benchmarking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Objective competency comparisons comparing your verified profile against real tech hiring thresholds for Full Stack and Systems Engineering.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Benchmark Profile
            </span>
            <h2 className="text-base font-extrabold text-slate-900 mt-1">Senior Full Stack Engineer Baseline</h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold text-emerald-700">Top 15% Percentile</span>
            <p className="text-[10px] text-slate-400">Aggregated Competency</p>
          </div>
        </div>

        <div className="space-y-5">
          {benchmarks.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{item.domain}</span>
                <span className="font-extrabold text-slate-900">
                  {item.candidateScore}% <span className="text-slate-400 font-normal">(Avg: {item.industryAverage}%)</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${item.candidateScore}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                  style={{ left: `${item.industryAverage}%` }}
                  title={`Industry average: ${item.industryAverage}%`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Standing: <strong className="text-emerald-700">{item.percentile}</strong></span>
                <span>Threshold: {item.industryAverage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
