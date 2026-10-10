import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type {
  ICareerBenchmarkResult,
  CareerRecommendationRecord,
  IDomainBenchmark,
  IMeetingSkill
} from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Award,
  Target,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Briefcase,
  Clock,
  FolderGit2,
  Map,
  Code2,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Zap,
  Sliders,
  CheckCheck
} from 'lucide-react';

export const BenchmarkingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const [benchmark, setBenchmark] = useState<ICareerBenchmarkResult | null>(null);
  const [recommendations, setRecommendations] = useState<CareerRecommendationRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>(
    () => roleFromUrl || (typeof window !== 'undefined' ? localStorage.getItem('careerlens_selected_target_role') || '' : '')
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<'domains' | 'meeting' | 'missing' | 'portfolio' | 'improvements'>('domains');
  const [meetingCategoryFilter, setMeetingCategoryFilter] = useState<string>('All');
  const [gapPriorityFilter, setGapPriorityFilter] = useState<'All' | 'high' | 'medium' | 'low'>('All');

  // Interactive Phase 4A Simulator Overlay inside Benchmark (What-if simulation)
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [simulatedProjects, setSimulatedProjects] = useState<string[]>([]);

  // Fetch initial data
  const fetchData = async (roleName?: string) => {
    try {
      setError(null);
      const targetRoleToUse =
        roleName ||
        searchParams.get('role') ||
        selectedRole ||
        (typeof window !== 'undefined' ? localStorage.getItem('careerlens_selected_target_role') : null) ||
        'Full Stack Developer';

      setSelectedRole(targetRoleToUse);

      const [recRes, benchRes] = await Promise.all([
        apiClient.get<CareerRecommendationRecord>(`/recommendations?role=${encodeURIComponent(targetRoleToUse)}`),
        apiClient.get<ICareerBenchmarkResult>(`/recommendations/benchmark?role=${encodeURIComponent(targetRoleToUse)}`)
      ]);

      if (recRes.data) {
        setRecommendations(recRes.data);
      }
      if (benchRes.data) {
        setBenchmark(benchRes.data);
      }
    } catch (err: any) {
      console.error('[BenchmarkingPage] Error fetching benchmark:', err);
      setError(err.message || 'Failed to load career benchmark data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const roleParam = searchParams.get('role') || localStorage.getItem('careerlens_selected_target_role');
    if (roleParam) {
      setSelectedRole(roleParam);
      if (!searchParams.get('role')) {
        setSearchParams({ role: roleParam });
      }
    }
    fetchData(roleParam || undefined);
  }, [searchParams.get('role')]);

  // Handle Role Selection change
  const handleRoleChange = async (newRole: string) => {
    setSelectedRole(newRole);
    setSearchParams({ role: newRole });
    localStorage.setItem('careerlens_selected_target_role', newRole);
    localStorage.setItem('careerlens_active_role', newRole);
    setRefreshing(true);
    setSimulatedSkills([]);
    setSimulatedProjects([]);
    await fetchData(newRole);
  };

  // Toggle simulated skills in what-if mode
  const toggleSimulatedSkill = (skill: string) => {
    setSimulatedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Toggle simulated project in what-if mode
  const toggleSimulatedProject = (projectTitle: string) => {
    setSimulatedProjects(prev =>
      prev.includes(projectTitle) ? prev.filter(p => p !== projectTitle) : [...prev, projectTitle]
    );
  };

  // Calculate simulated boosted readiness score
  const boostedReadiness = useMemo(() => {
    if (!benchmark) return 0;
    const skillBoost = simulatedSkills.length * 3;
    const projectBoost = simulatedProjects.length * 4;
    return Math.min(benchmark.overallReadiness + skillBoost + projectBoost, 100);
  }, [benchmark, simulatedSkills, simulatedProjects]);

  // Filter meeting skills
  const filteredMeetingSkills = useMemo(() => {
    if (!benchmark) return [];
    if (meetingCategoryFilter === 'All') return benchmark.meetingSkills;
    return benchmark.meetingSkills.filter(s => s.category.toLowerCase() === meetingCategoryFilter.toLowerCase());
  }, [benchmark, meetingCategoryFilter]);

  // Filter missing skills
  const filteredMissingSkills = useMemo(() => {
    if (!benchmark) return [];
    if (gapPriorityFilter === 'All') return benchmark.missingSkills;
    return benchmark.missingSkills.filter(s => s.priority === gapPriorityFilter);
  }, [benchmark, gapPriorityFilter]);

  const meetingCategories = useMemo(() => {
    if (!benchmark) return ['All'];
    const cats = Array.from(new Set(benchmark.meetingSkills.map(s => s.category)));
    return ['All', ...cats];
  }, [benchmark]);

  // Deduplicated role list for switcher
  const availableBenchmarkRoles = useMemo(() => {
    const rolesMap: Record<string, number | undefined> = {};
    if (recommendations?.recommendedRoles) {
      recommendations.recommendedRoles.forEach(r => {
        rolesMap[r.role] = r.matchPercentage;
      });
    }
    const defaultRoles = [
      'Full Stack Developer',
      'Data Analyst',
      'Backend Engineer',
      'Data Engineer',
      'DevOps / Cloud Engineer',
      'Machine Learning Engineer',
      'Frontend Engineer'
    ];
    defaultRoles.forEach(r => {
      if (rolesMap[r] === undefined) {
        rolesMap[r] = undefined;
      }
    });
    if (selectedRole && rolesMap[selectedRole] === undefined) {
      rolesMap[selectedRole] = undefined;
    }
    return Object.entries(rolesMap).map(([role, matchPercentage]) => ({
      role,
      matchPercentage
    }));
  }, [recommendations, selectedRole]);

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-800">Calculating Career Benchmark</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Comparing verified profile competencies, resume text, and project evidence against market expectations for {selectedRole || 'your target role'}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !benchmark) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Benchmarking Data Unavailable</h2>
          <p className="text-xs text-slate-500">
            {error || 'Unable to retrieve career benchmarking data. Ensure your profile and resume have been analyzed.'}
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchData();
          }}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const isBoosted = simulatedSkills.length > 0 || simulatedProjects.length > 0;
  const currentReadiness = benchmark.overallReadiness;
  const displayScore = isBoosted ? boostedReadiness : currentReadiness;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header & Role Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Career Benchmarking Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Phase 4C
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective candidate readiness comparisons against real tech market requirements, domain percentile baselines, and portfolio expectations.
          </p>
        </div>

        {/* Quick Phase Navigation Links */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to={`/recommendations?role=${encodeURIComponent(selectedRole)}`}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Phase 2D: Role Fit</span>
          </Link>
          <Link
            to={`/roadmap?role=${encodeURIComponent(selectedRole)}`}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 3: Roadmap</span>
          </Link>
          <Link
            to={`/simulator?role=${encodeURIComponent(selectedRole)}`}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Phase 4A: Simulator</span>
          </Link>
          <Link
            to={`/ats-analyzer?role=${encodeURIComponent(selectedRole)}`}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Phase 4B: ATS</span>
          </Link>
        </div>
      </div>

      {/* Target Role Selector Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Active Benchmark Target Role
            </span>
            <span className="text-sm font-extrabold text-slate-900">{selectedRole}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 shrink-0">Switch Benchmark Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            disabled={refreshing}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            {availableBenchmarkRoles.map(({ role, matchPercentage }) => (
              <option key={role} value={role}>
                {role} {matchPercentage !== undefined ? `(${matchPercentage}% fit)` : ''}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchData(selectedRole);
            }}
            disabled={refreshing}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            title="Refresh Benchmark"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Readiness & Benchmark Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Overall Career Readiness Gauge */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Career Readiness
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              displayScore >= 80
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : displayScore >= 65
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {displayScore >= 80 ? 'Job Ready' : displayScore >= 65 ? 'Competitive' : 'Pathway Required'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {displayScore}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              vs Industry Avg: <strong className="text-slate-700">{benchmark.industryAverageReadiness}%</strong>
            </span>
            {isBoosted && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +{boostedReadiness - currentReadiness}% simulated
              </span>
            )}
          </div>

          {/* Dual Bar (Candidate vs Industry Benchmark) */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isBoosted ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${displayScore}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                style={{ left: `${benchmark.industryAverageReadiness}%` }}
                title={`Industry Average: ${benchmark.industryAverageReadiness}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0%</span>
              <span className="text-slate-600 font-semibold">Baseline: {benchmark.industryAverageReadiness}%</span>
              <span>100% Target</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Standing in <strong className="text-emerald-700">{benchmark.candidatePercentile}</strong> among candidates evaluated for {selectedRole}.
          </p>
        </div>

        {/* 2. Skills Coverage Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-blue-600" /> Competency Alignment
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {benchmark.meetingSkillsCount} of {benchmark.totalExpectedSkills} Met
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Meeting Skills</span>
              <div className="text-xl font-extrabold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                {benchmark.meetingSkillsCount + simulatedSkills.length}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Remaining Gaps</span>
              <div className="text-xl font-extrabold text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {Math.max(benchmark.missingSkillsCount - simulatedSkills.length, 0)}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            {benchmark.missingSkills.filter(s => s.priority === 'high').length} high-priority gaps remain for market competitiveness in {selectedRole}.
          </p>
        </div>

        {/* 3. Portfolio & Experience Alignment */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-purple-600" /> Portfolio & Experience
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {benchmark.experienceGapAnalysis.standing} Standing
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Practical Proofs</span>
              <div className="text-xl font-extrabold text-purple-700">
                {benchmark.portfolioGapAnalysis.candidateProjectCount + simulatedProjects.length} / {benchmark.portfolioGapAnalysis.expectedProjectCount}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Detected Tenure</span>
              <div className="text-xl font-extrabold text-slate-800">
                {benchmark.experienceGapAnalysis.detectedYears}+ yrs
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed truncate">
            {benchmark.experienceGapAnalysis.feedback}
          </p>
        </div>
      </div>

      {/* Interactive Phase 4A Simulation Overlay Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/40 border border-indigo-100/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                Simulate Candidate Improvements (Phase 4A Preview)
              </h2>
              <p className="text-[11px] text-slate-500">
                Test how closing missing skills or building portfolio deliverables elevates your benchmark percentile in real-time without modifying your permanent profile.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isBoosted && (
              <button
                onClick={() => {
                  setSimulatedSkills([]);
                  setSimulatedProjects([]);
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors"
              >
                Reset Simulation
              </button>
            )}
            <Link
              to={`/simulator?role=${encodeURIComponent(selectedRole)}`}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Full Simulator</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Quick Simulation Chips */}
        <div className="space-y-2 pt-1 border-t border-indigo-100/60">
          <span className="text-[11px] font-bold text-slate-700">Quick-Toggle Missing Role Skills to Simulate:</span>
          <div className="flex flex-wrap gap-1.5">
            {benchmark.missingSkills.map(gap => {
              const isSimulated = simulatedSkills.includes(gap.skill);
              return (
                <button
                  key={gap.skill}
                  onClick={() => toggleSimulatedSkill(gap.skill)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSimulated
                      ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-300'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  {isSimulated ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3 text-indigo-500" />}
                  <span>+{gap.skill}</span>
                  <span className={`text-[10px] ${isSimulated ? 'text-emerald-100' : 'text-slate-400'}`}>
                    (+3%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 overflow-x-auto">
        {[
          { id: 'domains', label: 'Domain Benchmarks (5)', icon: BarChart3 },
          { id: 'meeting', label: `Meeting Role Skills (${benchmark.meetingSkillsCount})`, icon: CheckCircle2 },
          { id: 'missing', label: `Prioritized Gaps (${benchmark.missingSkillsCount})`, icon: AlertTriangle },
          { id: 'portfolio', label: `Portfolio & Projects (${benchmark.portfolioGapAnalysis.gaps.length})`, icon: FolderGit2 },
          { id: 'improvements', label: `Actionable Roadmap (${benchmark.clearAreasToImprove.length})`, icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
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

      {/* TAB 1: DOMAIN BENCHMARKS */}
      {activeTab === 'domains' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Technical Competency Domain Percentiles
              </h2>
              <p className="text-xs text-slate-500">
                Detailed comparison of candidate verified proficiencies against market thresholds and high-performer expectations for {selectedRole}.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium shrink-0">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Your Verified Score
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> Industry Avg
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-400 inline-block" /> Target Expectation
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {benchmark.domainBenchmarks.map((dom, idx) => {
              const isExceeds = dom.status === 'exceeds';
              const isMeets = dom.status === 'meets';

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{dom.domain}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          isExceeds
                            ? 'bg-emerald-100 text-emerald-800'
                            : isMeets
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {dom.percentile}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Target Expectation: <strong className="text-slate-700">{dom.targetExpectation}%</strong> • Industry Average: <strong className="text-slate-700">{dom.industryAverage}%</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold text-slate-900">{dom.candidateScore}%</span>
                      <span className="text-[10px] text-slate-400 block">Candidate Score</span>
                    </div>
                  </div>

                  {/* Dual Comparison Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isExceeds ? 'bg-emerald-600' : isMeets ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${dom.candidateScore}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-500 z-10"
                        style={{ left: `${dom.industryAverage}%` }}
                        title={`Industry Average: ${dom.industryAverage}%`}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                        style={{ left: `${dom.targetExpectation}%` }}
                        title={`Target Expectation: ${dom.targetExpectation}%`}
                      />
                    </div>
                  </div>

                  {/* Skills tags breakdown */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    <span className="font-semibold text-slate-500">Verified in domain:</span>
                    {dom.verifiedSkills.length > 0 ? (
                      dom.verifiedSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium">
                          ✓ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None verified yet</span>
                    )}

                    {dom.missingSkills.length > 0 && (
                      <>
                        <span className="font-semibold text-slate-500 ml-2">Missing for role:</span>
                        {dom.missingSkills.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-medium">
                            • {s}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS ALREADY MEETING ROLE EXPECTATIONS */}
      {activeTab === 'meeting' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Skills Meeting {selectedRole} Expectations ({benchmark.meetingSkillsCount})
              </h2>
              <p className="text-xs text-slate-500">
                Verified candidate competencies backed by resume text extraction, GitHub repositories, or practical proofs.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {meetingCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setMeetingCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    meetingCategoryFilter === cat
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredMeetingSkills.map(skill => (
              <div
                key={skill.skill}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {skill.skill}
                    </h3>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{skill.category}</span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                    {skill.proficiency}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Proof: <strong className="text-slate-700">{skill.evidenceType}</strong></span>
                  <span className="font-semibold text-emerald-700">{Math.round(skill.confidence * 100)}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MISSING SKILLS & PRIORITIZED GAPS */}
      {activeTab === 'missing' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Prioritized Skill Gaps for {selectedRole} ({benchmark.missingSkillsCount})
              </h2>
              <p className="text-xs text-slate-500">
                Identified missing competencies prioritized by hiring frequency and target role demand.
              </p>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              {(['All', 'high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setGapPriorityFilter(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    gapPriorityFilter === p
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredMissingSkills.map(gap => {
              const isHigh = gap.priority === 'high';
              const isMed = gap.priority === 'medium';
              const isSimulated = simulatedSkills.includes(gap.skill);

              return (
                <div
                  key={gap.skill}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isHigh
                      ? 'bg-rose-50/40 border-rose-200'
                      : isMed
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          isHigh ? 'bg-rose-600 text-white' : isMed ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {gap.priority} Priority Gap
                        </span>
                        <h3 className="text-xs font-extrabold text-slate-900">{gap.skill}</h3>
                        <span className="text-[11px] text-slate-400">• {gap.category}</span>
                      </div>
                      <p className="text-xs text-slate-600">{gap.recommendedLearningArea}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleSimulatedSkill(gap.skill)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                          isSimulated
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isSimulated ? <Check className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5 text-indigo-500" />}
                        <span>{isSimulated ? 'Simulated Added' : 'Simulate Adding'}</span>
                      </button>

                      <Link
                        to={`/roadmap?role=${encodeURIComponent(selectedRole)}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <span>View in Roadmap</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/80 rounded-xl border border-slate-200/60 text-xs">
                    <span className="text-slate-600">
                      Suggested Proof Project: <strong className="text-slate-800">{gap.suggestedProject}</strong>
                    </span>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px] font-medium">
                      <span>Demand: <strong className="text-slate-700">{gap.demandFrequency}x frequency</strong></span>
                      <span>Est: <strong className="text-slate-700">{gap.estimatedHours} hrs</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PORTFOLIO & PROJECTS GAP ANALYSIS */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Practical Project & Portfolio Deliverables ({benchmark.portfolioGapAnalysis.gaps.length})
              </h2>
              <p className="text-xs text-slate-500">
                Evaluation of practical portfolio projects required to verify competencies for {selectedRole}.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-extrabold text-purple-700">
                {benchmark.portfolioGapAnalysis.candidateProjectCount} / {benchmark.portfolioGapAnalysis.expectedProjectCount} Projects Verified
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                Portfolio Readiness: {benchmark.portfolioGapAnalysis.portfolioReadinessScore}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {benchmark.portfolioGapAnalysis.gaps.map((item, idx) => {
              const isCompleted = item.status === 'completed';
              const isInProgress = item.status === 'in_progress';
              const isSimulated = simulatedProjects.includes(item.recommendedProjectTitle);

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          isCompleted || isSimulated
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isSimulated ? 'Simulated Complete' : item.status.replace('_', ' ')}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900">{item.recommendedProjectTitle}</h3>
                      </div>
                      <p className="text-xs text-slate-600">{item.portfolioEvidence}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleSimulatedProject(item.recommendedProjectTitle)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                          isSimulated
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isSimulated ? 'Simulated' : 'Simulate (+4%)'}</span>
                      </button>

                      <Link
                        to={`/projects`}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <span>Build Proof</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {item.keyDeliverables && item.keyDeliverables.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Expected Deliverables for Hiring Review:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {item.keyDeliverables.map((del, dIdx) => (
                          <div key={dIdx} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{del}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ACTIONABLE IMPROVEMENTS & ROADMAP */}
      {activeTab === 'improvements' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Prioritized Action Plan to Reach High-Performer Benchmark
            </h2>
            <p className="text-xs text-slate-500">
              Targeted, highest-ROI engineering actions to bridge competency gaps and advance to the top 10th percentile for {selectedRole}.
            </p>
          </div>

          <div className="space-y-3">
            {benchmark.clearAreasToImprove.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        item.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.priority} Priority
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                        {item.category}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.actionableStep}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {item.impactScore}
                    </span>
                    {item.suggestedActionLink && (
                      <Link
                        to={item.suggestedActionLink}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <span>Start Action</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
