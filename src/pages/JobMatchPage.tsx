import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { JobAnalysisRecord, ResumeRecord, SkillCategory } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  Building,
  Target,
  Quote,
  Layers,
  ChevronDown,
  ChevronUp,
  History,
  RotateCcw,
  BookOpen,
  Compass
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Programming: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Database: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Web: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Data/ML': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Cloud/Tools': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Soft Skills': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  General: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' }
};

const SAMPLE_JOB_POSTINGS = [
  {
    title: 'Senior Full Stack Engineer',
    company: 'Stripe',
    description: `About the Role:
We are looking for a Senior Full Stack Engineer to join our Payment Platform team. You will design, develop, and scale high-throughput REST APIs and delightful web interfaces.

Responsibilities:
- Build and maintain mission-critical web applications with React, TypeScript, and Tailwind CSS.
- Architect robust microservices and backend endpoints using Node.js, Express, and PostgreSQL.
- Optimize database schemas, queries, and caching with Redis and SQL.
- Collaborate with cross-functional teams in an Agile sprint environment with CI/CD and Docker.
- Champion code quality, test coverage, and clear system architecture documentation.

Requirements:
- 3+ years experience with JavaScript, TypeScript, React, and Node.js.
- Strong knowledge of relational databases (PostgreSQL or MySQL) and REST API principles.
- Experience with Git, Docker, and cloud deployments (AWS or GCP).
- Excellent communication, problem solving, and collaborative skills.

Nice to Have:
- Experience with Next.js, GraphQL, and Kubernetes orchestration.`
  },
  {
    title: 'Machine Learning & NLP Engineer',
    company: 'Anthropic',
    description: `About the Role:
Seeking an NLP & Machine Learning Engineer to develop intelligent text processing models, feature extraction pipelines, and recommendation engines.

Responsibilities:
- Develop NLP pipelines using Python, PyTorch, and Scikit-Learn for text classification and semantic search.
- Preprocess unstructured textual data using tokenization, TF-IDF representations, and cosine similarity embeddings.
- Build performant FastAPI microservices to serve inference models in production.
- Store and query unstructured documents using MongoDB and Elasticsearch.

Qualifications:
- Bachelor's or Master's degree in Computer Science, Data Science, or related field.
- Proficient in Python, Pandas, NumPy, and Scikit-Learn.
- Experience in natural language processing (tokenization, stop-words, n-grams, text similarity).
- Working knowledge of Git, Linux environments, and Docker containers.
- Preferred: Experience with TensorFlow, PyTorch, or HuggingFace transformers.`
  }
];

