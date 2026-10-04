import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type { ICareerAnalyticsData } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Target,
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Map,
  FolderGit2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  CheckCheck,
  Search,
  SlidersHorizontal,
  FileCheck2,
  Clock,
  Zap,
  Activity
} from 'lucide-react';

export const CareerAnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const [analytics, setAnalytics] = useState<ICareerAnalyticsData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>(roleFromUrl || '');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 5B Interactive Filter States
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillStatusFilter, setSkillStatusFilter] = useState<'all' | 'verified' | 'missing'>('all');
  const [activeChartTab, setActiveChartTab] = useState<'analytics' | 'charts' | 'matrix'>('analytics');

  // Fetch Career Analytics data from API
  const fetchAnalytics = async (roleName?: string) => {
    try {
      setError(null);
      const queryParam = roleName || selectedRole || roleFromUrl;
      const endpoint = queryParam
        ? `/users/analytics?role=${encodeURIComponent(queryParam)}`
        : '/users/analytics';

      const res = await apiClient.get<ICareerAnalyticsData>(endpoint);
      if (res.data) {
        setAnalytics(res.data);
        setSelectedRole(res.data.targetRole);
      }
    } catch (err: any) {
      console.error('[CareerAnalyticsPage] Error loading analytics:', err);
      setError(err.message || 'Failed to retrieve career visual analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(roleFromUrl || undefined);
  }, [roleFromUrl]);

  // Handle Target Role change
  const handleRoleChange = async (newRole: string) => {
    setSelectedRole(newRole);
    setSearchParams({ role: newRole });
    setRefreshing(true);
    await fetchAnalytics(newRole);
  };

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Generating Career Visual Analytics</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Synthesizing readiness trends, role compatibility analytics, skill-gap distributions, roadmap progress, and interactive skill charts...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Analytics Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'Unable to render career analytics data.'}</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchAnalytics();
          }}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const {
    targetRole,
    availableRoles,
    readinessSummary,
    jobCompatibilityAnalytics,
    skillGapDistribution,
    learningRoadmapAnalytics,
    projectPortfolioProgress,
    careerBenchmarkComparison,
    skillChartsData
  } = analytics;

  // Filter skills for Phase 5B Role Skill Coverage Matrix
  const filteredSkills = skillChartsData.roleSkillCoverage.filter(s => {
    const matchesSearch = s.skill.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(skillSearchQuery.toLowerCase());
    const matchesStatus = skillStatusFilter === 'all' || s.status === skillStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Prepare Pie Chart data for Verified vs Missing Skills
  const verifiedVsMissingPieData = [
    { name: 'Verified Competencies', value: skillChartsData.verifiedVsMissing.verifiedCount, fill: '#10b981' },
    { name: 'Skill Gaps to Acquire', value: skillChartsData.verifiedVsMissing.missingCount, fill: '#f43f5e' }
  ];

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* 1. Header & Role Synchronizer */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Career Analytics & Skill Charts
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Phase 5A + 5B
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive visual analytics covering career readiness trajectories, role compatibility benchmarks, skill distributions, and portfolio progression.
            </p>
          </div>

          {/* Synchronized Role Selector */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <Target className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase text-slate-400">Target Role</span>
              <select
                value={targetRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={refreshing}
                className="text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-hidden cursor-pointer"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchAnalytics(targetRole);
              }}
              disabled={refreshing}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Phase Quick Links Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Related Modules:
          </span>
          <Link
            to="/dashboard"
            className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 4D: Unified Dashboard</span>
          </Link>
          <Link
            to={`/benchmarking?role=${encodeURIComponent(targetRole)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-purple-50 border border-slate-200 text-slate-700 hover:text-purple-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Phase 4C: Benchmarks</span>
          </Link>
          <Link
            to={`/roadmap?role=${encodeURIComponent(targetRole)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Map className="w-3.5 h-3.5 text-indigo-600" />
            <span>Phase 3: Learning Roadmap</span>
          </Link>
          <Link
            to={`/simulator?role=${encodeURIComponent(targetRole)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Phase 4A: Simulator</span>
          </Link>
          <Link
            to={`/ats-analyzer?role=${encodeURIComponent(targetRole)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 4B: ATS Check</span>
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2">
        {[
          { id: 'analytics', label: 'Career Analytics Overview (5A)', icon: TrendingUp },
          { id: 'charts', label: 'Interactive Skill Charts (5B)', icon: PieChart },
          { id: 'matrix', label: `Role Competency Matrix (${skillChartsData.roleSkillCoverage.length})`, icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeChartTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveChartTab(tab.id as any)}
              className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                isActive
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 5A — CAREER ANALYTICS */}
      {activeChartTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top 3 Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Readiness Summary */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
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
                <span className="text-xs text-slate-400 font-medium">vs Industry {readinessSummary.industryBaseline}%</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Potential growth: <strong className="text-emerald-700">+{readinessSummary.potentialUplift}%</strong> projected readiness upon closing key skill gaps.
              </p>
            </div>

            {/* 2. Job Compatibility */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
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
                <span className="text-xs text-slate-400 font-medium">Compatibility</span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                Targeting: <strong className="text-slate-800">{targetRole}</strong> across {jobCompatibilityAnalytics.roleComparison.length} market roles.
              </p>
            </div>

            {/* 3. Portfolio & Milestones */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-purple-600" /> Portfolio Progress
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {projectPortfolioProgress.portfolioReadinessScore}% Evidence
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-700">
                  {projectPortfolioProgress.completedProjects} / {projectPortfolioProgress.totalProjects}
                </span>
                <span className="text-xs text-slate-400 font-medium">Projects Verified</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Milestones: <strong className="text-slate-800">{learningRoadmapAnalytics.overallMilestoneProgress.percent}% completed</strong> ({learningRoadmapAnalytics.overallMilestoneProgress.completed}/{learningRoadmapAnalytics.overallMilestoneProgress.total}).
              </p>
            </div>
          </div>

          {/* Chart 1: Career Readiness Trajectory (Area Chart) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Career Readiness Progression Trend
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Visual growth trajectory from initial baseline through current standing to projected market potential.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                +{readinessSummary.potentialUplift}% Potential Uplift
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={readinessSummary.readinessTrend}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(value: any) => [`${value}% Readiness`, 'Score']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#readinessGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Job Compatibility Comparison Across Market Roles (Bar Chart) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-blue-600" /> Role Compatibility Analytics
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Candidate compatibility percentage across recommended technical career roles.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Active: <strong className="text-slate-800">{targetRole}</strong>
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobCompatibilityAnalytics.roleComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="role" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}% Fit`, 'Compatibility']}
                  />
                  <Bar dataKey="matchPercentage" radius={[6, 6, 0, 0]}>
                    {jobCompatibilityAnalytics.roleComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isSelected ? '#059669' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3 & 4: Skill-Gap Priority Distribution + Roadmap Stage Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Skill-Gap Priority Hours Bar */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Skill-Gap Hours by Priority
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Estimated learning hours required to close High vs Medium vs Low gaps.
                </p>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillGapDistribution.priorityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="priority" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" hrs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} hours`, 'Estimated Effort']}
                    />
                    <Bar dataKey="totalHours" radius={[6, 6, 0, 0]}>
                      {skillGapDistribution.priorityDistribution.map((entry, index) => (
                        <Cell key={`p-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Learning Roadmap Stage Progress */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-indigo-600" /> Roadmap Milestone Completion by Stage
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Milestone achievement across Stage 1 (Foundational), Stage 2 (Systems), Stage 3 (Advanced).
                </p>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learningRoadmapAnalytics.stages}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" height={45} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(val: any) => [`${val}% Complete`, 'Progress']}
                    />
                    <Bar dataKey="percentComplete" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 5: Career Benchmark Comparison (Competency Domains) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-purple-600" /> Competency Domain Benchmark Comparison
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Candidate score compared against industry baseline (70%) and target high-performer expectations.
                </p>
              </div>
              <Link
                to={`/benchmarking?role=${encodeURIComponent(targetRole)}`}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <span>Full Benchmark Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={careerBenchmarkComparison.domainComparisons}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="domain" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" height={45} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="candidateScore" name="Your Verified Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="industryAverage" name="Industry Average" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="targetExpectation" name="Target Expectation" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 5B — INTERACTIVE SKILL CHARTS */}
      {activeChartTab === 'charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Verified vs Missing Skills (Donut Pie Chart) */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-600" /> Verified vs Missing Skills Ratio
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Proportion of target role requirements satisfied by verified candidate evidence.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {skillChartsData.verifiedVsMissing.verifiedPercent}% Coverage
                </span>
              </div>

              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={verifiedVsMissingPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {verifiedVsMissingPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} skills`, 'Count']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Verified Skills</span>
                  <span className="text-lg font-black text-emerald-700">{skillChartsData.verifiedVsMissing.verifiedCount}</span>
                </div>
                <div className="p-2 bg-rose-50/60 rounded-xl border border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">Missing Gaps</span>
                  <span className="text-lg font-black text-rose-700">{skillChartsData.verifiedVsMissing.missingCount}</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Skill-Gap Priority Breakdown (Pie / Bar Chart) */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Skill-Gap Priority Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Missing requirements categorized by hiring urgency (High, Medium, Low).
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Total Gaps: <strong className="text-slate-700">{skillChartsData.verifiedVsMissing.missingCount}</strong>
                </span>
              </div>

              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={skillChartsData.priorityBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {skillChartsData.priorityBreakdown.map((entry, index) => (
                        <Cell key={`pbreak-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} skills`, 'Priority Count']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                {skillChartsData.priorityBreakdown.map(p => (
                  <div key={p.name} className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">{p.name}</span>
                    <span className="text-lg font-black text-slate-800">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Skill Categories / Domains Coverage (Stacked/Grouped Bar Chart) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" /> Skill Coverage Across Technical Domains
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verified competencies vs missing requirements across core engineering domains for {targetRole}.
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillChartsData.categoryCoverage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="verifiedCount" name="Verified Skills" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missingCount" name="Missing Gaps" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Milestone Skill Progress Timeline */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-emerald-600" /> Milestone Skill Achievement Timeline
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tracking competency progress against Phase 3 career roadmap milestones.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {learningRoadmapAnalytics.overallMilestoneProgress.completed} of {learningRoadmapAnalytics.overallMilestoneProgress.total} Milestones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skillChartsData.milestoneSkillProgress.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                    m.completed ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-slate-50 border-slate-200/70'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        m.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Stage {m.stage}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{m.skill}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    {m.completed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE COMPETENCY MATRIX (Detailed Skill Coverage) */}
      {activeChartTab === 'matrix' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Target Role Skill Coverage Matrix
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Itemized audit of all technical competencies evaluated for {targetRole}.
              </p>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter skills..."
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-44"
                />
              </div>

              <div className="flex items-center gap-1">
                {(['all', 'verified', 'missing'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setSkillStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                      skillStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Skill Competency</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Priority / Category</th>
                  <th className="py-2.5 px-3">Demonstrated Level</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSkills.map(item => (
                  <tr key={item.skill} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                      {item.status === 'verified' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span>{item.skill}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        item.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-600">{item.category}</span>
                      {item.status === 'missing' && (
                        <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          item.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item.priority}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {item.proficiency}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                      {Math.round(item.confidence * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerAnalyticsPage;
