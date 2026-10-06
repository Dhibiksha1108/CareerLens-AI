import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type { ICareerAnalyticsData } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProgressTrackingView } from '../components/analytics/ProgressTrackingView';
import {
  Clock,
  Target,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Map,
  FolderGit2,
  Bookmark,
  BarChart3,
  Activity,
  SlidersHorizontal
} from 'lucide-react';

export const ProgressTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const [analytics, setAnalytics] = useState<ICareerAnalyticsData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>(roleFromUrl || '');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Career Analytics / Progress data from API
  const fetchProgressData = async (roleName?: string) => {
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
      console.error('[ProgressTrackingPage] Error loading progress data:', err);
      setError(err.message || 'Failed to retrieve progress tracking data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgressData(roleFromUrl || undefined);
  }, [roleFromUrl]);

  // Handle Target Role change
  const handleRoleChange = async (newRole: string) => {
    setSelectedRole(newRole);
    setSearchParams({ role: newRole });
    setRefreshing(true);
    await fetchProgressData(newRole);
  };

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Loading Visual Progress Tracking</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Aggregating roadmap learning milestones, verified skill acquisitions, practical projects, and portfolio evidence...
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
          <h2 className="text-sm font-bold text-slate-900">Progress Tracking Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'Unable to render progress tracking data.'}</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchProgressData();
          }}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry Loading
        </button>
      </div>
    );
  }

  const { targetRole, availableRoles } = analytics;

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* 1. Header & Target Role Synchronizer */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Progress Tracking
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                Phase 5D
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Visual multi-track progress tracking covering career roadmap milestones, skill acquisition, practical project completion, portfolio evidence, and overall career-readiness trajectories.
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
                fetchProgressData(targetRole);
              }}
              disabled={refreshing}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors"
              title="Refresh Progress Tracking"
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
            to={`/roadmap?role=${encodeURIComponent(targetRole)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 3: Learning Roadmap</span>
          </Link>
          <Link
            to="/skills"
            className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-600" />
            <span>Skills & Evidence</span>
          </Link>
          <Link
            to="/projects"
            className="px-2.5 py-1 bg-slate-50 hover:bg-purple-50 border border-slate-200 text-slate-700 hover:text-purple-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Technical Projects</span>
          </Link>
          <Link
            to={`/analytics?role=${encodeURIComponent(targetRole)}`}
            className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 5A–5C: Career Analytics & Charts</span>
          </Link>
          <Link
            to="/dashboard"
            className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 4D: Unified Dashboard</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Progress Tracking Multi-Track View (Phase 5D) */}
      <ProgressTrackingView
        analytics={analytics}
        onSelectRole={handleRoleChange}
      />
    </div>
  );
};

export default ProgressTrackingPage;
