import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { GitBranch, RefreshCw } from 'lucide-react';

export const GithubPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [syncing, setSyncing] = useState(false);

  const fetchGithub = async () => {
    try {
      const res = await apiClient.get('/github/me');
      setProfile(res.data);
      if (res.data?.username) {
        setUsername(res.data.username);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGithub();
  }, []);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setSyncing(true);
    try {
      await apiClient.post('/github/sync', { username });
      fetchGithub();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-600" /> GitHub Repository & Skill Sync
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connect your GitHub account to analyze repositories, commit languages, and code contributions.
        </p>
      </div>

      <form onSubmit={handleSync} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Sync GitHub Account</h2>
        <div className="flex gap-3">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="dhibiksha"
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={syncing || !username}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync GitHub'}
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : !profile ? (
        <EmptyState
          icon={GitBranch}
          title="No GitHub Account Synced"
          description="Enter your GitHub username above to sync public repository metadata."
        />
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">@{profile.username} GitHub Overview</h2>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Synced via REST API
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 block">Total Repositories</span>
              <span className="text-xl font-extrabold text-slate-900">{profile.repositories?.length || 0}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 block">Analyzed Skills</span>
              <span className="text-xl font-extrabold text-emerald-700">{profile.analyzedSkills?.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
