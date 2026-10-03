import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { ResumeRecord, NlpAnalysisResult, SkillCategory, ExtractedSkill } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { AtsReadabilityAnalyzer } from '../components/resume/AtsReadabilityAnalyzer';
import {
  FileText,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileUp,
  Copy,
  Check,
  Eye,
  Sparkles,
  Cpu,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Tag,
  FileCheck2
} from 'lucide-react';

const CATEGORY_COLORS: Record<SkillCategory, { bg: string; text: string; border: string }> = {
  Programming: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Database: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Web: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Data/ML': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Cloud/Tools': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Soft Skills': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export const ResumePage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active Resume & Analysis State
  const [activeResume, setActiveResume] = useState<ResumeRecord | null>(null);
  const [analysisResult, setAnalysisResult] = useState<NlpAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'ats' | 'text'>('skills');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await apiClient.get<ResumeRecord[]>('/resume/me');
      const data = res.data || [];
      setResumes(data);
      if (data.length > 0) {
        if (!activeResume) {
          selectResume(data[0]);
        } else {
          const updated = data.find(r => r._id === activeResume._id);
          if (updated) selectResume(updated);
        }
      }
    } catch (err: any) {
      console.error('[ResumePage] Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectResume = (resume: ResumeRecord) => {
    setActiveResume(resume);
    if (resume.analysisResult) {
      setAnalysisResult(resume.analysisResult);
      setActiveTab('skills');
    } else {
      setAnalysisResult(null);
      // Try fetching existing analysis
      fetchAnalysis(resume._id);
    }
  };

  const fetchAnalysis = async (resumeId: string) => {
    try {
      const res = await apiClient.get<NlpAnalysisResult>(`/resume/${resumeId}/analysis`);
      if (res.data) {
        setAnalysisResult(res.data);
      }
    } catch {
      // Not yet analyzed
      setAnalysisResult(null);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!['.pdf', '.docx'].includes(ext)) {
        setErrorMessage('Invalid file format. Only PDF (.pdf) and Word (.docx) documents are supported.');
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds maximum allowed limit of 10MB.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await apiClient.uploadFile<ResumeRecord>('/resume/upload', formData);

      if (res.data) {
        setSuccessMessage('Resume uploaded and processed with NLP skill extraction!');
        setSelectedFile(null);
        selectResume(res.data);
        await fetchResumes();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload and extract text from resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!activeResume) return;

    setAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.post<NlpAnalysisResult>(`/resume/${activeResume._id}/analyze`, {});
      if (res.data) {
        setAnalysisResult(res.data);
        setActiveTab('skills');
        setSuccessMessage('NLP skill extraction and TF-IDF representation completed successfully!');
        await fetchResumes();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'NLP analysis failed. Please check document content.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/resume/${id}`);
      if (activeResume?._id === id) {
        setActiveResume(null);
        setAnalysisResult(null);
      }
      await fetchResumes();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCopyText = () => {
    if (activeResume?.extractedText) {
      navigator.clipboard.writeText(activeResume.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSnippet = (skillName: string) => {
    setExpandedSnippets(prev => ({
      ...prev,
      [skillName]: !prev[skillName]
    }));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
  };

  // Filter skills by selected category
  const filteredSkills: ExtractedSkill[] = analysisResult
    ? selectedCategory === 'All'
      ? analysisResult.extractedSkills
      : analysisResult.extractedSkills.filter(s => s.category === selectedCategory)
    : [];

  const categoriesList: SkillCategory[] = [
    'Programming',
    'Database',
    'Web',
    'Data/ML',
    'Cloud/Tools',
    'Soft Skills'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" /> Resume NLP & Skill Extraction Engine
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated text normalization, TF-IDF term representation, Cosine Similarity matching, and multi-domain skill evidence extraction.
        </p>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUploadSubmit} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Upload Resume File (PDF / DOCX)</h2>

        {errorMessage && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-all group">
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
            id="resume-file-input"
          />
          <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-105 flex items-center justify-center transition-transform">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 hover:text-emerald-700">
                Click to browse resume document
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Supports PDF (.pdf) and Word (.docx) up to 10MB
              </p>
            </div>
          </label>
        </div>

        {selectedFile && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                {selectedFile.name.endsWith('.pdf') ? 'PDF' : 'DOCX'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400 font-medium">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Extracting & Analyzing...' : 'Upload & Run NLP Analysis'}
            </button>
          </div>
        )}
      </form>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner />
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Resumes Uploaded Yet"
          description="Upload a PDF or DOCX resume document above to extract text and analyze technical competencies."
          actionText="Select Resume File →"
          onAction={() => document.getElementById('resume-file-input')?.click()}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Uploaded Resumes Sidebar */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Uploaded Documents</h2>
            {resumes.map((res) => {
              const isActive = activeResume?._id === res._id;
              const skillCount = res.skills?.length || res.analysisResult?.extractedSkills?.length || 0;
              return (
                <div
                  key={res._id}
                  onClick={() => selectResume(res)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200/60 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{res.fileInfo.originalName}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span>{formatFileSize(res.fileInfo.size)}</span>
                      <span>•</span>
                      <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      {skillCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> {skillCount} skills detected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          Pending Analysis
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectResume(res);
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-white"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(res._id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details & NLP Analysis Panel */}
          <div className="lg:col-span-2">
            {activeResume ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-5">
                {/* Header with Title and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{activeResume.fileInfo.originalName}</h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Uploaded on {new Date(activeResume.createdAt).toLocaleString()} • {activeResume.extractedText?.length || 0} characters
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTriggerAnalysis}
                      disabled={analyzing}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-2xs"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                      {analyzing ? 'Running NLP...' : 'Re-run NLP Analysis'}
                    </button>

                    <button
                      onClick={handleCopyText}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                  <button
                    onClick={() => setActiveTab('skills')}
                    className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
                      activeTab === 'skills'
                        ? 'text-emerald-700 border-b-2 border-emerald-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> NLP Extracted Skills
                      {analysisResult && (
                        <span className="ml-1 bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full">
                          {analysisResult.extractedSkills.length}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ats')}
                    className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
                      activeTab === 'ats'
                        ? 'text-emerald-700 border-b-2 border-emerald-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5" /> ATS & Readability
                      <span className="ml-1 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                        Phase 4B
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
                      activeTab === 'text'
                        ? 'text-emerald-700 border-b-2 border-emerald-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Extracted Raw Text
                    </span>
                  </button>
                </div>

                {/* TAB 1: NLP Extracted Skills */}
                {activeTab === 'skills' && (
                  <div className="space-y-5">
                    {analyzing ? (
                      <div className="p-12 text-center space-y-3">
                        <LoadingSpinner />
                        <p className="text-xs text-slate-500 font-medium">
                          Running text normalization, TF-IDF vectorization, and cosine similarity matching...
                        </p>
                      </div>
                    ) : analysisResult ? (
                      <>
                        {/* Profile Summary Card */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> NLP Candidate Competency Summary
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700">
                              Profile Completeness: {analysisResult.statistics.profileCompletenessScore}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {analysisResult.summary}
                          </p>
                        </div>

                        {/* Top Metrics Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Skills</span>
                            <div className="text-base font-extrabold text-slate-900">{analysisResult.statistics.totalSkillsFound}</div>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Technical</span>
                            <div className="text-base font-extrabold text-slate-900">{analysisResult.statistics.technicalSkillsCount}</div>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Soft Skills</span>
                            <div className="text-base font-extrabold text-slate-900">{analysisResult.statistics.softSkillsCount}</div>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Domain</span>
                            <div className="text-xs font-bold text-emerald-700 truncate">{analysisResult.statistics.topCategory}</div>
                          </div>
                        </div>

                        {/* Category Filter Chips */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-slate-500" /> Filter by Skill Category
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                              Showing {filteredSkills.length} of {analysisResult.extractedSkills.length} skills
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => setSelectedCategory('All')}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                selectedCategory === 'All'
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              All ({analysisResult.extractedSkills.length})
                            </button>
                            {categoriesList.map(cat => {
                              const count = analysisResult.categoryDistribution[cat] || 0;
                              const isSelected = selectedCategory === cat;
                              return (
                                <button
                                  key={cat}
                                  onClick={() => setSelectedCategory(cat)}
                                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                    isSelected
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {cat} ({count})
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Skills List Grid */}
                        {filteredSkills.length === 0 ? (
                          <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                            No skills found in the <span className="font-semibold">{selectedCategory}</span> category.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredSkills.map(skill => {
                              const colors = CATEGORY_COLORS[skill.category] || {
                                bg: 'bg-slate-50',
                                text: 'text-slate-700',
                                border: 'border-slate-200'
                              };
                              const isExpanded = !!expandedSnippets[skill.name];

                              return (
                                <div
                                  key={skill.name}
                                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all space-y-2.5"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        {skill.name}
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${colors.bg} ${colors.text} ${colors.border}`}>
                                          {skill.category}
                                        </span>
                                      </h4>
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        Proficiency: <span className="capitalize font-semibold text-slate-600">{skill.proficiencyLevel}</span> • Mentions: <span className="font-semibold text-slate-600">{skill.frequency}x</span>
                                      </p>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                                        {Math.round(skill.confidence * 100)}% match
                                      </span>
                                    </div>
                                  </div>

                                  {/* Confidence Meter Bar */}
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.round(skill.confidence * 100)}%` }}
                                    />
                                  </div>

                                  {/* Evidence Snippet Dropdown */}
                                  {skill.snippets && skill.snippets.length > 0 && (
                                    <div className="pt-1 border-t border-slate-100">
                                      <button
                                        onClick={() => toggleSnippet(skill.name)}
                                        className="text-[10px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                                      >
                                        <Award className="w-3 h-3 text-slate-400" />
                                        <span>Resume Context Evidence</span>
                                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>

                                      {isExpanded && (
                                        <div className="mt-1.5 p-2 bg-slate-50 rounded-lg text-[10px] text-slate-600 font-mono leading-relaxed border border-slate-200/60">
                                          "{skill.snippets[0]}"
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Top TF-IDF Keywords Cloud */}
                        {analysisResult.topKeywords && analysisResult.topKeywords.length > 0 && (
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Tag className="w-3 h-3 text-slate-500" /> Top TF-IDF Weighted Terms in Document
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {analysisResult.topKeywords.map(kw => (
                                <span
                                  key={kw.term}
                                  className="text-[11px] px-2.5 py-0.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono flex items-center gap-1"
                                >
                                  <span>{kw.term}</span>
                                  <span className="text-[9px] text-slate-400 font-sans">({kw.score})</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <Sparkles className="w-8 h-8 text-emerald-600 mx-auto" />
                        <div>
                          <h3 className="text-xs font-bold text-slate-800">NLP Skill Analysis Not Yet Executed</h3>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                            Run automated skill extraction to identify technical keywords, compute TF-IDF relevance, and verify competencies across categories.
                          </p>
                        </div>
                        <button
                          onClick={handleTriggerAnalysis}
                          disabled={analyzing}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 transition-all shadow-xs"
                        >
                          <Sparkles className="w-4 h-4" /> Start NLP Skill Extraction
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: ATS & Human Readability Analyzer (Phase 4B) */}
                {activeTab === 'ats' && (
                  <div className="pt-2">
                    <AtsReadabilityAnalyzer
                      initialResumeId={activeResume._id}
                      onSelectResume={selectResume}
                    />
                  </div>
                )}

                {/* TAB 3: Extracted Raw Text */}
                {activeTab === 'text' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-700 max-h-[460px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {activeResume.extractedText || 'No text extracted from document.'}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/60 text-slate-400 text-xs font-medium">
                Select a resume on the left to view NLP analysis and extracted skills.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
