import React from 'react';
import { Link } from 'react-router-dom';
import type { ICareerAnalyticsData } from '../../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Target,
  ShieldCheck,
  Award,
  Sparkles,
  Map,
  FolderGit2,
  FileCheck2,
  SlidersHorizontal,
  ArrowRight,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Check,
  Clock,
  ExternalLink,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';

interface ExecutiveDashboardViewProps {
  analytics: ICareerAnalyticsData;
  onSelectRole: (role: string) => void;
  onNavigateTab: (tabId: 'dashboard' | 'analytics' | 'charts' | 'readiness' | 'matrix') => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  analytics,
  onSelectRole,
  onNavigateTab
}) => {
  const {
    targetRole,
    availableRoles,
    readinessSummary,
    jobCompatibilityAnalytics,
    skillGapDistribution,
    learningRoadmapAnalytics,
    projectPortfolioProgress,
    careerBenchmarkComparison,
    skillChartsData,
    readinessVisualization,
    progressTracking
  } = analytics;

  // Donut pie data for Verified vs Missing Skills
  const verifiedVsMissingPieData = [
    { name: 'Verified Competencies', value: skillChartsData.verifiedVsMissing.verifiedCount, fill: '#10b981' },
    { name: 'Skill Gaps to Acquire', value: skillChartsData.verifiedVsMissing.missingCount, fill: '#f43f5e' }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Executive Quick Nav Bar & Module Jump */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
              Phase 5E Interactive Executive Dashboard
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-300 font-medium">Synchronized with: <strong className="text-white">{targetRole}</strong></span>
          </div>
          <h2 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Executive Intelligence Command Center
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          <button
            onClick={() => onNavigateTab('analytics')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>5A Analytics</span>
          </button>
          <button
            onClick={() => onNavigateTab('charts')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
          >
            <PieChart className="w-3.5 h-3.5 text-blue-400" />
            <span>5B Charts</span>
          </button>
          <button
            onClick={() => onNavigateTab('readiness')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>5C Readiness</span>
          </button>
          <Link
            to={`/progress?role=${encodeURIComponent(targetRole)}`}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>5D Progress</span>
          </Link>
          <button
            onClick={() => onNavigateTab('matrix')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Matrix</span>
          </button>
        </div>
      </div>

      {/* 2. Top Executive KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Career Readiness */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Career Readiness
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {readinessSummary.candidatePercentile}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{readinessSummary.overallReadiness}%</span>
            <span className="text-xs text-slate-500 font-medium">vs Industry {readinessSummary.industryBaseline}%</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-emerald-700 font-bold">+{readinessSummary.potentialUplift}% Potential Uplift</span>
            <button
              onClick={() => onNavigateTab('readiness')}
              className="text-slate-400 hover:text-emerald-700 flex items-center gap-0.5 font-semibold text-[11px]"
            >
              <span>Readiness</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 2: Target Role Match */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" /> Target Role Fit
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {jobCompatibilityAnalytics.selectedRoleMatch}% Match
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-700">{jobCompatibilityAnalytics.selectedRoleMatch}%</span>
            <span className="text-xs text-slate-500 font-medium">Compatibility</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-600 truncate max-w-[150px]">{targetRole}</span>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-slate-400 hover:text-blue-700 flex items-center gap-0.5 font-semibold text-[11px]"
            >
              <span>Compare</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 3: Skill Coverage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" /> Verified Skills
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {skillChartsData.verifiedVsMissing.verifiedPercent}% Coverage
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{skillChartsData.verifiedVsMissing.verifiedCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {skillChartsData.verifiedVsMissing.totalCount} Skills</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-rose-600 font-semibold">{skillChartsData.verifiedVsMissing.missingCount} Gaps to Bridge</span>
            <button
              onClick={() => onNavigateTab('charts')}
              className="text-slate-400 hover:text-emerald-700 flex items-center gap-0.5 font-semibold text-[11px]"
            >
              <span>Charts</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 4: Roadmap & Milestones */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-4 h-4 text-purple-600" /> Roadmap Milestones
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {learningRoadmapAnalytics.overallMilestoneProgress.percent}% Done
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700">{learningRoadmapAnalytics.overallMilestoneProgress.completed}</span>
            <span className="text-xs text-slate-400 font-medium">/ {learningRoadmapAnalytics.overallMilestoneProgress.total} Milestones</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-600">{learningRoadmapAnalytics.stages.length} Roadmap Stages</span>
            <Link
              to={`/progress?role=${encodeURIComponent(targetRole)}`}
              className="text-slate-400 hover:text-purple-700 flex items-center gap-0.5 font-semibold text-[11px]"
            >
              <span>Progress</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Visual Analytics Core (Readiness Trajectory & Multi-Role Fit) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart A: Career Readiness Trajectory Area Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Readiness Progression Curve
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Baseline through verified standing to max market potential for {targetRole}.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              +{readinessSummary.potentialUplift}% Uplift
            </span>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readinessSummary.readinessTrend}>
                <defs>
                  <linearGradient id="execReadinessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% Readiness`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#execReadinessGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Role Compatibility Comparison Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" /> Multi-Role Market Compatibility
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Candidate fit across recommended market roles (active role highlighted in green).
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Active: <strong className="text-slate-800">{targetRole}</strong>
            </span>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobCompatibilityAnalytics.roleComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="role" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% Fit`, 'Compatibility']}
                />
                <Bar dataKey="matchPercentage" radius={[6, 6, 0, 0]}>
                  {jobCompatibilityAnalytics.roleComparison.map((entry, index) => (
                    <Cell key={`exec-cell-${index}`} fill={entry.isSelected ? '#059669' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Phase 5D: Visual Progress Tracking Command Snapshot */}
      {progressTracking && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> Phase 5D: Visual Progress Tracking Multi-Track
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                  Live MongoDB Data
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Real-time progress status across roadmap milestones, skill acquisition, practical projects, and verified portfolio proofs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/progress?role=${encodeURIComponent(targetRole)}`}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs"
              >
                <span>Full Progress View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 4-Track Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Track 1: Milestones */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Map className="w-3.5 h-3.5 text-emerald-600" /> Milestones
                </span>
                <span className="font-extrabold text-emerald-700">
                  {progressTracking.roadmapMilestones.percentComplete}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${progressTracking.roadmapMilestones.percentComplete}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Done: <strong className="text-slate-800">{progressTracking.roadmapMilestones.completedMilestones}</strong></span>
                <span>Remaining: <strong className="text-slate-800">{progressTracking.roadmapMilestones.remainingMilestones}</strong></span>
              </div>
            </div>

            {/* Track 2: Skills */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" /> Skill Acquisition
                </span>
                <span className="font-extrabold text-blue-700">
                  {progressTracking.skillAcquisition.acquisitionRate}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${progressTracking.skillAcquisition.acquisitionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Acquired: <strong className="text-slate-800">{progressTracking.skillAcquisition.acquiredSkillsCount}</strong></span>
                <span>Gaps: <strong className="text-rose-600">{progressTracking.skillAcquisition.remainingSkillsCount}</strong></span>
              </div>
            </div>

            {/* Track 3: Practical Projects */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <FolderGit2 className="w-3.5 h-3.5 text-purple-600" /> Projects
                </span>
                <span className="font-extrabold text-purple-700">
                  {progressTracking.practicalProjects.completionPercentage}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all"
                  style={{ width: `${progressTracking.practicalProjects.completionPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Done: <strong className="text-slate-800">{progressTracking.practicalProjects.completedCount}</strong></span>
                <span>In Progress: <strong className="text-amber-600">{progressTracking.practicalProjects.inProgressCount}</strong></span>
              </div>
            </div>

            {/* Track 4: Portfolio Evidence */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Portfolio Proofs
                </span>
                <span className="font-extrabold text-emerald-700">
                  {progressTracking.portfolioEvidence.overallEvidenceScore}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${progressTracking.portfolioEvidence.overallEvidenceScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Verified: <strong className="text-slate-800">{progressTracking.portfolioEvidence.verifiedProofCount}</strong></span>
                <span>Sources: <strong className="text-slate-800">{progressTracking.portfolioEvidence.evidenceSources.filter(s => s.verified).length} active</strong></span>
              </div>
            </div>
          </div>

          {/* 5-Stage Trajectory Stepper */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Career-Readiness Stage Trajectory:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {progressTracking.overallReadinessProgress.trajectoryStages.map((st, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center transition ${
                    st.status === 'current'
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : st.status === 'completed'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-200/70 opacity-75'
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Stage {idx + 1}</span>
                  <span className="text-xs font-bold text-slate-800 block truncate mt-0.5">{st.stage}</span>
                  <span className={`text-base font-black ${st.status === 'current' ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {st.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Phase 5C: Career Readiness Visualizations Snapshot */}
      {readinessVisualization && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Phase 5C: Career Readiness Visualizations
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  {readinessVisualization.readinessLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Benchmarking target role threshold expectations ({readinessVisualization.targetRoleThreshold}%) vs candidate standing ({readinessVisualization.overallScore}%).
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('readiness')}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto"
            >
              <span>Explore Readiness View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Readiness Level & Threshold */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Threshold Delta
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{readinessVisualization.overallScore}%</span>
                  <span className="text-xs text-slate-400 font-medium">/ {readinessVisualization.targetRoleThreshold}% Target</span>
                </div>
                <p className="text-xs text-slate-600">
                  {readinessVisualization.gapToTargetThreshold > 0
                    ? `Requires +${readinessVisualization.gapToTargetThreshold}% more points to achieve target job-ready threshold.`
                    : 'Target threshold met! You are positioned at or above market expectation.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Market Standing:</span>
                <span className="font-extrabold text-emerald-700">{readinessVisualization.candidatePercentile}</span>
              </div>
            </div>

            {/* Strengths vs Gaps Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Strengths vs Gaps</span>
                  <span className="text-emerald-700 font-bold">{readinessVisualization.strengthsVsGaps.strengthsRatio}% Verified</span>
                </div>
                <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${readinessVisualization.strengthsVsGaps.strengthsRatio}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${100 - readinessVisualization.strengthsVsGaps.strengthsRatio}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-emerald-700 font-bold">{readinessVisualization.strengthsVsGaps.strengthsCount} Strengths</span>
                  <span className="text-rose-600 font-bold">{readinessVisualization.strengthsVsGaps.gapsCount} Skill Gaps</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
                <span>Top Gap to Fix:</span>
                <span className="font-bold text-rose-700 truncate max-w-[140px]">
                  {readinessVisualization.strengthsVsGaps.gaps[0]?.skill || 'None'}
                </span>
              </div>
            </div>

            {/* Top Improvement Levers */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Key Improvement Levers
                </span>
                <div className="space-y-1.5">
                  {readinessVisualization.improvementPotential.levers.slice(0, 2).map((lever, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-slate-200/60">
                      <span className="text-slate-700 font-medium truncate max-w-[160px]">{lever.title}</span>
                      <span className="text-emerald-700 font-extrabold shrink-0 ml-1">+{lever.gainPercent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Potential Gain:</span>
                <span className="font-extrabold text-emerald-700">+{readinessVisualization.improvementPotential.potentialGain}% Uplift</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Skill & Benchmark Deep Dive (Donut Skill Ratio & Domain Benchmark Bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Verified vs Missing Skills Donut */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Skill Coverage Ratio
            </h3>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {skillChartsData.verifiedVsMissing.verifiedPercent}%
            </span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verifiedVsMissingPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {verifiedVsMissingPieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Verified</span>
              <span className="text-base font-black text-emerald-700">{skillChartsData.verifiedVsMissing.verifiedCount}</span>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] uppercase font-bold text-rose-800 block">Missing</span>
              <span className="text-base font-black text-rose-700">{skillChartsData.verifiedVsMissing.missingCount}</span>
            </div>
          </div>
        </div>

        {/* Domain Benchmark Comparison */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-600" /> Industry Domain Competency Benchmark
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Candidate score compared against industry baseline and target threshold across engineering domains.
              </p>
            </div>
            <Link
              to={`/benchmarking?role=${encodeURIComponent(targetRole)}`}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <span>Full Benchmark</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={careerBenchmarkComparison.domainComparisons}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="domain" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" height={40} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="candidateScore" name="Your Verified Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="industryAverage" name="Industry Average" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="targetExpectation" name="Target Expectation" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 7. Interactive Quick-Switch Target Role Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" /> Switch Target Role (Real-Time Dashboard Synchronization)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select any role to re-evaluate the entire dashboard and charts dynamically against that role’s expectations.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {availableRoles.length} Market Roles Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          {availableRoles.map(role => {
            const isSelected = role.trim().toLowerCase() === targetRole.trim().toLowerCase();
            return (
              <button
                key={role}
                onClick={() => onSelectRole(role)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between space-y-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <span className="text-xs font-bold leading-tight line-clamp-2">{role}</span>
                {isSelected ? (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold opacity-60">Switch</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboardView;