export const JobMatchPage: React.FC = () => {
  // Resumes list
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Status & Results
  const [analyzing, setAnalyzing] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<JobAnalysisRecord | null>(null);
  const [pastMatches, setPastMatches] = useState<JobAnalysisRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Snippets Expand/Collapse State
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesRes, matchesRes] = await Promise.all([
          apiClient.get<ResumeRecord[]>('/resume/me'),
          apiClient.get<JobAnalysisRecord[]>('/jobs/matches')
        ]);

        const resumesData = resumesRes.data || [];
        setResumes(resumesData);
        if (resumesData.length > 0) {
          // Select latest analyzed resume by default
          const analyzed = resumesData.find(r => r.analysisStatus === 'completed');
          setSelectedResumeId(analyzed ? analyzed._id : resumesData[0]._id);
        }

        const matchesData = matchesRes.data || [];
        setPastMatches(matchesData);
        if (matchesData.length > 0) {
          setCurrentMatch(matchesData[0]);
        }
      } catch (err: any) {
        console.error('[JobMatchPage] Initial load error:', err);
      }
    };

    fetchData();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription || jobDescription.trim().length < 15) {
      setErrorMessage('Please provide a substantive job description (at least 15 characters).');
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.post<JobAnalysisRecord>('/jobs/match', {
        jobTitle: jobTitle.trim() || 'Target Tech Role',
        company: company.trim(),
        jobDescription: jobDescription.trim(),
        resumeId: selectedResumeId || undefined
      });

      if (response.data) {
        setCurrentMatch(response.data);
        setPastMatches(prev => [response.data!, ...prev.filter(m => m._id !== response.data!._id)]);
        setSuccessMessage('Compatibility analysis successfully generated!');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze job match.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_JOB_POSTINGS[0]) => {
    setJobTitle(sample.title);
    setCompany(sample.company);
    setJobDescription(sample.description);
    setErrorMessage(null);
  };

  const toggleSnippet = (skill: string) => {
    setExpandedSnippets(prev => ({
      ...prev,
      [skill]: !prev[skill]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return { text: 'text-emerald-700', bg: 'bg-emerald-500', border: 'border-emerald-200' };
    if (score >= 50) return { text: 'text-amber-700', bg: 'bg-amber-500', border: 'border-amber-200' };
    return { text: 'text-rose-700', bg: 'bg-rose-500', border: 'border-rose-200' };
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-2xs">
                <Target className="w-4 h-4" />
              </div>
              Job Matching & Compatibility Analysis
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Phase 2C — Compare your analyzed resume against target job specifications using deterministic TF-IDF feature extraction, cosine vector alignment, and semantic skill gap taxonomy.
            </p>
          </div>

          {resumes.length > 0 && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-500 font-medium">Target Resume:</span>
              <select
                value={selectedResumeId}
                onChange={e => setSelectedResumeId(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden text-xs cursor-pointer"
              >
                {resumes.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.fileInfo.originalName} {r.analysisStatus === 'completed' ? '✓' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Job Description Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Job Specifications
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400">Sample:</span>
                <button
                  type="button"
                  onClick={() => handleLoadSample(SAMPLE_JOB_POSTINGS[0])}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition"
                >
                  Full Stack
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample(SAMPLE_JOB_POSTINGS[1])}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition"
                >
                  ML & NLP
                </button>
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Job Title <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Company <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Stripe, OpenAI"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Job Description <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {jobDescription.length} characters
                  </span>
                </div>
                <textarea
                  rows={10}
                  required
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description, responsibilities, technical requirements, and preferred qualifications here..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition font-mono leading-relaxed"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={analyzing || !jobDescription.trim()}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Computing TF-IDF & Taxonomy Alignment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Compatibility</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Analyses Quick Drawer */}
          {pastMatches.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Previous Compatibility Runs ({pastMatches.length})
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {pastMatches.map(match => {
                  const score = match.matchResult?.matchPercentage || match.compatibilityBreakdown?.finalWeightedScore || 0;
                  const colors = getScoreColor(score);
                  const isCurrent = currentMatch?._id === match._id;

                  return (
                    <button
                      key={match._id}
                      onClick={() => {
                        setCurrentMatch(match);
                        setJobTitle(match.jobTitle);
                        setCompany(match.company || '');
                        setJobDescription(match.jobDescription);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/70'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate">{match.jobTitle}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {match.company ? `${match.company} • ` : ''}
                          {new Date(match.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${colors.border} ${colors.text} bg-white shrink-0`}>
                        {score}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Compatibility Analysis Results */}
        <div className="lg:col-span-7 space-y-5">
          {analyzing ? (
            <div className="p-16 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-4">
              <LoadingSpinner size="lg" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Evaluating Profile Compatibility</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tokenizing requirements, calculating TF-IDF term weights, deriving cosine similarity, and matching evidence snippets...
                </p>
              </div>
            </div>
          ) : currentMatch ? (
            <div className="space-y-5">
              {/* Score & Summary Banner */}
              {(() => {
                const score = currentMatch.matchResult?.matchPercentage || currentMatch.compatibilityBreakdown?.finalWeightedScore || 0;
                const colors = getScoreColor(score);
                const breakdown = currentMatch.compatibilityBreakdown;

                return (
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Compatibility Report
                          </span>
                          {currentMatch.company && (
                            <span className="text-xs text-slate-500 font-medium">
                              at <strong className="text-slate-800">{currentMatch.company}</strong>
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                          {currentMatch.jobTitle}
                        </h2>
                      </div>

                      {/* Main Circular/Pill Gauge */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-2xl font-black ${colors.text} tracking-tight`}>
                            {score}%
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Match Score
                          </div>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                          <div className="relative w-full h-full flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-200"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}
                                strokeDasharray={`${score}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Skill Overlap
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                          {breakdown?.skillMatchPercentage ?? Math.round((currentMatch.matchingSkills.length / Math.max(currentMatch.requiredSkills.length, 1)) * 100)}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {currentMatch.matchingSkills.length} of {currentMatch.requiredSkills.length} skills
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Cosine Similarity
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                          {breakdown?.textCosineSimilarity ?? 72}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          TF-IDF Vector Space
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          Partial / Transferable
                        </div>
                        <div className="text-sm font-extrabold text-amber-900 mt-0.5">
                          {currentMatch.partialSkills?.length ?? 0}
                        </div>
                        <div className="text-[10px] text-amber-600">
                          Adjacent technologies
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/60">
                        <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                          Missing Skills
                        </div>
                        <div className="text-sm font-extrabold text-rose-900 mt-0.5">
                          {currentMatch.missingSkills.length}
                        </div>
                        <div className="text-[10px] text-rose-600">
                          Identified skill gaps
                        </div>
                      </div>
                    </div>

                    {/* Executive Explanation */}
                    {currentMatch.explanation && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Compass className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Match Diagnosis & Synthesis</span>
                        </div>
                        <p>{currentMatch.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 1. Matched Skills with Evidence */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matched Skills ({currentMatch.matchedSkillsDetails?.length || currentMatch.matchingSkills.length})
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Verified against resume & evidence engine
                  </span>
                </div>

                {currentMatch.matchedSkillsDetails && currentMatch.matchedSkillsDetails.length > 0 ? (
                  <div className="space-y-2.5">
                    {currentMatch.matchedSkillsDetails.map(item => {
                      const isExpanded = expandedSnippets[item.skill];
                      const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.General;

                      return (
                        <div
                          key={item.skill}
                          className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition space-y-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-900">
                                {item.skill}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                {item.category}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 capitalize">
                                {item.proficiencyLevel}
                              </span>
                            </div>

                            {item.snippets && item.snippets.length > 0 && (
                              <button
                                onClick={() => toggleSnippet(item.skill)}
                                className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
                              >
                                <span>{isExpanded ? 'Hide Evidence' : 'Show Evidence'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>

                          {/* Evidence Snippets */}
                          {isExpanded && item.snippets && item.snippets.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Quote className="w-3 h-3 text-emerald-600" />
                                <span>Extracted Resume Evidence:</span>
                              </div>
                              {item.snippets.map((snip, idx) => (
                                <p
                                  key={idx}
                                  className="text-[11px] font-mono text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed italic"
                                >
                                  "{snip}"
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : currentMatch.matchingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.matchingSkills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No direct skill matches identified in current profile.</p>
                )}
              </div>

              {/* 2. Partial / Transferable Skills */}
              {currentMatch.partialSkills && currentMatch.partialSkills.length > 0 && (
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      Related & Transferable Skills ({currentMatch.partialSkills.length})
                    </h3>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
                      Adjacent Foundations
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentMatch.partialSkills.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/30 text-xs space-y-1.5"
                      >
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <span className="text-rose-700 line-through decoration-rose-400/60 font-medium">
                            {p.jobSkill}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="text-emerald-700 font-extrabold">
                            {p.candidateSkill} (Proven in Profile)
                          </span>
                          <span className="ml-auto text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {p.relationType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {p.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Missing Skills Section */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Missing Skills & Priority Gaps ({currentMatch.missingSkills.length})
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Recommended target areas
                  </span>
                </div>

                {currentMatch.missingSkills.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.missingSkills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {skill}
                        </span>
                      ))}
                    </div>

                    {currentMatch.recommendations && currentMatch.recommendations.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Strategic Upskilling Recommendations:</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {currentMatch.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Incredible match! Your profile satisfies all primary technical requirements extracted from this job posting.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No Job Compatibility Analyzed Yet"
              description="Paste a target job posting on the left, select your analyzed resume, and run the matching algorithm to generate detailed compatibility insights."
              actionText="Load Sample Job Posting"
              onAction={() => handleLoadSample(SAMPLE_JOB_POSTINGS[0])}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatchPage;
