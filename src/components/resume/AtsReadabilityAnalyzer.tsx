import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import type {
  ResumeRecord,
  CareerRecommendationRecord,
  IAtsAnalysisResult
} from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Target,
  FileText,
  Search,
  ShieldAlert,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';

interface AtsReadabilityAnalyzerProps {
  initialResumeId?: string;
  initialRole?: string;
  onSelectResume?: (resume: ResumeRecord) => void;
}

export const AtsReadabilityAnalyzer: React.FC<AtsReadabilityAnalyzerProps> = ({
  initialResumeId,
  initialRole,
  onSelectResume
}) => {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(initialResumeId || '');
  const [recommendation, setRecommendation] = useState<CareerRecommendationRecord | null>(null);
  const [targetRole, setTargetRole] = useState<string>(initialRole || '');
  const [customRole, setCustomRole] = useState<string>('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showJdInput, setShowJdInput] = useState(false);

  // Analysis State
  const [analysis, setAnalysis] = useState<IAtsAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [keywordPriorityFilter, setKeywordPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [suggestionCategoryFilter, setSuggestionCategoryFilter] = useState<string>('All');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'keywords' | 'sections' | 'readability' | 'suggestions'>('overview');

  // Load Resumes & Career Recommendations (Phase 2D data)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resumesRes, recRes] = await Promise.allSettled([
          apiClient.get<ResumeRecord[]>('/resume/me'),
          apiClient.get<CareerRecommendationRecord>('/recommendations')
        ]);

        let loadedResumes: ResumeRecord[] = [];
        if (resumesRes.status === 'fulfilled' && resumesRes.value.data) {
          loadedResumes = resumesRes.value.data;
          setResumes(loadedResumes);
        }

        let defaultRole = 'Full Stack Developer';
        if (recRes.status === 'fulfilled' && recRes.value.data) {
          const recData = recRes.value.data;
          setRecommendation(recData);
          if (recData.targetRole) {
            defaultRole = recData.targetRole;
          } else if (recData.recommendedRoles && recData.recommendedRoles.length > 0) {
            defaultRole = recData.recommendedRoles[0].role;
          }
        }

        const roleToUse = initialRole || defaultRole;
        setTargetRole(roleToUse);

        // Pick active resume
        const activeResId = initialResumeId || (loadedResumes.length > 0 ? loadedResumes[0]._id : '');
        setSelectedResumeId(activeResId);

        if (activeResId) {
          await runAnalysis(activeResId, roleToUse);
        }
      } catch (err: any) {
        console.error('Failed to load initial data for ATS analyzer:', err);
        setError(err.message || 'Failed to load resume or role recommendation data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialResumeId, initialRole]);

  const runAnalysis = async (resumeId: string, roleName: string, jdText?: string) => {
    if (!resumeId) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await apiClient.post<IAtsAnalysisResult>('/resume/ats/analyze', {
        resumeId,
        targetRole: roleName,
        jobDescription: jdText !== undefined ? jdText : jobDescription
      });

      if (res.data) {
        setAnalysis(res.data);
      }
    } catch (err: any) {
      console.error('Error running ATS analysis:', err);
      setError(err.message || 'ATS analysis could not be completed for this resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (newRole === '__custom__') {
      setIsCustomRole(true);
      return;
    }
    setIsCustomRole(false);
    setTargetRole(newRole);
    if (selectedResumeId) {
      await runAnalysis(selectedResumeId, newRole);
    }
  };

  const handleCustomRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRole.trim()) return;
    setTargetRole(customRole.trim());
    if (selectedResumeId) {
      await runAnalysis(selectedResumeId, customRole.trim());
    }
  };

  const handleResumeSelect = async (newId: string) => {
    setSelectedResumeId(newId);
    const found = resumes.find(r => r._id === newId);
    if (found && onSelectResume) {
      onSelectResume(found);
    }
    if (newId) {
      await runAnalysis(newId, targetRole);
    }
  };

  const handleRunAnalysisClick = () => {
    if (selectedResumeId) {
      runAnalysis(selectedResumeId, targetRole, jobDescription);
    }
  };

  // Helper score badges
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-600', ring: 'ring-emerald-500' };
    if (score >= 65) return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-600', ring: 'ring-blue-500' };
    if (score >= 50) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-600', ring: 'ring-amber-500' };
    return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-600', ring: 'ring-rose-500' };
  };

  const activeResumeObj = resumes.find(r => r._id === selectedResumeId);

  // Filter missing keywords
  const filteredMissingKeywords = (analysis?.missingKeywords || []).filter(k => {
    if (keywordPriorityFilter === 'all') return true;
    return k.priority === keywordPriorityFilter;
  });

  // Filter improvement suggestions
  const filteredSuggestions = (analysis?.improvementSuggestions || []).filter(s => {
    if (suggestionCategoryFilter === 'All') return true;
    return s.category === suggestionCategoryFilter;
  });

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-3">
        <LoadingSpinner />
        <p className="text-xs text-slate-500 font-medium">
          Loading resume text and connecting Phase 2D role alignment...
        </p>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm font-bold text-slate-900">No Resume Uploaded</h3>
          <p className="text-xs text-slate-500">
            Upload your resume document (PDF or DOCX) in the Resume section above to run ATS compatibility scoring, keyword matching, and human readability diagnostics.
          </p>
        </div>
      </div>
    );
  }

  const atsScoreConfig = analysis ? getScoreColor(analysis.atsScore) : getScoreColor(0);
  const readabilityScoreConfig = analysis ? getScoreColor(analysis.readabilityScore) : getScoreColor(0);

  return (
    <div className="space-y-6">
      {/* Target Role & Controls Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Phase 4B
              </span>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                ATS & Human Readability Analyzer
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating resume parsability, keyword alignment for <strong className="text-slate-800">{targetRole}</strong>, and 6-second recruiter scanning clarity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowJdInput(!showJdInput)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
                showJdInput || jobDescription.trim().length > 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{jobDescription.trim().length > 0 ? 'Custom JD Attached' : 'Target Job Description (Optional)'}</span>
              {showJdInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={handleRunAnalysisClick}
              disabled={analyzing || !selectedResumeId}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Analyzing...' : 'Re-run Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Resume & Role Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Active Resume Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Active Resume Document
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => handleResumeSelect(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {resumes.map(r => (
                <option key={r._id} value={r._id}>
                  {r.fileInfo.originalName} ({new Date(r.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Target Role Selector (Connected with Phase 2D) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Target Role (Phase 2D Aligned)</span>
              {recommendation?.targetRole && (
                <span className="text-[10px] text-emerald-700 font-semibold">2D Selected</span>
              )}
            </label>
            {!isCustomRole ? (
              <select
                value={targetRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {recommendation?.recommendedRoles?.map(role => (
                  <option key={role.role} value={role.role}>
                    {role.role} ({role.matchPercentage}% 2D match)
                  </option>
                ))}
                {!recommendation?.recommendedRoles?.some(r => r.role === targetRole) && (
                  <option value={targetRole}>{targetRole}</option>
                )}
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="__custom__">+ Enter Custom Target Role...</option>
              </select>
            ) : (
              <form onSubmit={handleCustomRoleSubmit} className="flex gap-1">
                <input
                  type="text"
                  placeholder="e.g. SRE / Platform Engineer"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-xl"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomRole(false)}
                  className="px-2 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-xl"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {/* Quick Context Summary */}
          <div className="sm:col-span-2 lg:col-span-1 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Analyzed Role</span>
              <span className="font-bold text-slate-800 truncate block max-w-[180px]">{targetRole}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Text Length</span>
              <span className="font-semibold text-slate-700">
                {activeResumeObj?.extractedText ? `${activeResumeObj.extractedText.split(/\s+/).filter(Boolean).length} words` : '0 words'}
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible Custom Job Description Textarea */}
        {showJdInput && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                Paste Target Job Description (Optional)
              </label>
              {jobDescription.trim().length > 0 && (
                <button
                  onClick={() => setJobDescription('')}
                  className="text-[10px] text-rose-600 hover:underline font-medium"
                >
                  Clear Description
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              When provided, the ATS engine scans this specific job posting for required technical competencies and matches them against your resume.
            </p>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting requirements, responsibilities, and required qualifications here..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed text-slate-800"
            />
            <div className="flex justify-end">
              <button
                onClick={handleRunAnalysisClick}
                disabled={analyzing}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg"
              >
                Update Analysis with this Job Description
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Analysis Results */}
      {analyzing ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs font-bold text-slate-800">
            Running ATS Parsing & Readability Engine...
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            Checking document structure, keyword density against {targetRole}, detecting formatting risks, and analyzing bullet point action verbs and metrics.
          </p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Top 4 Primary Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. ATS Compatibility Score */}
            <div className={`p-4 rounded-2xl border ${atsScoreConfig.bg} ${atsScoreConfig.border} shadow-2xs space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> ATS Compatibility
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${atsScoreConfig.bg} ${atsScoreConfig.text} ${atsScoreConfig.border}`}>
                  {analysis.atsScore >= 80 ? 'Optimal' : analysis.atsScore >= 65 ? 'Competitive' : 'Action Needed'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${atsScoreConfig.text}`}>
                  {analysis.atsScore}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>

              <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${atsScoreConfig.bar}`}
                  style={{ width: `${analysis.atsScore}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 leading-snug">
                {analysis.atsScore >= 80
                  ? 'Strong automated indexing potential across enterprise applicant tracking systems.'
                  : analysis.atsScore >= 65
                  ? 'Solid foundation with minor keyword gaps and heading adjustments recommended.'
                  : 'High risk of screening drop-off due to missing role keywords or unparsed sections.'}
              </p>
            </div>

            {/* 2. Keyword & Skill Match % */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-blue-600" /> Keyword Match
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {analysis.relevantSkillsDetected.length} found
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-700">
                  {analysis.keywordMatchPercentage}%
                </span>
                <span className="text-xs text-slate-400 font-semibold">target role match</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-700"
                  style={{ width: `${analysis.keywordMatchPercentage}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 leading-snug">
                {analysis.missingKeywords.filter(k => k.priority === 'high').length} high-priority role keywords missing from resume body text.
              </p>
            </div>

            {/* 3. Human Readability Score */}
            <div className={`p-4 rounded-2xl border ${readabilityScoreConfig.bg} ${readabilityScoreConfig.border} shadow-2xs space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" /> Human Readability
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {analysis.readabilityLevel}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${readabilityScoreConfig.text}`}>
                  {analysis.readabilityScore}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 100 Flesch index</span>
              </div>

              <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${readabilityScoreConfig.bar}`}
                  style={{ width: `${analysis.readabilityScore}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 leading-snug">
                Optimized for standard 6-second recruiter scanning speed and cognitive ease.
              </p>
            </div>

            {/* 4. Bullet-Point Quality */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Bullet Quality
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {analysis.bulletQuality.actionVerbsCount} action verbs
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {analysis.bulletQuality.score}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 100 XYZ score</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${analysis.bulletQuality.score}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 leading-snug">
                {analysis.bulletQuality.metricsCount} quantifiable metrics detected across {analysis.bulletQuality.totalBullets} bullet items.
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2">
            {[
              { id: 'overview', label: 'Executive Summary', icon: Sparkles },
              { id: 'keywords', label: `Keywords & Skills (${analysis.relevantSkillsDetected.length}/${analysis.relevantSkillsDetected.length + analysis.missingKeywords.length})`, icon: Target },
              { id: 'sections', label: `Section Structure (${analysis.sectionsAnalysis.filter(s => s.status === 'optimal').length}/6)`, icon: Layers },
              { id: 'readability', label: 'Readability & Bullets', icon: FileText },
              { id: 'suggestions', label: `Actionable Fixes (${analysis.improvementSuggestions.length})`, icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
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

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Strengths Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Key Resume Strengths Identified
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {analysis.strengths.map((str, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 bg-white/80 rounded-xl border border-emerald-100 text-xs text-slate-800 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formatting Risks Alert Box */}
              {analysis.formattingRisks.length > 0 ? (
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> ATS Formatting Risks ({analysis.formattingRisks.length})
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Issues that could cause document parsing errors
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {analysis.formattingRisks.map((risk, idx) => {
                      const isHigh = risk.severity === 'high';
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                            isHigh ? 'bg-rose-50/60 border-rose-200' : 'bg-amber-50/60 border-amber-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                isHigh ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                              }`}>
                                {risk.severity} Severity
                              </span>
                              <h4 className="text-xs font-bold text-slate-900">{risk.title}</h4>
                            </div>
                            <p className="text-xs text-slate-600">{risk.description}</p>
                          </div>
                          <div className="sm:max-w-xs shrink-0 p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-800 block text-[10px] uppercase text-emerald-700">Recommended Fix:</span>
                            {risk.recommendation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Flawless ATS formatting! Zero high or medium severity layout blockades were found in this document.</span>
                </div>
              )}

              {/* Clarity & Organization Banner */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600" />
                    Content Clarity & Structural Flow (Score: {analysis.contentClarityScore}/100)
                  </h4>
                  <p className="text-xs text-slate-600">{analysis.contentClaritySummary}</p>
                </div>
                <button
                  onClick={() => setActiveSubTab('suggestions')}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  <span>Review {analysis.improvementSuggestions.length} Recommendations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: KEYWORDS & SKILLS (Connected with Phase 2D) */}
          {activeSubTab === 'keywords' && (
            <div className="space-y-6">
              {/* Header explanation with Phase 2D alignment badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-emerald-50/40 border border-blue-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                      Role-Specific Keyword & Skill Alignment
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      Target Role: {targetRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    ATS scanners calculate exact keyword frequency ratios against the benchmark job profile from Phase 2D.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl font-extrabold text-blue-700">{analysis.keywordMatchPercentage}%</span>
                  <span className="text-xs text-slate-400 block font-medium">Alignment Match</span>
                </div>
              </div>

              {/* 1. Relevant Skills Detected in Resume */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Relevant Skills Detected ({analysis.relevantSkillsDetected.length})
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">Found in resume text</span>
                </div>

                {analysis.relevantSkillsDetected.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl">
                    No exact target-role keywords identified in the document text.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysis.relevantSkillsDetected.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Missing Important Keywords */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Missing Important Keywords ({analysis.missingKeywords.length})
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Keywords recruiters and ATS algorithms search for when evaluating candidates for {targetRole}.
                    </p>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex items-center gap-1.5">
                    {(['all', 'high', 'medium', 'low'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setKeywordPriorityFilter(p)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                          keywordPriorityFilter === p
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p} ({p === 'all' ? analysis.missingKeywords.length : analysis.missingKeywords.filter(k => k.priority === p).length})
                      </button>
                    ))}
                  </div>
                </div>

                {filteredMissingKeywords.length === 0 ? (
                  <div className="p-4 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No missing keywords under the selected priority filter!</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {filteredMissingKeywords.map(k => {
                      const isHigh = k.priority === 'high';
                      const isMed = k.priority === 'medium';
                      return (
                        <div
                          key={k.keyword}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                            isHigh ? 'bg-rose-50/50 border-rose-200' : isMed ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">{k.keyword}</span>
                            <span className="text-[10px] text-slate-400 block">{k.category}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                            isHigh ? 'bg-rose-100 text-rose-700' : isMed ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {k.priority}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RESUME SECTION / STRUCTURE ANALYSIS */}
          {activeSubTab === 'sections' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Standard ATS Heading & Structural Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Automated parsing systems rely on standard headers to assign candidate attributes into structured database columns.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.sectionsAnalysis.map(sec => {
                  const isOptimal = sec.status === 'optimal';
                  const isWarning = sec.status === 'warning';

                  return (
                    <div
                      key={sec.name}
                      className={`p-4 rounded-2xl border transition-all ${
                        isOptimal
                          ? 'bg-white border-slate-200 hover:border-emerald-300'
                          : isWarning
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {isOptimal ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <h4 className="text-xs font-bold text-slate-900">{sec.name}</h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isOptimal
                            ? 'bg-emerald-100 text-emerald-800'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sec.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{sec.feedback}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: READABILITY & BULLET POINT QUALITY */}
          {activeSubTab === 'readability' && (
            <div className="space-y-6">
              {/* Readability Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flesch Reading Ease</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">{analysis.readabilityScore}</span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Level: {analysis.readabilityLevel}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Scores between 60-80 provide the fastest comprehension for technical recruiters.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Verbs Used</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">{analysis.bulletQuality.actionVerbsCount}</span>
                    <span className="text-xs text-slate-400">strong verbs</span>
                  </div>
                  <span className="inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Ratio: {Math.round((analysis.bulletQuality.actionVerbsCount / analysis.bulletQuality.totalBullets) * 100)}% of bullets
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Starting bullets with decisive verbs (Engineered, Architected, Deployed) elevates credibility.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantifiable Metrics</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">{analysis.bulletQuality.metricsCount}</span>
                    <span className="text-xs text-slate-400">metric items</span>
                  </div>
                  <span className="inline-block text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    XYZ Proof Count
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Percentages, user numbers, latency drops, and revenue figures substantiate engineering claims.
                  </p>
                </div>
              </div>

              {/* Bullet Points Showcase */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Bullet Point Impact Analysis
                  </h4>
                  <span className="text-xs font-semibold text-emerald-700">
                    Score: {analysis.bulletQuality.score}/100
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-medium">
                  {analysis.bulletQuality.recommendation}
                </p>

                {analysis.bulletQuality.sampleStrengths.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Strong Bullet Example from Your Resume:
                    </span>
                    {analysis.bulletQuality.sampleStrengths.map((bullet, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-slate-800 font-mono">
                        "{bullet}"
                      </div>
                    ))}
                  </div>
                )}

                {analysis.bulletQuality.sampleWeaknesses.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Opportunity to Strengthen:
                    </span>
                    {analysis.bulletQuality.sampleWeaknesses.map((bullet, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-slate-800 font-mono">
                        "{bullet}"
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Repetition & Buzzwords Check */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Repetition & Cliché Word Detection
                  </h4>
                  <span className="text-xs font-bold text-slate-700">
                    Repetition Score: {analysis.repetitionAnalysis.repetitionScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Flagged Buzzwords */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700">Flagged Subjective Buzzwords</span>
                    {analysis.repetitionAnalysis.fillerPhrasesFound.length === 0 ? (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                        Zero generic clichés found ("hardworking", "ninja", "team player"). Clean professional tone!
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.repetitionAnalysis.fillerPhrasesFound.map(ph => (
                          <span key={ph} className="text-xs font-medium px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                            {ph}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Most Repeated Terms */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700">Most Frequently Repeated Words</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.repetitionAnalysis.overusedWords.map(w => (
                        <span key={w.word} className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1">
                          <span>{w.word}</span>
                          <span className="text-[10px] text-slate-400 font-sans">({w.count}x)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SPECIFIC ACTIONABLE SUGGESTIONS */}
          {activeSubTab === 'suggestions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Prioritized Resume Improvement Plan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Concrete steps ordered by their impact on passing automated ATS filters and recruiter interviews.
                  </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap items-center gap-1">
                  {['All', 'Keywords', 'Formatting', 'Impact', 'Content', 'Sections'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSuggestionCategoryFilter(cat)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        suggestionCategoryFilter === cat
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredSuggestions.map((sug, idx) => {
                  const isHigh = sug.priority === 'high';
                  const isMed = sug.priority === 'medium';
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                              isHigh ? 'bg-rose-100 text-rose-800' : isMed ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {sug.priority} Priority
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                              {sug.category}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900">{sug.title}</h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{sug.description}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" /> Actionable Fix:
                        </span>
                        <p className="font-medium">{sug.actionableFix}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
