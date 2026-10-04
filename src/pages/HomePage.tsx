import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type { IUnifiedDashboardData } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Sparkles,
  Target,
  ShieldCheck,
  Award,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Map,
  FolderGit2,
  SlidersHorizontal,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Check,
  Briefcase,
  Code2,
  Layers,
  Zap,
  CheckCheck,
  FileCheck2,
  Clock,
  Info,
  ChevronRight
} from 'lucide-react';

interface HomePageProps {
  user?: any;
}

export const HomePage: React.FC<HomePageProps> = ({ user: initialUser }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const [dashboard, setDashboard] = useState<IUnifiedDashboardData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>(roleFromUrl || '');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch unified dashboard data from backend API
  const fetchDashboardData = async (roleName?: string) => {
    try {
      setError(null);
      const queryParam = roleName || selectedRole || roleFromUrl;
      const endpoint = queryParam
        ? `/users/dashboard?role=${encodeURIComponent(queryParam)}`
        : '/users/dashboard';

      const res = await apiClient.get<IUnifiedDashboardData>(endpoint);
      if (res.data) {
        setDashboard(res.data);
        if (!selectedRole && res.data.user.selectedTargetRole) {
          setSelectedRole(res.data.user.selectedTargetRole);
        }
      }
    } catch (err: any) {
      console.error('[HomePage] Error fetching unified dashboard data:', err);
      setError(err.message || 'Failed to retrieve unified dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(roleFromUrl || undefined);
  }, [roleFromUrl]);

  // Handle target role change
  const handleRoleChange = async (newRole: string) => {
    setSelectedRole(newRole);
    setSearchParams({ role: newRole });
    setRefreshing(true);
    await fetchDashboardData(newRole);
  };

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Assembling Unified Career Dashboard</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Aggregating Profile Strength, Phase 4B ATS Readability, Phase 2D Skill Matches, Phase 3 Roadmap Milestones, and Phase 4C Benchmarks...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Dashboard Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'Unable to load unified career dashboard.'}</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchDashboardData();
          }}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry Loading
        </button>
      </div>
    );
  }

  const {
    user,
    profileStrength,
    resumeAnalysis,
    skillMatchesAndGaps,
    jobCompatibility,
    careerRoadmapProgress,
    practicalProjects,
    portfolioImprovement,
    careerBenchmarking
  } = dashboard;

  const activeRoleName = selectedRole || user.selectedTargetRole || 'Full Stack Developer';

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* 1. Top Welcome Banner & Target Role Synchronizer */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user.name} 👋
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Phase 4D Unified Hub
              </span>
            </div>
            <p className="text-xs text-slate-500">
              One unified command center connecting your verified profile, ATS diagnostics, role compatibility, learning roadmap, and market benchmarks.
            </p>
          </div>

          {/* Synchronized Target Role Selector */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <Target className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase text-slate-400">Target Role</span>
              <select
                value={activeRoleName}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={refreshing}
                className="text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-hidden cursor-pointer"
              >
                {user.availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchDashboardData(activeRoleName);
              }}
              disabled={refreshing}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Phase Quick-Navigation Link Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Deep-Dive Modules:
          </span>
          <Link
            to={`/resume`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resume & NLP</span>
          </Link>
          <Link
            to={`/ats-analyzer?role=${encodeURIComponent(activeRoleName)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Phase 4B: ATS Check</span>
          </Link>
          <Link
            to={`/recommendations?role=${encodeURIComponent(activeRoleName)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-amber-50 border border-slate-200 text-slate-700 hover:text-amber-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Phase 2D: Recommendations</span>
          </Link>
          <Link
            to={`/roadmap?role=${encodeURIComponent(activeRoleName)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 3: Learning Roadmap</span>
          </Link>
          <Link
            to={`/simulator?role=${encodeURIComponent(activeRoleName)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Phase 4A: Simulator</span>
          </Link>
          <Link
            to={`/benchmarking?role=${encodeURIComponent(activeRoleName)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-purple-50 border border-slate-200 text-slate-700 hover:text-purple-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Phase 4C: Benchmarks</span>
          </Link>
          <Link
            to={`/analytics?role=${encodeURIComponent(activeRoleName)}`}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 5A+5B: Analytics & Charts</span>
          </Link>
        </div>
      </div>

      {/* 2. ITEM 1: PROFILE STRENGTH (Hero Banner Card) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md relative overflow-hidden space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Profile Strength Index
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {profileStrength.readinessLevel} Standing • {profileStrength.percentileStanding} of Market
            </h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Synthesized across verified skill competencies, ATS parsability, and hiring benchmarks for <strong className="text-white">{activeRoleName}</strong>.
            </p>
          </div>

          {/* Profile Strength Score Gauge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0">
            <div className="text-center">
              <span className="text-4xl font-black text-white">{profileStrength.overallScore}%</span>
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Overall Strength</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-xs text-emerald-100 font-medium space-y-0.5">
              <div>Role Fit: <strong className="text-white">{jobCompatibility.compatibilityScore}%</strong></div>
              <div>ATS Rating: <strong className="text-white">{resumeAnalysis.atsScore}%</strong></div>
              <div>Percentile: <strong className="text-white">{careerBenchmarking.candidatePercentile}</strong></div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/15 relative z-10">
          {/* Key Strengths */}
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Key Verified Strengths
            </span>
            <div className="space-y-1.5">
              {profileStrength.strengths.map((str, idx) => (
                <div key={idx} className="text-xs text-emerald-50 flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Weaknesses / Gaps */}
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Key Development Priorities
            </span>
            <div className="space-y-1.5">
              {profileStrength.weaknesses.map((weak, idx) => (
                <div key={idx} className="text-xs text-emerald-50 flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">•</span>
                  <span>{weak}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOUR COMMAND TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Resume & ATS Score (Phase 4B) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" /> ATS Diagnostics
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {resumeAnalysis.readabilityLevel}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{resumeAnalysis.atsScore}%</span>
              <span className="text-xs text-slate-400 font-medium">ATS Match</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Readability: <strong className="text-slate-700">{resumeAnalysis.readabilityScore}/100</strong> • {resumeAnalysis.formattingRisksCount} formatting risks
            </p>
          </div>
          <Link
            to={`/ats-analyzer?role=${encodeURIComponent(activeRoleName)}`}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Inspect ATS Diagnostics</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Tile 2: Job Compatibility (Phase 2) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" /> Job Compatibility
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {jobCompatibility.compatibilityScore >= 75 ? 'Strong Match' : 'Developing'}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">{jobCompatibility.compatibilityScore}%</span>
              <span className="text-xs text-slate-400 font-medium">Role Fit</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              Targeting: <strong className="text-slate-700">{jobCompatibility.targetRole}</strong>
            </p>
          </div>
          <Link
            to={`/recommendations?role=${encodeURIComponent(activeRoleName)}`}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>View Role Recommendations</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Tile 3: Roadmap Progress (Phase 3) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-4 h-4 text-indigo-600" /> Learning Roadmap
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Stage {careerRoadmapProgress.currentStageNumber} of {careerRoadmapProgress.totalStages}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-700">{careerRoadmapProgress.percentComplete}%</span>
              <span className="text-xs text-slate-400 font-medium">Milestones</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {careerRoadmapProgress.completedMilestones} completed • {careerRoadmapProgress.remainingMilestones} remaining
            </p>
          </div>
          <Link
            to={`/roadmap?role=${encodeURIComponent(activeRoleName)}`}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Open Learning Roadmap</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Tile 4: Market Benchmarking (Phase 4C) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-600" /> Market Benchmark
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {careerBenchmarking.candidatePercentile}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-purple-700">{careerBenchmarking.readinessScore}%</span>
              <span className="text-xs text-slate-400 font-medium">vs Avg {careerBenchmarking.industryAverage}%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Standing: <strong className="text-slate-700">{careerBenchmarking.standing}</strong> ({careerBenchmarking.topCompetencyGaps.length} domains analyzed)
            </p>
          </div>
          <Link
            to={`/benchmarking?role=${encodeURIComponent(activeRoleName)}`}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Inspect Benchmark Standing</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 4. TWO-COLUMN GRID: SKILL MATCHES & GAPS (Item 3) + JOB COMPATIBILITY (Item 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ITEM 3: SKILL MATCHES & PRIORITIZED GAPS */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-600" /> Skill Matches & Prioritized Gaps
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verified competencies vs missing requirements for {activeRoleName}.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-200">
                  {skillMatchesAndGaps.gapSummary.highCount} High
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                  {skillMatchesAndGaps.gapSummary.mediumCount} Med
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  {skillMatchesAndGaps.gapSummary.lowCount} Low
                </span>
              </div>
            </div>

            {/* Matched Skills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Skills ({skillMatchesAndGaps.matchedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillMatchesAndGaps.matchedSkills.slice(0, 8).map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Prioritized Missing Skills */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Missing Competencies ({skillMatchesAndGaps.missingSkills.length})
              </span>
              <div className="space-y-2">
                {skillMatchesAndGaps.missingSkills.slice(0, 3).map(gap => (
                  <div
                    key={gap.skill}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                        gap.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {gap.priority}
                      </span>
                      <span className="font-bold text-slate-800 truncate">{gap.skill}</span>
                      <span className="text-[10px] text-slate-400">({gap.category})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0 font-medium">~{gap.estimatedHours} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            to={`/skills`}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-slate-200/70 mt-3"
          >
            <span>Manage Skills & Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ITEM 4: JOB COMPATIBILITY */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" /> Target Role Job Compatibility
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Phase 2 job description matching and competency alignment.
                </p>
              </div>
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {jobCompatibility.compatibilityScore}% Compatibility
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
              {jobCompatibility.compatibilitySummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Matching Requirements */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Matching Requisites
                </span>
                <div className="space-y-1">
                  {jobCompatibility.matchingRequirements.slice(0, 4).map((req, i) => (
                    <div key={i} className="text-xs text-slate-700 flex items-center gap-1.5 bg-emerald-50/40 p-1.5 rounded-lg border border-emerald-100">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Requirements */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Missing Requisites
                </span>
                <div className="space-y-1">
                  {jobCompatibility.missingRequirements.slice(0, 4).map((req, i) => (
                    <div key={i} className="text-xs text-slate-700 flex items-center gap-1.5 bg-amber-50/40 p-1.5 rounded-lg border border-amber-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            to={`/job-match`}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-slate-200/70 mt-3"
          >
            <span>Explore Full Job Matches & NLP Scoring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. TWO-COLUMN GRID: RESUME & ATS ANALYSIS (Item 2) + PRACTICAL PROJECTS (Item 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ITEM 2: RESUME ANALYSIS & READABILITY (Phase 4B) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> Resume & ATS Diagnostics (Phase 4B)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Document: <strong className="text-slate-700">{resumeAnalysis.originalName || 'Active Resume'}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-blue-700">{resumeAnalysis.atsScore}/100</span>
                <span className="text-[10px] text-slate-400 block font-medium">ATS Compatibility</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Readability</span>
                <span className="text-sm font-extrabold text-slate-800">{resumeAnalysis.readabilityScore}/100</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cognitive Ease</span>
                <span className="text-xs font-bold text-blue-700">{resumeAnalysis.readabilityLevel}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Layout Risks</span>
                <span className="text-sm font-extrabold text-amber-600">{resumeAnalysis.formattingRisksCount}</span>
              </div>
            </div>

            {/* Key Suggestions */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700">Top ATS Improvement Suggestions:</span>
              <div className="space-y-2">
                {resumeAnalysis.keySuggestions.map((sug, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {sug.priority}
                      </span>
                      <strong className="text-slate-800 font-semibold truncate">{sug.title}</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{sug.actionableFix}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            to={`/ats-analyzer?role=${encodeURIComponent(activeRoleName)}`}
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-blue-200 mt-3"
          >
            <span>Open Full ATS + Human Readability Analyzer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ITEM 6: PRACTICAL PROJECTS & PORTFOLIO EVIDENCE (Phase 3C) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-purple-600" /> Practical Projects & Portfolio Proof (Phase 3C)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Portfolio evidence projects mapped to major skill gaps.
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-purple-700">
                  {practicalProjects.completedProjectsCount} / {practicalProjects.totalProjectsCount} Verified
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {practicalProjects.portfolioEvidenceProgress}% Progress
                </span>
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-2.5">
              {practicalProjects.recommendedProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-purple-200 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                        proj.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : proj.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate">{proj.title}</h4>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 shrink-0">
                      {proj.targetSkill}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {proj.portfolioEvidence}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to={`/projects`}
            className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-purple-200 mt-3"
          >
            <span>View All Practical Projects & Repository Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 6. TWO-COLUMN GRID: CAREER ROADMAP PROGRESS (Item 5) + PORTFOLIO IMPROVEMENT (Item 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ITEM 5: CAREER ROADMAP PROGRESS (Phase 3) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-emerald-600" /> Career Roadmap Progress (Phase 3)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Stage {careerRoadmapProgress.currentStageNumber}: {careerRoadmapProgress.currentStageTitle}
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-emerald-700">
                  {careerRoadmapProgress.completedMilestones} / {careerRoadmapProgress.totalMilestones}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">Milestones Done</span>
              </div>
            </div>

            {/* Roadmap Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                  style={{ width: `${careerRoadmapProgress.percentComplete}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>{careerRoadmapProgress.percentComplete}% Complete</span>
                <span>{careerRoadmapProgress.remainingMilestones} milestones remaining</span>
              </div>
            </div>

            {/* Next Milestone Action Card */}
            {careerRoadmapProgress.nextMilestone ? (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" /> Next Milestone to Complete:
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {careerRoadmapProgress.nextMilestone.description}
                </p>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Skill Focus: {careerRoadmapProgress.nextMilestone.skillTarget}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All current roadmap milestones completed for this stage!</span>
              </div>
            )}
          </div>

          <Link
            to={`/roadmap?role=${encodeURIComponent(activeRoleName)}`}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 mt-3"
          >
            <span>Advance Learning Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ITEM 7: PORTFOLIO IMPROVEMENT SIMULATOR (Phase 4A) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Portfolio Simulator (Phase 4A)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Model potential score growth without altering your permanent profile.
                </p>
              </div>

              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                +{portfolioImprovement.projectedUplift}% Potential
              </span>
            </div>

            {/* Current vs Potential Score Comparison */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 rounded-xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Current Score: <strong className="text-slate-900">{portfolioImprovement.currentScore}%</strong></span>
                <span className="text-indigo-700">Projected Score: <strong className="text-indigo-900">{portfolioImprovement.potentialScore}%</strong></span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-200/70 overflow-hidden relative">
                <div
                  className="h-full bg-slate-600 rounded-full"
                  style={{ width: `${portfolioImprovement.currentScore}%` }}
                />
                <div
                  className="h-full bg-indigo-500 opacity-60 rounded-full -mt-3"
                  style={{ width: `${portfolioImprovement.potentialScore}%` }}
                />
              </div>
            </div>

            {/* Top Simulation Levers */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-700">Top Levers for Career Readiness Uplift:</span>
              <div className="space-y-1.5">
                {portfolioImprovement.topSimulationLevers.map((lever, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium truncate">{lever.title}</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                      +{lever.estimatedGain}% Gain
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            to={`/simulator?role=${encodeURIComponent(activeRoleName)}`}
            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-indigo-200 mt-3"
          >
            <span>Launch Interactive Portfolio Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 7. ITEM 8: CAREER BENCHMARKING (Phase 4C Full Width) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-600" /> Career Benchmarking & Percentiles (Phase 4C)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Domain-by-domain evaluation against market standards and high-performer expectations for {activeRoleName}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-sm font-extrabold text-purple-700">{careerBenchmarking.readinessScore}%</span>
              <span className="text-[10px] text-slate-400 block font-medium">Readiness Score</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-right">
              <span className="text-sm font-extrabold text-slate-800">{careerBenchmarking.candidatePercentile}</span>
              <span className="text-[10px] text-slate-400 block font-medium">Percentile Standing</span>
            </div>
          </div>
        </div>

        {/* Competency Domains Bar Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {careerBenchmarking.topCompetencyGaps.map((gap, idx) => {
            const isExceeds = gap.status === 'exceeds';
            const isMeets = gap.status === 'meets';

            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate">{gap.domain}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    isExceeds ? 'bg-emerald-100 text-emerald-800' : isMeets ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {gap.percentile}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full ${isExceeds ? 'bg-emerald-600' : isMeets ? 'bg-blue-600' : 'bg-amber-500'}`}
                      style={{ width: `${gap.candidateScore}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-500 z-10"
                      style={{ left: `${gap.industryAverage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Score: <strong>{gap.candidateScore}%</strong></span>
                    <span>Industry Avg: <strong>{gap.industryAverage}%</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Link
            to={`/benchmarking?role=${encodeURIComponent(activeRoleName)}`}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-purple-200"
          >
            <span>Explore Full 5-Domain Benchmark Diagnostics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
