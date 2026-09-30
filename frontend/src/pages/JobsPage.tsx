import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { JobAnalysisRecord } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Briefcase, Target, CheckCircle2, XCircle } from 'lucide-react';

export const JobsPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<JobAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnalyses = async () => {
    try {
      const res = await apiClient.get<JobAnalysisRecord[]>('/jobs');
      setAnalyses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) return;
    setSubmitting(true);
    try {
      const skillsArray = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      await apiClient.post('/jobs/analyze', {
        jobTitle,
        company,
        jobDescription,
        requiredSkills: skillsArray
      });
      setJobTitle('');
      setCompany('');
      setRequiredSkills('');
      setJobDescription('');
      fetchAnalyses();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-600" /> Target Job Gap Matcher
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Analyze target job postings to identify matching vs. missing skill vectors.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Analyze Job Posting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Data Analyst / Software Engineer"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company (Optional)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="TechCorp Inc."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma-separated)</label>
          <input
            type="text"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="Python, SQL, Power BI, Machine Learning"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Job Description Text</label>
          <textarea
            required
            rows={3}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job description text..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !jobTitle || !jobDescription}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Target className="w-4 h-4" />
          {submitting ? 'Analyzing Gaps...' : 'Perform Gap Analysis'}
        </button>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : analyses.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Job Match Analyzed Yet"
          description="Analyze target job postings above to evaluate skill compatibility."
        />
      ) : (
        <div className="space-y-4">
          {analyses.map((item) => (
            <div key={item._id} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.jobTitle}</h3>
                  <span className="text-xs text-slate-400 font-medium">{item.company || 'Target Job Posting'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium">Match Score:</span>
                  <span className="text-xl font-extrabold text-emerald-700">{item.matchResult?.matchPercentage || 0}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                  <span className="font-bold flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matching Verified Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.matchingSkills?.length ? (
                      item.matchingSkills.map((s) => (
                        <span key={s} className="px-2.5 py-0.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-semibold">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">None detected yet</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900">
                  <span className="font-bold flex items-center gap-1.5 mb-2">
                    <XCircle className="w-4 h-4 text-rose-600" /> Identified Skill Gaps
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.missingSkills?.length ? (
                      item.missingSkills.map((s) => (
                        <span key={s} className="px-2.5 py-0.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-semibold">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">No skill gaps detected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
