import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type { IUnifiedDashboardData } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Sparkles,
  Target,
  ShieldCheck,
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
  Code2,
  Zap,
  FileCheck2,
  Clock,
  Upload,
  Search,
  Activity,
  Award,
  ChevronRight,
  Compass,
  ArrowUpRight,
  Lightbulb,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface HomePageProps {
  user?: any;
}

// Reusable SVG Circular Progress Ring with smooth styling
const ProgressRing: React.FC<{
  percent: number;
  size?: number;
  strokeWidth?: number;
  gradientId: string;
  startColor: string;
  endColor: string;
  bgClass?: string;
  textColorClass?: string;
}> = ({
  percent,
  size = 68,
  strokeWidth = 7,
  gradientId,
  startColor,
  endColor,
  bgClass = 'text-slate-200/80',
  textColorClass = 'text-slate-800'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={`${bgClass} fill-transparent`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="fill-transparent transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xs font-black tracking-tight ${textColorClass}`}>
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
};

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

  // Determine dynamic greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-[520px] flex items-center justify-center p-6">
        <div className="p-10 text-center bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-xl space-y-4 max-w-md w-full">
          <LoadingSpinner size="lg" />
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900">Synthesizing Career Intelligence</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analyzing verified skill portfolio, ATS diagnostics, role compatibility, and industry benchmarks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-8 text-center bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-lg space-y-4 max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">Dashboard Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'Unable to load unified career dashboard.'}</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchDashboardData();
          }}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02]"
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
  const greetingText = getGreeting();

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ========================================================= */}
      {/* 1. HERO SECTION: PREMIUM MODERN CAREER SAAS BANNER        */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white shadow-2xl border border-emerald-800/40 p-6 sm:p-8 lg:p-9">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-28 w-96 h-96 rounded-full bg-teal-400/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>CareerLens AI Intelligence Hub</span>
              <span className="text-emerald-400/60">•</span>
              <span className="text-emerald-200">{profileStrength.readinessLevel} Standing</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {greetingText}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-100">{user.name || 'there'}!</span>
              </h1>
              <p className="text-lg sm:text-xl font-bold text-emerald-100/95 tracking-tight">
                Let's build a brighter career together.
              </p>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed pt-1 font-normal">
                Your AI-guided career intelligence platform has synthesized verified technical skills, ATS diagnostic readability, and market benchmarks for <strong className="text-white font-bold underline decoration-emerald-400/50 underline-offset-4">{activeRoleName}</strong>.
              </p>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="pt-2">
              <div className="text-[11px] uppercase font-bold text-emerald-300/90 tracking-wider mb-2.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick Actions</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to="/resume"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-all"
                >
                  <Upload className="w-4 h-4 text-slate-950" />
                  <span>Upload Resume</span>
                </Link>
                <Link
                  to="/job-match"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 backdrop-blur-md border border-white/20 hover:scale-[1.02] transition-all"
                >
                  <Search className="w-4 h-4 text-cyan-300" />
                  <span>Find Best Roles</span>
                </Link>
                <Link
                  to={`/recommendations?role=${encodeURIComponent(activeRoleName)}`}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 backdrop-blur-md border border-white/20 hover:scale-[1.02] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>View Recommendations</span>
                </Link>
                <Link
                  to={`/roadmap?role=${encodeURIComponent(activeRoleName)}`}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 backdrop-blur-md border border-white/20 hover:scale-[1.02] transition-all"
                >
                  <Map className="w-4 h-4 text-purple-300" />
                  <span>Continue Roadmap</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Modern Career/Tech Illustration */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[360px] aspect-4/3 flex items-center justify-center">
              {/* Background Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500/25 via-teal-500/15 to-purple-500/20 blur-xl" />

              {/* Decorative Vector Artwork */}
              <svg viewBox="0 0 380 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-2xl">
                <defs>
                  <linearGradient id="heroChartGrad" x1="0" y1="0" x2="320" y2="210" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="0.6" stopColor="#06b6d4" stopOpacity="0.2" />
                    <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="heroStrokeGrad" x1="40" y1="190" x2="340" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#34d399" />
                    <stop offset="0.45" stopColor="#38bdf8" />
                    <stop offset="0.8" stopColor="#a855f7" />
                    <stop offset="1" stopColor="#f43f5e" />
                  </linearGradient>
                  <linearGradient id="heroCardGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#ffffff" stopOpacity="0.14" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
                  </linearGradient>
                </defs>

                {/* Main Floating Platform Base */}
                <rect x="25" y="35" width="330" height="210" rx="22" fill="url(#heroCardGrad)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
                
                {/* Grid guidelines */}
                <line x1="45" y1="90" x2="335" y2="90" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <line x1="45" y1="140" x2="335" y2="140" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <line x1="45" y1="190" x2="335" y2="190" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />

                {/* Career Trajectory Area Fill */}
                <path d="M 50 185 Q 115 170 155 125 T 260 90 T 325 55 L 325 210 L 50 210 Z" fill="url(#heroChartGrad)" />

                {/* Trajectory Curve Line */}
                <path d="M 50 185 Q 115 170 155 125 T 260 90 T 325 55" stroke="url(#heroStrokeGrad)" strokeWidth="4.5" strokeLinecap="round" />

                {/* Milestone Node 1: Resume Parsed */}
                <circle cx="50" cy="185" r="7.5" fill="#0f172a" stroke="#34d399" strokeWidth="3" />
                <circle cx="50" cy="185" r="3" fill="#34d399" />

                {/* Milestone Node 2: Skills Verified */}
                <circle cx="155" cy="125" r="7.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="155" cy="125" r="3" fill="#38bdf8" />

                {/* Milestone Node 3: Target Role Benchmark */}
                <circle cx="260" cy="90" r="7.5" fill="#0f172a" stroke="#a855f7" strokeWidth="3" />
                <circle cx="260" cy="90" r="3" fill="#a855f7" />

                {/* Milestone Node 4: Career Peak Star */}
                <circle cx="325" cy="55" r="10" fill="#10b981" />
                <path d="M 325 48 L 327 53.5 L 332.5 53.5 L 328 57 L 330 62.5 L 325 59 L 320 62.5 L 322 57 L 317.5 53.5 L 323 53.5 Z" fill="#ffffff" />

                {/* Floating Metric Card 1: Readiness Score */}
                <g transform="translate(38, 16)">
                  <rect width="125" height="50" rx="14" fill="#090d16" fillOpacity="0.9" stroke="rgba(52,211,153,0.5)" strokeWidth="1" />
                  <circle cx="24" cy="25" r="11" fill="rgba(16,185,129,0.25)" />
                  <path d="M 19 25 L 23 29 L 29 21" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="42" y="21" fill="#94a3b8" fontSize="9" fontWeight="700">READINESS</text>
                  <text x="42" y="38" fill="#ffffff" fontSize="15" fontWeight="900">{profileStrength.overallScore}%</text>
                </g>

                {/* Floating Metric Card 2: Market Match */}
                <g transform="translate(205, 185)">
                  <rect width="135" height="50" rx="14" fill="#090d16" fillOpacity="0.9" stroke="rgba(168,85,247,0.5)" strokeWidth="1" />
                  <circle cx="24" cy="25" r="11" fill="rgba(168,85,247,0.25)" />
                  <path d="M 19 21 L 24 26 L 30 19 M 19 29 L 30 29" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
                  <text x="42" y="21" fill="#94a3b8" fontSize="9" fontWeight="700">MARKET FIT</text>
                  <text x="42" y="38" fill="#ffffff" fontSize="15" fontWeight="900">{careerBenchmarking.candidatePercentile}</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TARGET ROLE SYNCHRONIZER & QUICK NAVIGATION BAR        */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white backdrop-blur-md border border-emerald-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">
                  Target Career Benchmark
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  {profileStrength.readinessLevel} Standing
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{activeRoleName}</span>
              </h2>
            </div>
          </div>

          {/* Synchronized Role Dropdown & Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition-colors">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Role:</span>
              <select
                value={activeRoleName}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={refreshing}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
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
              className="p-2.5 text-slate-500 hover:text-emerald-700 rounded-xl hover:bg-white bg-white/70 border border-slate-200 shadow-2xs transition-colors"
              title="Refresh CareerLens Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Phase Navigation Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-emerald-100/80 text-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">
            Navigate Modules:
          </span>
          <Link
            to="/resume"
            className="px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold rounded-xl border border-slate-200/80 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resume & NLP</span>
          </Link>
          <Link
            to={`/ats-analyzer?role=${encodeURIComponent(activeRoleName)}`}
            className="px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-800 text-slate-700 font-semibold rounded-xl border border-slate-200/80 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>ATS Diagnostics</span>
          </Link>
          <Link
            to="/job-match"
            className="px-3 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-semibold rounded-xl border border-slate-200/80 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Target className="w-3.5 h-3.5 text-teal-600" />
            <span>Job Match</span>
          </Link>
          <Link
            to="/skills"
            className="px-3 py-1.5 bg-white hover:bg-slate-100 hover:text-slate-900 text-slate-700 font-semibold rounded-xl border border-slate-200/80 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Skills & Evidence</span>
          </Link>
          <Link
            to={`/recommendations?role=${encodeURIComponent(activeRoleName)}`}
            className="px-3 py-1.5 bg-white hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-semibold rounded-xl border border-slate-200/80 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Recommendations</span>
          </Link>
          <Link
            to={`/roadmap?role=${encodeURIComponent(activeRoleName)}`}
            className="px-3 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-800 text-slate-700 font-semibold rounded-xl border border-slate-200/80 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Map className="w-3.5 h-3.5 text-indigo-600" />
            <span>Roadmap</span>
          </Link>
          <Link
            to={`/simulator?role=${encodeURIComponent(activeRoleName)}`}
            className="px-3 py-1.5 bg-white hover:bg-purple-50 hover:text-purple-800 text-slate-700 font-semibold rounded-xl border border-slate-200/80 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
            <span>Simulator</span>
          </Link>
          <Link
            to={`/benchmarking?role=${encodeURIComponent(activeRoleName)}`}
            className="px-3 py-1.5 bg-white hover:bg-violet-50 hover:text-violet-800 text-slate-700 font-semibold rounded-xl border border-slate-200/80 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-violet-600" />
            <span>Benchmarks</span>
          </Link>
          <Link
            to={`/analytics?role=${encodeURIComponent(activeRoleName)}&tab=dashboard`}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-xl border border-emerald-300 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            <span>Visual Dashboard</span>
          </Link>
          <Link
            to={`/progress?role=${encodeURIComponent(activeRoleName)}`}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl border border-amber-300 transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Progress Tracking</span>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FOUR CORE VISUAL METRIC CARDS (PASTEL GRADIENTS & RINGS)*/}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Career Readiness (Emerald Pastel Card) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 border border-emerald-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Career Readiness
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {profileStrength.readinessLevel}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ProgressRing
              percent={profileStrength.overallScore}
              size={68}
              strokeWidth={7}
              gradientId="gradReadiness"
              startColor="#10b981"
              endColor="#059669"
              bgClass="text-emerald-100"
              textColorClass="text-emerald-950 font-black"
            />
            <div className="space-y-0.5">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{profileStrength.overallScore}%</div>
              <p className="text-[11px] text-slate-600 font-medium leading-tight">
                Top <strong className="text-emerald-700 font-bold">{profileStrength.percentileStanding}</strong> percentile
              </p>
            </div>
          </div>

          <Link
            to={`/analytics?role=${encodeURIComponent(activeRoleName)}`}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between pt-2.5 border-t border-emerald-100/90"
          >
            <span>Deep-Dive Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 2: Skill Match & Role Fit (Blue Pastel Card) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-cyan-50/50 border border-blue-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" /> Role Skill Match
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {jobCompatibility.compatibilityScore >= 75 ? 'Strong Match' : 'Developing'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ProgressRing
              percent={jobCompatibility.compatibilityScore}
              size={68}
              strokeWidth={7}
              gradientId="gradSkillMatch"
              startColor="#3b82f6"
              endColor="#0284c7"
              bgClass="text-blue-100"
              textColorClass="text-blue-950 font-black"
            />
            <div className="space-y-0.5">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{jobCompatibility.compatibilityScore}%</div>
              <p className="text-[11px] text-slate-600 font-medium leading-tight">
                <strong className="text-blue-700 font-bold">{skillMatchesAndGaps.matchedSkills.length}</strong> verified competencies
              </p>
            </div>
          </div>

          <Link
            to="/job-match"
            className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center justify-between pt-2.5 border-t border-blue-100/90"
          >
            <span>Inspect Job Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 3: Market Compatibility (Purple Pastel Card) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-violet-50/50 border border-purple-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-600" /> Market Benchmark
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              {careerBenchmarking.candidatePercentile}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ProgressRing
              percent={careerBenchmarking.readinessScore}
              size={68}
              strokeWidth={7}
              gradientId="gradBenchmark"
              startColor="#a855f7"
              endColor="#7c3aed"
              bgClass="text-purple-100"
              textColorClass="text-purple-950 font-black"
            />
            <div className="space-y-0.5">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{careerBenchmarking.readinessScore}%</div>
              <p className="text-[11px] text-slate-600 font-medium leading-tight">
                Industry avg: <strong className="text-purple-700 font-bold">{careerBenchmarking.industryAverage}%</strong>
              </p>
            </div>
          </div>

          <Link
            to={`/benchmarking?role=${encodeURIComponent(activeRoleName)}`}
            className="text-[11px] font-bold text-purple-700 hover:text-purple-800 flex items-center justify-between pt-2.5 border-t border-purple-100/90"
          >
            <span>Compare Benchmarks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 4: Learning Progress (Amber/Orange Pastel Card) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50/50 border border-amber-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-4 h-4 text-amber-600" /> Roadmap Milestones
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Stage {careerRoadmapProgress.currentStageNumber}/{careerRoadmapProgress.totalStages}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ProgressRing
              percent={careerRoadmapProgress.percentComplete}
              size={68}
              strokeWidth={7}
              gradientId="gradRoadmap"
              startColor="#f59e0b"
              endColor="#d97706"
              bgClass="text-amber-100"
              textColorClass="text-amber-950 font-black"
            />
            <div className="space-y-0.5">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{careerRoadmapProgress.percentComplete}%</div>
              <p className="text-[11px] text-slate-600 font-medium leading-tight">
                <strong className="text-amber-700 font-bold">{careerRoadmapProgress.completedMilestones}</strong> of {careerRoadmapProgress.totalMilestones} done
              </p>
            </div>
          </div>

          <Link
            to={`/roadmap?role=${encodeURIComponent(activeRoleName)}`}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center justify-between pt-2.5 border-t border-amber-100/90"
          >
            <span>Track Learning Path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. VERIFIED STRENGTHS & KEY DEVELOPMENT PRIORITIES        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Verified Strengths (Emerald Pastel) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border border-emerald-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Verified Strengths
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {profileStrength.strengths.length} verified
            </span>
          </div>
          <div className="space-y-2.5">
            {profileStrength.strengths.map((str, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white border border-emerald-100/80 flex items-start gap-2.5 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="text-xs text-slate-700 font-semibold leading-relaxed">{str}</span>
              </div>
            ))}
          </div>
          <div className="pt-1">
            <Link
              to="/skills"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage Verified Skills & Evidence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top Improvement Areas / AI Suggestions (Rose/Amber Pastel) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/30 border border-rose-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-rose-100">
            <span className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Top Improvement Areas / AI Suggestions
            </span>
            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
              {profileStrength.weaknesses.length} priorities
            </span>
          </div>
          <div className="space-y-2.5">
            {profileStrength.weaknesses.map((weak, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white border border-rose-100/80 flex items-start gap-2.5 shadow-2xs hover:border-rose-300 transition-colors">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  !
                </div>
                <span className="text-xs text-slate-700 font-semibold leading-relaxed">{weak}</span>
              </div>
            ))}
          </div>
          <div className="pt-1">
            <Link
              to={`/simulator?role=${encodeURIComponent(activeRoleName)}`}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1"
            >
              <span>Simulate Improvements & Projected Uplift</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. CORE 4 FEATURE PILLARS (2x2 GRID OF RICH FEATURE CARDS) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PILLAR 1: RESUME ANALYSIS & ATS DIAGNOSTICS (Blue Pastel) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/60 via-white to-sky-50/30 border border-blue-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    ATS & Document Readability
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {resumeAnalysis.originalName || 'Active Resume'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-blue-700">{resumeAnalysis.atsScore}%</span>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">ATS Score</span>
              </div>
            </div>

            {/* Readability Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-white rounded-2xl border border-blue-100 text-center shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Readability</span>
                <span className="text-sm font-black text-slate-800">{resumeAnalysis.readabilityScore}/100</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-blue-100 text-center shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cognitive Ease</span>
                <span className="text-xs font-black text-blue-700">{resumeAnalysis.readabilityLevel}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-blue-100 text-center shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Formatting Risks</span>
                <span className="text-sm font-black text-amber-600">{resumeAnalysis.formattingRisksCount}</span>
              </div>
            </div>

            {/* Key Suggestions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Top ATS Improvement Fixes:
              </span>
              <div className="space-y-2">
                {resumeAnalysis.keySuggestions && resumeAnalysis.keySuggestions.length > 0 ? (
                  resumeAnalysis.keySuggestions.slice(0, 2).map((sug, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white border border-blue-100 text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                          {sug.priority}
                        </span>
                        <strong className="text-slate-800 font-bold truncate">{sug.title}</strong>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">{sug.actionableFix}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-2xl bg-white border border-blue-100 text-xs text-slate-500 font-medium">
                    Upload a resume in the ATS Scanner to generate prioritized keyword and layout fixes.
                  </div>
                )}
              </div>
            </div>
          </div>

          <Link
            to={`/ats-analyzer?role=${encodeURIComponent(activeRoleName)}`}
            className="w-full py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-blue-300 shadow-2xs mt-2"
          >
            <span>Open Standalone ATS & Readability Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* PILLAR 2: TARGET ROLE JOB COMPATIBILITY (Emerald Pastel) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30 border border-emerald-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Job Description Compatibility
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Target: {jobCompatibility.targetRole}
                  </p>
                </div>
              </div>

              <span className="text-sm font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300">
                {jobCompatibility.compatibilityScore}% Fit
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-2xl border border-emerald-100 font-medium shadow-2xs">
              {jobCompatibility.compatibilitySummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Matching Requirements */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Matching Requisites
                </span>
                <div className="space-y-1.5">
                  {jobCompatibility.matchingRequirements.slice(0, 3).map((req, i) => (
                    <div key={i} className="text-xs text-slate-700 flex items-center gap-2 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Requirements */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Missing Requisites
                </span>
                <div className="space-y-1.5">
                  {jobCompatibility.missingRequirements.slice(0, 3).map((req, i) => (
                    <div key={i} className="text-xs text-slate-700 flex items-center gap-2 bg-amber-50/70 p-2 rounded-xl border border-amber-100 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate font-medium">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/job-match"
            className="w-full py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-emerald-300 shadow-2xs mt-2"
          >
            <span>Explore Full Job Matches & NLP Scoring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* PILLAR 3: CAREER ROADMAP & LEARNING PATH (Indigo/Cyan Pastel) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-white to-cyan-50/30 border border-indigo-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Learning Roadmap Trajectory
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Stage {careerRoadmapProgress.currentStageNumber}: {careerRoadmapProgress.currentStageTitle}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-indigo-700">
                  {careerRoadmapProgress.completedMilestones}/{careerRoadmapProgress.totalMilestones}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">Done</span>
              </div>
            </div>

            {/* Roadmap Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${careerRoadmapProgress.percentComplete}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>{careerRoadmapProgress.percentComplete}% Complete</span>
                <span>{careerRoadmapProgress.remainingMilestones} milestones remaining</span>
              </div>
            </div>

            {/* Next Milestone Action Card */}
            {careerRoadmapProgress.nextMilestone ? (
              <div className="p-3.5 bg-white border border-indigo-100 rounded-2xl space-y-1.5 shadow-2xs">
                <span className="text-[10px] uppercase font-black text-indigo-900 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" /> Next Milestone to Unlock:
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {careerRoadmapProgress.nextMilestone.description}
                </p>
                <span className="inline-block text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Skill Focus: {careerRoadmapProgress.nextMilestone.skillTarget}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All current roadmap milestones completed for this stage!</span>
              </div>
            )}
          </div>

          <Link
            to={`/roadmap?role=${encodeURIComponent(activeRoleName)}`}
            className="w-full py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-indigo-300 shadow-2xs mt-2"
          >
            <span>Advance Learning Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* PILLAR 4: PORTFOLIO IMPROVEMENT SIMULATOR (Purple Pastel) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/60 via-white to-pink-50/30 border border-purple-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Readiness Growth Simulator
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Simulate score uplift without modifying active profile
                  </p>
                </div>
              </div>

              <span className="text-xs font-black text-purple-800 bg-purple-100 px-3 py-1 rounded-xl border border-purple-300">
                +{portfolioImprovement.projectedUplift}% Uplift
              </span>
            </div>

            {/* Current vs Potential Progress Gauge */}
            <div className="p-3.5 bg-white rounded-2xl border border-purple-100 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Current: <strong className="text-slate-900">{portfolioImprovement.currentScore}%</strong></span>
                <span className="text-purple-700">Projected: <strong className="text-purple-950 font-black">{portfolioImprovement.potentialScore}%</strong></span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative shadow-inner">
                <div
                  className="h-full bg-slate-500 rounded-full"
                  style={{ width: `${portfolioImprovement.currentScore}%` }}
                />
                <div
                  className="h-full bg-purple-500 opacity-70 rounded-full -mt-3"
                  style={{ width: `${portfolioImprovement.potentialScore}%` }}
                />
              </div>
            </div>

            {/* Top Simulation Levers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Top Growth Levers for High Gain:</span>
              <div className="space-y-1.5">
                {portfolioImprovement.topSimulationLevers.slice(0, 2).map((lever, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-purple-100 flex items-center justify-between text-xs shadow-2xs">
                    <span className="text-slate-800 font-semibold truncate">{lever.title}</span>
                    <span className="text-[10px] font-black text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 shrink-0">
                      +{lever.estimatedGain}% Gain
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            to={`/simulator?role=${encodeURIComponent(activeRoleName)}`}
            className="w-full py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-purple-300 shadow-2xs mt-2"
          >
            <span>Launch Interactive Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. SKILL OVERVIEW & PRACTICAL PROJECTS                     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SKILL OVERVIEW: VERIFIED VS MISSING COMPETENCIES (Teal/Emerald Pastel) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/30 border border-teal-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-600" /> Skill Competency Audit
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Verified assets vs requirements for {activeRoleName}
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

            {/* Verified Skills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Skills ({skillMatchesAndGaps.matchedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillMatchesAndGaps.matchedSkills.slice(0, 8).map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl shadow-2xs"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="space-y-2 pt-2 border-t border-teal-100/80">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Missing Competencies ({skillMatchesAndGaps.missingSkills.length})
              </span>
              <div className="space-y-2">
                {skillMatchesAndGaps.missingSkills.slice(0, 3).map(gap => (
                  <div
                    key={gap.skill}
                    className="p-2.5 rounded-2xl bg-white border border-teal-100 flex items-center justify-between gap-2 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
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
            to="/skills"
            className="w-full py-2.5 bg-teal-100 hover:bg-teal-200 text-teal-900 text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-teal-300 shadow-2xs mt-2"
          >
            <span>Manage Skills & Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* PRACTICAL PROJECTS & PORTFOLIO EVIDENCE (Purple/Violet Pastel) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/50 via-white to-violet-50/30 border border-purple-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-purple-600" /> Practical Projects & Portfolio Proof
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Portfolio evidence mapped to primary skill gaps
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-purple-700">
                  {practicalProjects.completedProjectsCount} / {practicalProjects.totalProjectsCount}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {practicalProjects.portfolioEvidenceProgress}% Progress
                </span>
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-2.5">
              {practicalProjects.recommendedProjects.slice(0, 3).map((proj, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 transition-all space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
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
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 shrink-0">
                      {proj.targetSkill}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                    {proj.portfolioEvidence}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/projects"
            className="w-full py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-purple-300 shadow-2xs mt-2"
          >
            <span>View All Practical Projects & Repository Proof</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. MARKET BENCHMARKING & PERCENTILE STANDING (FULL-WIDTH)  */}
      {/* ========================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-violet-50/40 via-white to-slate-50/60 border border-violet-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-violet-100 gap-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-600" /> Market Benchmarking Diagnostics
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Domain evaluation against market standards and top candidate percentiles for {activeRoleName}.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-base font-black text-purple-700">{careerBenchmarking.readinessScore}%</span>
              <span className="text-[10px] text-slate-400 block font-medium">Readiness Score</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-right">
              <span className="text-base font-black text-slate-800">{careerBenchmarking.candidatePercentile}</span>
              <span className="text-[10px] text-slate-400 block font-medium">Percentile Standing</span>
            </div>
          </div>
        </div>

        {/* Competency Domains Bar Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {careerBenchmarking.topCompetencyGaps.map((gap, idx) => {
            const isExceeds = gap.status === 'exceeds';
            const isMeets = gap.status === 'meets';

            return (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-violet-100 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate">{gap.domain}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                    isExceeds ? 'bg-emerald-100 text-emerald-800' : isMeets ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {gap.percentile}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full rounded-full ${isExceeds ? 'bg-emerald-500' : isMeets ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${gap.candidateScore}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-slate-700 z-10 rounded-full"
                      style={{ left: `${gap.industryAverage}%` }}
                      title={`Industry Average: ${gap.industryAverage}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Candidate: <strong className="text-slate-800 font-bold">{gap.candidateScore}%</strong></span>
                    <span>Industry Avg: <strong className="text-slate-800 font-bold">{gap.industryAverage}%</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Link
            to={`/benchmarking?role=${encodeURIComponent(activeRoleName)}`}
            className="px-5 py-2.5 bg-violet-100 hover:bg-violet-200 text-violet-900 text-xs font-black rounded-xl flex items-center gap-2 transition-colors border border-violet-300 shadow-2xs"
          >
            <span>Explore Full 5-Domain Benchmark Diagnostics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
