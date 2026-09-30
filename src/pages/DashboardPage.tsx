import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import type { ResumeRecord, SkillEvidenceRecord, JobAnalysisRecord } from '../types';
import { FileText, Award, Briefcase, TrendingUp, ArrowRight, Target, Sparkles, CircleCheck as CheckCircle2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [resumeCount, setResumeCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resumeRes, skillRes, jobRes] = await Promise.all([
          apiClient.get<ResumeRecord[]>('/resume/me').catch(() => ({ data: [] })),
          apiClient.get<SkillEvidenceRecord[]>('/skills/evidence').catch(() => ({ data: [] })),
          apiClient.get<JobAnalysisRecord[]>('/jobs').catch(() => ({ data: [] }))
        ]);
        setResumeCount(resumeRes.data?.length || 0);
        setSkillCount(skillRes.data?.length || 0);
        setJobCount(jobRes.data?.length || 0);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Resumes Analyzed', value: resumeCount, icon: FileText, to: '/resume', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    { label: 'Verified Skills', value: skillCount, icon: Award, to: '/skills', iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    { label: 'Jobs Matched', value: jobCount, icon: Briefcase, to: '/jobs', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Welcome back</p>
          <h1 className="text-xl font-extrabold mt-1">{user?.name || 'User'}</h1>
          <p className="text-xs text-emerald-100 mt-2 max-w-md leading-relaxed">
            Your intelligent career profile analysis hub. Upload resumes, verify skills, and match against target job descriptions.
          </p>
          {user?.targetRoles && user.targetRoles.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <Target className="w-3.5 h-3.5 text-emerald-100" />
              <span className="text-xs font-medium text-emerald-50">{user.targetRoles.join(', ')}</span>
            </div>
          )}
        </div>
        <div className="absolute right-4 top-4 opacity-20">
          <Sparkles className="w-24 h-24 text-white" />
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-xs animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-100 mb-3"></div>
              <div className="h-4 w-20 bg-slate-100 rounded mb-2"></div>
              <div className="h-8 w-12 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.to}
                className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-xs hover:border-emerald-200 hover:shadow-sm transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} ${stat.iconText} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{stat.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/resume"
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/60 hover:border-emerald-200 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-800">Upload Resume</h3>
              <p className="text-[11px] text-slate-500 font-medium">Upload a PDF/DOCX for NLP skill extraction</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </Link>

          <Link
            to="/jobs"
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200/60 hover:border-amber-200 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-800">Analyze Job Match</h3>
              <p className="text-[11px] text-slate-500 font-medium">Compare your skills against a job description</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Workflow */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">CareerLens AI Workflow</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {['Analyze', 'Verify', 'Identify Gaps', 'Recommend', 'Improve'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800">{step}</span>
              </div>
              {i < 4 && <ArrowRight className="w-4 h-4 text-slate-300 rotate-90 sm:rotate-0 mx-auto" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
