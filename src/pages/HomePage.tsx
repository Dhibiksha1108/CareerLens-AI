import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type { ResumeRecord, JobAnalysisRecord, SkillEvidenceRecord } from '../types';
import {
  Sparkles,
  Mountain,
  FolderKanban,
  Layers,
  FileText,
  ArrowUpRight,
  Check,
  Minus,
  Circle,
  Database,
  Code2,
  BarChart3,
  Cpu,
  PieChart,
  Lightbulb,
  GitFork,
  FolderCheck,
  FileCode,
  BookOpen,
  ChevronRight,
  Target
} from 'lucide-react';

interface HomePageProps {
  user: any;
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [matches, setMatches] = useState<JobAnalysisRecord[]>([]);
  const [evidences, setEvidences] = useState<SkillEvidenceRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesRes, matchesRes, evidencesRes] = await Promise.all([
          apiClient.get<ResumeRecord[]>('/resume/me').catch(() => ({ data: [] })),
          apiClient.get<JobAnalysisRecord[]>('/jobs/matches').catch(() => ({ data: [] })),
          apiClient.get<SkillEvidenceRecord[]>('/skills/evidence').catch(() => ({ data: [] }))
        ]);

        setResumes(resumesRes.data || []);
        setMatches(matchesRes.data || []);
        setEvidences(evidencesRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, []);

  const displayName = user?.name || 'Dhibiksha';
  const targetRole = (user?.targetRoles && user.targetRoles[0]) || 'Data Analyst';

  // Dynamic values or baseline from screenshot
  const latestMatch = matches[0];
  const matchScore = latestMatch?.matchResult?.matchPercentage || latestMatch?.compatibilityBreakdown?.finalWeightedScore || 72;
  const matchingSkillsCount = latestMatch?.matchingSkills?.length || 10;
  const partialSkillsCount = latestMatch?.partialSkills?.length || 3;
  const missingSkillsCount = latestMatch?.missingSkills?.length || 4;

  const skillsCount = evidences.length > 0 ? evidences.length : 12;

  // Render status badge for skill matrix
  const renderStatus = (status: 'verified' | 'partial' | 'none') => {
    if (status === 'verified') {
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xs">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      );
    }
    if (status === 'partial') {
      return (
        <div className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center mx-auto shadow-2xs">
          <Minus className="w-3 h-3 stroke-[3]" />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      </div>
    );
  };

  const skillEvidenceRows = [
    {
      name: 'Python',
      icon: Code2,
      proficiency: 92,
      color: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-600',
      resume: 'verified',
      github: 'verified',
      projects: 'verified',
      jobMatch: 'verified'
    },
    {
      name: 'SQL',
      icon: Database,
      proficiency: 85,
      color: 'bg-sky-500',
      badgeBg: 'bg-sky-50 text-sky-600',
      resume: 'verified',
      github: 'verified',
      projects: 'partial',
      jobMatch: 'verified'
    },
    {
      name: 'Power BI',
      icon: BarChart3,
      proficiency: 78,
      color: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-600',
      resume: 'verified',
      github: 'partial',
      projects: 'verified',
      jobMatch: 'verified'
    },
    {
      name: 'Machine Learning',
      icon: Cpu,
      proficiency: 60,
      color: 'bg-purple-500',
      badgeBg: 'bg-purple-50 text-purple-600',
      resume: 'none',
      github: 'partial',
      projects: 'none',
      jobMatch: 'partial'
    },
    {
      name: 'Data Visualization',
      icon: PieChart,
      proficiency: 70,
      color: 'bg-rose-500',
      badgeBg: 'bg-rose-50 text-rose-600',
      resume: 'partial',
      github: 'verified',
      projects: 'none',
      jobMatch: 'none'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Row 1: Two Top Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Banner: Welcome */}
        <div className="lg:col-span-8 p-7 rounded-2xl bg-white border border-slate-200/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Good morning, {displayName} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Here's an overview of your career profile.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 font-medium shrink-0">
            <span className="text-amber-500">💡</span>
            <span className="italic">"Small steps today, a stronger tomorrow."</span>
          </div>
        </div>

        {/* Right Banner: Inspirational Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-linear-to-r from-emerald-800 to-teal-900 text-white shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-white">
              You're on the right path.
            </h2>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
              Keep building, keep learning, keep growing.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-200 font-medium pt-1">
            <Mountain className="w-3.5 h-3.5" />
            <span>Career Horizon • Phase 1B Active</span>
          </div>
        </div>
      </div>

      {/* Row 2: Four Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Career Readiness */}
        <div className="p-5 rounded-2xl bg-[#f0fdf4] border border-emerald-100/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            {/* Circular Gauge */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-emerald-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="78, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-800">78%</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">Career Readiness</span>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <span>↑ 12% from last analysis</span>
          </div>
        </div>

        {/* Card 2: Projects Analyzed */}
        <div className="p-5 rounded-2xl bg-[#eff6ff] border border-blue-100/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">Projects Analyzed</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">6</div>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-blue-600">
            2 strong projects
          </div>
        </div>

        {/* Card 3: Skills Identified */}
        <div className="p-5 rounded-2xl bg-[#faf5ff] border border-purple-100/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">Skills Identified</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{skillsCount}</div>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-purple-600">
            4 skill gaps
          </div>
        </div>

        {/* Card 4: Resume Score */}
        <div className="p-5 rounded-2xl bg-[#fffbeb] border border-amber-100/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">Resume Score</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">85%</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-amber-700">Identified 5 improvement points</span>
            <Link to="/resume" className="text-slate-600 hover:text-slate-900 transition">
              View details →
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Skill Evidence Overview (Left) & Job Match (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Skill Evidence Overview */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/60 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Skill Evidence Overview
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-source evidence verification across profiles
              </p>
            </div>
            <Link
              to="/skills"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              View All →
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-semibold">Skill Name & Proficiency</th>
                  <th className="pb-3 font-semibold text-center w-16">Resume</th>
                  <th className="pb-3 font-semibold text-center w-16">GitHub</th>
                  <th className="pb-3 font-semibold text-center w-16">Projects</th>
                  <th className="pb-3 font-semibold text-center w-16">Job Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skillEvidenceRows.map(row => {
                  const Icon = row.icon;
                  return (
                    <tr key={row.name} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 pr-4">
                        <div className="space-y-1.5 max-w-sm">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg ${row.badgeBg} flex items-center justify-center`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-extrabold text-slate-900">{row.name}</span>
                            </div>
                            <span className="font-bold text-slate-900">{row.proficiency}%</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${row.color}`}
                              style={{ width: `${row.proficiency}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-center">{renderStatus(row.resume as any)}</td>
                      <td className="py-3.5 text-center">{renderStatus(row.github as any)}</td>
                      <td className="py-3.5 text-center">{renderStatus(row.projects as any)}</td>
                      <td className="py-3.5 text-center">{renderStatus(row.jobMatch as any)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Job Match Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/60 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Job Match</h2>
            <Link
              to="/job-match"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-100 transition inline-flex items-center gap-1"
            >
              <span>Analyze New Job</span>
              <span>→</span>
            </Link>
          </div>

          <div className="flex items-center gap-6 py-4">
            {/* Circular Gauge */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${matchScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 leading-tight">{matchScore}%</span>
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
                  MATCH SCORE
                </span>
              </div>
            </div>

            {/* Target Role & Breakdown */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TARGET ROLE
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {targetRole}
                </h3>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{matchingSkillsCount} Matching Skills</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>{partialSkillsCount} Partial Skills</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>{missingSkillsCount} Missing Skills</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/job-match"
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>View Full Compatibility Analysis</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: 3 Cards Grid (Recent Analysis, Recommended Next Steps, Career Roadmap) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Recent Analysis */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Recent Analysis</h2>
            <Link
              to="/resume"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {/* Item 1: Resume Analysis */}
            <Link
              to="/resume"
              className="p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition">
                    Resume Analysis
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Identified 5 improvement points
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  2 hours ago
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition" />
              </div>
            </Link>

            {/* Item 2: GitHub Analysis */}
            <Link
              to="/skills"
              className="p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <GitFork className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition">
                    GitHub Analysis
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Analyzed 8 repositories
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  5 hours ago
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition" />
              </div>
            </Link>

            {/* Item 3: Project Quality */}
            <Link
              to="/projects"
              className="p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FolderCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition">
                    Project Quality
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    2 projects need improvement
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  1 day ago
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition" />
              </div>
            </Link>
          </div>
        </div>

        {/* Card 2: Recommended Next Steps */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Recommended Next Steps</h2>
            <Link
              to="/recommendations"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {/* Step 1 */}
            <Link
              to="/projects"
              className="p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition truncate">
                    Build a Python Data Analysis Project
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Strengthen your Python and data analysis skills.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
            </Link>

            {/* Step 2 */}
            <Link
              to="/skills"
              className="p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition truncate">
                    Learn Machine Learning Basics
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    This skill is required for your target role.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
            </Link>

            {/* Step 3 */}
            <Link
              to="/projects"
              className="p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition truncate">
                    Improve Project Documentation
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Add better README files and live demos.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
            </Link>
          </div>
        </div>

        {/* Card 3: Career Roadmap */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-2xs space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Career Roadmap</h2>
            <Link
              to="/roadmap"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              View Full Roadmap →
            </Link>
          </div>

          {/* Timeline steps */}
          <div className="relative pl-1 space-y-4">
            {/* Step 1 */}
            <div className="relative flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 shadow-2xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              {/* Connecting vertical line */}
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />
              <div className="min-w-0 pb-1">
                <h3 className="text-xs font-extrabold text-slate-900">Build Core Skills</h3>
                <p className="text-[11px] text-slate-400">SQL, Python, Data Visualization</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center shrink-0 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              {/* Connecting vertical line */}
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />
              <div className="min-w-0 pb-1">
                <h3 className="text-xs font-extrabold text-emerald-800">Complete Recommended Projects</h3>
                <p className="text-[11px] text-slate-400">2 projects suggested</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start gap-3">
              <div className="w-6 h-6 rounded-full border border-slate-300 bg-white text-slate-400 font-bold text-[11px] flex items-center justify-center shrink-0 z-10">
                3
              </div>
              {/* Connecting vertical line */}
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />
              <div className="min-w-0 pb-1">
                <h3 className="text-xs font-extrabold text-slate-800">Fill Skill Gaps</h3>
                <p className="text-[11px] text-slate-400">Machine Learning, Statistics</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-start gap-3">
              <div className="w-6 h-6 rounded-full border border-slate-300 bg-white text-slate-400 font-bold text-[11px] flex items-center justify-center shrink-0 z-10">
                4
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-extrabold text-slate-800">Apply for Target Roles</h3>
                <p className="text-[11px] text-slate-400">Data Analyst / Business Analyst</p>
              </div>
            </div>
          </div>

          {/* Decorative Dotted Trajectory Arrow SVG */}
          <div className="absolute right-3 bottom-3 pointer-events-none opacity-60">
            <svg width="70" height="40" viewBox="0 0 70 40" fill="none">
              <path
                d="M 5 35 Q 35 30 55 10"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 50 10 L 58 8 L 56 16"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Row 5: Full-Width Bottom Callout Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Your Potential is Clear. Now Make It Real.
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep improving your profile and follow your personalized roadmap to reach your career goals.
            </p>
          </div>
        </div>

        <Link
          to="/recommendations"
          className="px-5 py-2.5 rounded-full bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Explore Recommendations</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
};
