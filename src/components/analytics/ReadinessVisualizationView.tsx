import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ICareerAnalyticsData } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  Info,
  Clock,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';

interface ReadinessVisualizationViewProps {
  analytics: ICareerAnalyticsData;
  onSelectRole: (role: string) => void;
}

export const ReadinessVisualizationView: React.FC<ReadinessVisualizationViewProps> = ({
  analytics,
  onSelectRole
}) => {
  const {
    targetRole,
    readinessVisualization,
    readinessSummary,
    jobCompatibilityAnalytics
  } = analytics;

  // Local state for strengths vs gaps filter
  const [sgTab, setSgTab] = useState<'all' | 'strengths' | 'gaps'>('all');
  const [comparisonView, setComparisonView] = useState<'bars' | 'radar'>('bars');

  if (!readinessVisualization) {
    return null;
  }

  const {
    overallScore,
    targetRoleThreshold,
    gapToTargetThreshold,
    readinessLevel,
    candidatePercentile,
    strengthsVsGaps,
    currentVsTargetComparison,
    industryBenchmarkSummary,
    improvementPotential,
    roleReadinessComparison
  } = readinessVisualization;

  // Donut chart data for Strengths vs Gaps
  const strengthsGapsPieData = [
    { name: 'Verified Strengths', value: strengthsVsGaps.strengthsCount, fill: '#10b981' },
    { name: 'Target Role Gaps', value: strengthsVsGaps.gapsCount, fill: '#f43f5e' }
  ];

  // Radar data for domain benchmark comparison
  const radarData = industryBenchmarkSummary.domains.map(d => ({
    domain: d.domain.replace(' & ', '\n& '),
    Candidate: d.candidateScore,
    Industry: d.industryAverage,
    Target: d.targetExpectation
  }));

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Overall Readiness Score & Key Performance Indicators Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Readiness Gauge Card */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Overall Readiness
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {candidatePercentile}
            </span>
          </div>

          {/* Large Radial Display */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Active Score Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={overallScore >= 75 ? '#059669' : overallScore >= 50 ? '#0284c7' : '#d97706'}
                  strokeWidth="10"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - overallScore / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 leading-none">{overallScore}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Readiness</span>
              </div>
            </div>
          </div>

          {/* Readiness Standing Tag & Details */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Evaluation Level:</span>
              <span className={`font-extrabold ${
                readinessLevel === 'Job Ready'
                  ? 'text-emerald-700'
                  : readinessLevel === 'Competitive'
                  ? 'text-blue-700'
                  : 'text-amber-700'
              }`}>
                {readinessLevel}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Target Role:</span>
              <span className="font-bold text-slate-900 truncate max-w-[160px]">{targetRole}</span>
            </div>
          </div>
        </div>

        {/* Current vs Target-Role Readiness Summary Card */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" /> Current vs Target Role
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                Target: {targetRoleThreshold}%
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Candidate vs Target Bar Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Your Current Standing</span>
                  <span className="font-bold text-slate-900">{overallScore}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(overallScore, 100)}%` }}
                  />
                </div>
              </div>

              {/* Target Threshold Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Market Job-Ready Threshold</span>
                  <span className="font-bold text-indigo-700">{targetRoleThreshold}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${targetRoleThreshold}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gap to Threshold Callout */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
            {gapToTargetThreshold > 0 ? (
              <p className="text-slate-700">
                Remaining Gap to Target Threshold:{' '}
                <strong className="text-rose-600 font-extrabold">-{gapToTargetThreshold}%</strong>.
                Closing high priority technical gaps will close this distance.
              </p>
            ) : (
              <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Profile meets or exceeds recommended market threshold for {targetRole}!
              </p>
            )}
          </div>
        </div>

        {/* Readiness Improvement & Potential Uplift Card */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Improvement Potential
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                +{improvementPotential.potentialGain}% Projected Uplift
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700">
                {improvementPotential.projectedReadiness}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Max Projected Potential (from {overallScore}%)
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Targeted focus on identified skills unlocks immediate readiness gains for {targetRole}.
            </p>
          </div>

          {/* Top Simulation Levers */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Top Readiness Levers
            </span>
            <div className="space-y-1">
              {improvementPotential.levers.slice(0, 2).map((l, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 truncate max-w-[200px]">{l.title}</span>
                  <span className="text-emerald-700 font-extrabold shrink-0">+{l.gainPercent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Current vs Target-Role Multi-Metric Comparison (Visual Bars & Radar) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Current vs Target-Role Readiness Metrics
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparison across core technical pillars: candidate score vs market target expectation vs industry average.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setComparisonView('bars')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                comparisonView === 'bars'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bar View
            </button>
            <button
              onClick={() => setComparisonView('radar')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                comparisonView === 'radar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Radar View
            </button>
          </div>
        </div>

        {comparisonView === 'bars' ? (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentVsTargetComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="candidateScore" name="Your Readiness" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="industryAverage" name="Industry Average" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="targetExpectation" name="Target Expectation" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full pt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Radar name="Your Score" dataKey="Candidate" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                <Radar name="Industry Average" dataKey="Industry" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                <Radar name="Target Expectation" dataKey="Target" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. Strengths vs Gaps Breakdown (Donut Ratio & Itemized Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Donut Chart Ratio */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Strengths vs Gaps Ratio
            </h3>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {strengthsVsGaps.strengthsRatio}% Verified
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={strengthsGapsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {strengthsGapsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} competencies`, 'Count']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Verified Strengths</span>
              <span className="text-lg font-black text-emerald-700">{strengthsVsGaps.strengthsCount}</span>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] uppercase font-bold text-rose-800 block">Target Gaps</span>
              <span className="text-lg font-black text-rose-700">{strengthsVsGaps.gapsCount}</span>
            </div>
          </div>
        </div>

        {/* Itemized Strengths & Gaps Explorer */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Verified Strengths & Missing Competencies
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Detailed audit of skills meeting expectations vs priorities requiring development for {targetRole}.
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              {(['all', 'strengths', 'gaps'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSgTab(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    sgTab === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'strengths' ? `Strengths (${strengthsVsGaps.strengthsCount})` : `Gaps (${strengthsVsGaps.gapsCount})`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {/* Strengths list */}
            {(sgTab === 'all' || sgTab === 'strengths') &&
              strengthsVsGaps.strengths.map(s => (
                <div
                  key={s.skill}
                  className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {s.skill}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{s.category}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">
                    Verified
                  </span>
                </div>
              ))}

            {/* Gaps list */}
            {(sgTab === 'all' || sgTab === 'gaps') &&
              strengthsVsGaps.gaps.map(g => (
                <div
                  key={g.skill}
                  className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {g.skill}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{g.category} · {g.estimatedHours} hrs</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    g.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {g.priority} Gap
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 4. Industry Benchmark Comparison (Domains Bar Chart) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-600" /> Industry Benchmark Comparison by Domain
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Detailed technical domain comparison comparing your verified capability against the industry baseline ({industryBenchmarkSummary.industryAverage}%) and target threshold.
            </p>
          </div>
          <Link
            to={`/benchmarking?role=${encodeURIComponent(targetRole)}`}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Benchmark (Phase 4C)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={industryBenchmarkSummary.domains}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="domain" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" height={45} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="candidateScore" name="Your Verified Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="industryAverage" name="Industry Average" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="targetExpectation" name="Target Expectation" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Role-Specific Readiness Across All Target Roles (Interactive Multi-Role Selector) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" /> Role-Specific Readiness Comparison
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Compare your readiness across multiple tech roles. Click any role to instantly switch target and update all visualizations.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Active: <strong className="text-slate-900">{targetRole}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {roleReadinessComparison.map(item => {
            const isSelected = item.isSelected;
            return (
              <button
                key={item.role}
                onClick={() => onSelectRole(item.role)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">{item.role}</span>
                    <span className="text-[10px] text-slate-500">{item.status}</span>
                  </div>
                  {isSelected ? (
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Switch</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Readiness Score</span>
                    <span className={`text-base font-black ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {item.readinessScore}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.min(item.readinessScore, 100)}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReadinessVisualizationView;
