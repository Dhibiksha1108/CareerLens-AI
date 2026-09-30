import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { JobAnalysisRecord } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Briefcase, Search, Trash as Trash2, CircleCheck as CheckCircle2, Circle as XCircle, TrendingUp } from 'lucide-react';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await apiClient.get<JobAnalysisRecord[]>('/jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) return;
    setAnalyzing(true);
    setError(null);
    setSuccess(null);
    try {
      const skills = requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const res = await apiClient.post<JobAnalysisRecord>('/jobs/analyze', {
        jobTitle,
        company,
        jobDescription,
        requiredSkills: skills
      });
      if (res.data) {
        setSuccess('Job analyzed successfully!');
        setJobTitle('');
        setCompany('');
        setJobDescription('');
        setRequiredSkills('');
        await fetchJobs();
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getMatchColor = (pct: number) => {
    if (pct >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (pct >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-600" /> Job Description Analysis
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Analyze job descriptions against your skills to identify matching and missing competencies.
        </p>
      </div>

      {/* Analysis Form */}
      <form onSubmit={handleAnalyze} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Analyze New Job Description</h2>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">{error}</div>
        )}
        {success && (
          <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">{success}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Job Title *</label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Job Description *</label>
          <textarea
            required
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            placeholder="Paste the full job description here..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Required Skills (comma-separated)</label>
          <input
            type="text"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="e.g. React, TypeScript, Node.js, MongoDB, AWS"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={analyzing}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
          >
            <Search className="w-4 h-4" />
            {analyzing ? 'Analyzing...' : 'Analyze Match'}
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Jobs Analyzed Yet"
          description="Paste a job description above to see how your skills match up."
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Analyzed Jobs ({jobs.length})</h2>
          {jobs.map(job => {
            const pct = job.matchResult?.matchPercentage || 0;
            return (
              <div key={job._id} className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900">{job.jobTitle}</h3>
                    {job.company && <p className="text-xs text-slate-500 font-medium mt-0.5">{job.company}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-sm font-extrabold border ${getMatchColor(pct)} shrink-0`}>
                    {pct}%
                  </div>
                </div>

                {/* Match Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Matching Skills */}
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Matching ({job.matchingSkills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(job.matchingSkills || []).map(s => (
                        <span key={s} className="text-[10px] font-semibold text-emerald-800 bg-white border border-emerald-200 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {(!job.matchingSkills || job.matchingSkills.length === 0) && (
                        <span className="text-[10px] text-slate-400">No matching skills</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/60 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Missing ({job.missingSkills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(job.missingSkills || []).map(s => (
                        <span key={s} className="text-[10px] font-semibold text-rose-800 bg-white border border-rose-200 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {(!job.missingSkills || job.missingSkills.length === 0) && (
                        <span className="text-[10px] text-slate-400">No missing skills</span>
                      )}
                    </div>
                  </div>
                </div>

                {job.matchResult?.recommendationsSummary && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-start gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{job.matchResult.recommendationsSummary}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
