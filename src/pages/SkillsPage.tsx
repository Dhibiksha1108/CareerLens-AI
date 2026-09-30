import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { SkillEvidenceRecord } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Award, ShieldCheck, RefreshCw } from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const [evidences, setEvidences] = useState<SkillEvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillName, setSkillName] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchEvidences = async () => {
    try {
      const res = await apiClient.get<SkillEvidenceRecord[]>('/skills/evidence');
      setEvidences(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidences();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName) return;
    setVerifying(true);
    try {
      await apiClient.post('/skills/verify', { skill: skillName });
      setSkillName('');
      fetchEvidences();
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" /> Multi-Source Skill Evidence Engine
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify technical skill evidence aggregated across Resumes, GitHub, Projects, and Portfolios.
        </p>
      </div>

      <form onSubmit={handleVerify} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Re-evaluate Skill Evidence</h2>
        <div className="flex gap-3">
          <input
            type="text"
            required
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="e.g. Python, SQL, React, System Design"
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={verifying || !skillName}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Evaluating...' : 'Verify Evidence'}
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : evidences.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Skill Evidence Computed"
          description="Register skills above or upload Resumes / Projects to auto-calculate evidence strength scores."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidences.map((item) => (
            <div key={item._id} className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.skill}</h3>
                  {item.category && (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {item.category} {item.confidence ? `• ${Math.round(item.confidence * 100)}% confidence` : ''}
                    </span>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" /> {item.evidenceStrength}
                </span>
              </div>
              <div className="text-xs text-slate-500 space-y-1 font-medium">
                <div>Resume Evidence Items: {item.resumeEvidence?.length || 0}</div>
                <div>GitHub Repo Matches: {item.githubEvidence?.length || 0}</div>
                <div>Project Showcase Evidence: {item.projectEvidence?.length || 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
