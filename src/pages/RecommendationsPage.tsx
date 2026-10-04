import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services/apiClient';
import type { CareerRecommendationRecord, ISkillGap } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Lightbulb,
  ArrowRight,
  Target,
  Briefcase,
  AlertCircle,
  Clock,
  Code2,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Map,
  FileCheck2,
  BarChart3
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

// Helper functions for dynamic skill gap and learning area generation
const determineCategory = (skill: string): string => {
  const s = skill.toLowerCase();
  if (s.includes('docker') || s.includes('kubernetes') || s.includes('aws') || s.includes('ci/cd') || s.includes('terraform') || s.includes('linux')) {
    return 'DevOps & Cloud';
  }
  if (s.includes('spark') || s.includes('kafka') || s.includes('airflow') || s.includes('warehouse') || s.includes('snowflake') || s.includes('etl')) {
    return 'Data Engineering';
  }
  if (s.includes('react') || s.includes('vue') || s.includes('next') || s.includes('frontend') || s.includes('css') || s.includes('tailwind')) {
    return 'Frontend Engineering';
  }
  if (s.includes('node') || s.includes('express') || s.includes('microservice') || s.includes('redis') || s.includes('postgres') || s.includes('mongo') || s.includes('api')) {
    return 'Backend & Systems';
  }
  if (s.includes('python') || s.includes('typescript') || s.includes('javascript') || s.includes('go') || s.includes('java') || s.includes('sql')) {
    return 'Programming Languages';
  }
  if (s.includes('machine learning') || s.includes('tensorflow') || s.includes('pytorch') || s.includes('scikit') || s.includes('statistics') || s.includes('power bi') || s.includes('tableau') || s.includes('visualization')) {
    return 'Data & AI';
  }
  return 'Technical Competency';
};

const determineLearningArea = (skill: string, roleName: string): string => {
  const s = skill.toLowerCase();
  if (s.includes('docker')) return `Container lifecycle, multi-stage Dockerfiles, image optimization, caching strategies, and non-root security principles tailored to ${roleName}.`;
  if (s.includes('kubernetes')) return `Kubernetes cluster architecture, deployments, StatefulSets, Ingress controllers, Helm packages, and ConfigMaps for ${roleName}.`;
  if (s.includes('terraform')) return `Declarative infrastructure-as-code syntax, state management, provider blocks, and modular reusable cloud blueprints for ${roleName}.`;
  if (s.includes('ci/cd') || s.includes('actions')) return `Automated CI/CD workflows, pull request verification, container vulnerability scanning, and automated deployment pipelines for ${roleName}.`;
  if (s.includes('aws') || s.includes('cloud')) return `Core cloud architecture (VPC, IAM, EC2/ECS/EKS, S3, RDS) and cost/resilience optimization patterns for ${roleName}.`;
  if (s.includes('spark')) return `Resilient distributed datasets (RDDs), Spark DataFrames, partitioning, shuffle optimizations, and PySpark transformations.`;
  if (s.includes('kafka')) return `Distributed message streaming, topic partition strategies, consumer group rebalancing, and event-driven architectures.`;
  if (s.includes('airflow')) return `Directed Acyclic Graphs (DAGs), task dependencies, sensors, custom operators, and idempotent pipeline scheduling.`;
  if (s.includes('typescript')) return `Strict static typing, generic constraints, mapped types, discriminated unions, and compiler configuration for ${roleName}.`;
  if (s.includes('react') || s.includes('next')) return `Component lifecycles, custom hooks, reactive performance profiling, state isolation, and server-side hydration for ${roleName}.`;
  if (s.includes('node') || s.includes('express')) return `Asynchronous I/O execution, RESTful routing, middleware pipelines, JWT auth handling, and error middleware for ${roleName}.`;
  if (s.includes('mongo') || s.includes('postgres') || s.includes('sql')) return `Schema normalization/denormalization, compound indexing, query execution planning (EXPLAIN), and transaction isolation.`;
  if (s.includes('machine learning')) return `Supervised/unsupervised algorithms, feature engineering, model evaluation metrics (ROC-AUC, F1), and model inference pipelines.`;
  if (s.includes('power bi') || s.includes('tableau')) return `Data modeling, DAX expressions, dynamic filtering, drill-through hierarchies, and executive KPI dashboards.`;
  return `Targeted architectural patterns, testing methodologies, and real-world implementation standards for ${skill} in ${roleName}.`;
};

const suggestProjects = (skill: string, roleName: string): string[] => {
  const s = skill.toLowerCase();
  if (s.includes('kubernetes')) return ['Self-Healing Microservices Deployment on EKS/GKE', 'Kubernetes Helm Chart Release Pipeline'];
  if (s.includes('docker')) return ['Multi-Stage Docker Microservices Containerization', 'Local Distributed Docker Compose Stack'];
  if (s.includes('terraform')) return ['Modular AWS Infrastructure-as-Code Blueprint', 'Terraform Automated State Backend with Remote Locking'];
  if (s.includes('ci/cd') || s.includes('actions')) return ['GitHub Actions Automated CI/CD Pipeline with Matrix Testing', 'Zero-Downtime Blue/Green Deployment Workflow'];
  if (s.includes('aws') || s.includes('cloud')) return ['Serverless Event Processor on AWS Lambda, S3 & SQS', 'Secure Multi-AZ Web Infrastructure with RDS Auto-Scaling'];
  if (s.includes('spark')) return ['Distributed Log Ingestion & Analytics Pipeline with PySpark', 'Large-Scale Parquet Data Lake Processing'];
  if (s.includes('kafka')) return ['High-Throughput IoT Event Ingestion Engine with Kafka', 'Real-Time Fraud Detection Stream Processor'];
  if (s.includes('airflow')) return ['Automated Financial Transaction ETL Orchestration DAG', 'Multi-Source Data Synchronization Pipeline'];
  if (s.includes('typescript')) return ['Strictly-Typed Full-Stack Web Application with Shared Contracts', 'Type-Safe API Client with Zod Schema Validation'];
  if (s.includes('react') || s.includes('next')) return ['Interactive Real-Time Analytics Dashboard with React', 'Server-Side Rendered Web App in Next.js'];
  if (s.includes('node') || s.includes('express')) return ['Resilient Microservice API with Authentication & Caching', 'Real-Time Event Notification Engine with WebSockets'];
  if (s.includes('mongo') || s.includes('postgres') || s.includes('sql')) return ['High-Concurrency Relational/Document Storage Layer', 'Transactional Database Schema with Query Optimization'];
  if (s.includes('machine learning')) return ['Predictive Churn Classifier with Feature Store', 'Automated NLP Text Summarization Service'];
  if (s.includes('power bi') || s.includes('tableau')) return ['Executive Sales & Financial Performance Dashboard', 'Customer Retention Cohort Analysis with Interactive Drilldowns'];
  return [`Production ${skill} Prototype for ${roleName}`, `Verifiable ${skill} Implementation Module`];
};

export const RecommendationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<CareerRecommendationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<CareerRecommendationRecord>('/recommendations');
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
      setError(err.message || 'Unable to retrieve career recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await apiClient.post<CareerRecommendationRecord>('/recommendations/generate', {});
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error('Failed to regenerate recommendations:', err);
      setError(err.message || 'Failed to generate recommendations.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Sync selectedRoleIndex with query param or localStorage
  useEffect(() => {
    if (data?.recommendedRoles && data.recommendedRoles.length > 0) {
      const roleParam = searchParams.get('role') || localStorage.getItem('careerlens_selected_target_role');
      if (roleParam) {
        const foundIndex = data.recommendedRoles.findIndex(
          r => r.role.toLowerCase() === roleParam.toLowerCase()
        );
        if (foundIndex !== -1 && foundIndex !== selectedRoleIndex) {
          setSelectedRoleIndex(foundIndex);
        }
      }
    }
  }, [data, searchParams]);

  const handleRoleSelect = (idx: number, roleName: string) => {
    setSelectedRoleIndex(idx);
    setSearchParams({ role: roleName });
    localStorage.setItem('careerlens_selected_target_role', roleName);
  };

  // Dynamically determine selectedRole based on searchParams, localStorage, or selectedRoleIndex
  const selectedRole = useMemo(() => {
    if (!data?.recommendedRoles || data.recommendedRoles.length === 0) return null;
    const roleParam = searchParams.get('role') || (typeof window !== 'undefined' ? localStorage.getItem('careerlens_selected_target_role') : null);
    if (roleParam) {
      const match = data.recommendedRoles.find(
        r => r.role.trim().toLowerCase() === roleParam.trim().toLowerCase()
      );
      if (match) return match;
    }
    return data.recommendedRoles[selectedRoleIndex] || data.recommendedRoles[0];
  }, [data, searchParams, selectedRoleIndex]);

  // Dynamically compute/retrieve the skill gaps strictly for the currently selected role
  const activeRoleSkillGaps: ISkillGap[] = useMemo(() => {
    if (!selectedRole) return [];

    // If the role object already has backend-computed skillGaps, use them
    if (selectedRole.skillGaps && selectedRole.skillGaps.length > 0) {
      return selectedRole.skillGaps;
    }

    // Otherwise, generate them dynamically from the selected role's missing skills
    return (selectedRole.missingSkills || []).map((skill, idx) => {
      const isCoreHighPriority = idx < 2;
      const category = determineCategory(skill);
      const learningArea = determineLearningArea(skill, selectedRole.role);
      const projects = suggestProjects(skill, selectedRole.role);

      return {
        skill,
        category,
        priority: isCoreHighPriority ? 'high' : idx < 4 ? 'medium' : 'low',
        demandFrequency: isCoreHighPriority ? 3 : 1,
        recommendedLearningArea: learningArea,
        estimatedHours: isCoreHighPriority ? 30 : idx < 4 ? 20 : 12,
        suggestedProjects: projects,
        learningResources: [
          {
            title: `Hands-on ${skill} Mastery for ${selectedRole.role}`,
            type: 'Interactive Tutorial & Lab',
            level: isCoreHighPriority ? 'Foundational to Intermediate' : 'Intermediate',
            description: `Guided architectural exercises for integrating ${skill} into ${selectedRole.role} workflows.`
          },
          {
            title: `Production ${skill} Best Practices`,
            type: 'Documentation & Patterns',
            level: 'Advanced',
            description: `Official documentation, testing methodologies, and architectural patterns for ${skill}.`
          }
        ]
      };
    });
  }, [selectedRole]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 font-medium mt-3">Synthesizing personalized career recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
              Career Recommendations & Gap Analysis
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Phase 2D
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Grounded in your verified skill evidence and Phase 2C job compatibility analysis.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Re-analyzing...' : 'Refresh Recommendations'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Role & Readiness Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-700/60 inline-flex items-center gap-1.5">
            <Target className="w-3 h-3 text-emerald-400" />
            Target Role Alignment
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {data?.targetRole || 'Target Career Role'}
          </h2>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Synthesized by correlating your extracted resume skills, verified GitHub repositories, and latest job compatibility matches.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/15 relative z-10 shrink-0">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-200">Overall Readiness</span>
            <div className="text-3xl font-black text-white">{data?.overallReadiness || 75}%</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-left text-[11px] text-emerald-100 space-y-0.5">
            <p className="font-bold text-white">{data?.skillGaps?.length || 0} Target Gaps</p>
            <p className="text-emerald-200">{data?.recommendedRoles?.length || 0} Alternate Paths</p>
          </div>
        </div>
      </div>

      {/* Section 1: Career Role Matches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Suitable Career Roles Based on Your Skills
          </h2>
          <span className="text-xs text-slate-400">Click a role below to view tailored skill gaps</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.recommendedRoles || []).map((recRole, idx) => {
            const isSelected = selectedRoleIndex === idx;
            const pct = recRole.matchPercentage;
            const badgeColor =
              pct >= 75
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : pct >= 50
                ? 'text-amber-800 bg-amber-50 border-amber-200'
                : 'text-slate-700 bg-slate-100 border-slate-200';

            return (
              <div
                key={recRole.role}
                onClick={() => handleRoleSelect(idx, recRole.role)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200/70 hover:border-emerald-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate flex items-center gap-1.5">
                      <span>{recRole.role}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {recRole.matchedSkills.length} matched • {recRole.missingSkills.length} missing
                    </p>
                  </div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${badgeColor}`}>
                    {pct}%
                  </span>
                </div>

                {/* Linear progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {recRole.reason}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Role Detailed Breakdown */}
      {selectedRole && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Detailed Role Breakdown
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">{selectedRole.role}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-900">
                Fit: <strong className="text-emerald-700">{selectedRole.matchPercentage}%</strong>
              </span>
              <Link
                to={`/ats-analyzer?role=${encodeURIComponent(selectedRole.role)}`}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                <span>ATS Check</span>
              </Link>
              <Link
                to={`/benchmarking?role=${encodeURIComponent(selectedRole.role)}`}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Benchmark</span>
              </Link>
              <Link
                to={`/roadmap?role=${encodeURIComponent(selectedRole.role)}`}
                state={{ selectedRole: selectedRole.role }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Map className="w-3.5 h-3.5" />
                <span>View Learning Roadmap</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Matched Verified Skills ({selectedRole.matchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedRole.matchedSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
                {selectedRole.matchedSkills.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No direct matches found.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/60 space-y-2">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Identified Skill Gaps ({selectedRole.missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedRole.missingSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 text-xs font-semibold shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
                {selectedRole.missingSkills.length === 0 && (
                  <p className="text-xs text-emerald-700 font-semibold">All core skills satisfied for this role!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: DYNAMIC Prioritized Skill Gaps & Recommended Learning Areas for the Selected Role */}
      {selectedRole && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Prioritized Skill Gaps & Recommended Learning Areas for{' '}
                <span className="text-emerald-700 font-extrabold underline underline-offset-4 decoration-emerald-300">
                  {selectedRole.role}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {activeRoleSkillGaps.length} missing skill areas specifically required to unlock the {selectedRole.role} role.
              </p>
            </div>

            <Link
              to={`/roadmap?role=${encodeURIComponent(selectedRole.role)}`}
              state={{ selectedRole: selectedRole.role }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1 shrink-0"
            >
              <span>View Learning Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeRoleSkillGaps.length === 0 ? (
            <div className="p-8 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Zero Skill Gaps for {selectedRole.role}!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You already possess verified competence across all core requirements for this position.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRoleSkillGaps.map((gap, idx) => {
                const priorityBadge =
                  gap.priority === 'high'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : gap.priority === 'medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200';

                return (
                  <div key={gap.skill} className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900">{gap.skill}</h3>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                            {gap.priority} Priority
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Domain: {gap.category} • Role Requisite for {selectedRole.role}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          ~{gap.estimatedHours} hrs
                        </span>
                      </div>
                    </div>

                    {/* Recommended Learning Area */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Target Learning Curriculum
                      </span>
                      <p className="font-medium text-slate-800 leading-relaxed">
                        {gap.recommendedLearningArea}
                      </p>
                    </div>

                    {/* Suggested Project Ideas */}
                    {gap.suggestedProjects && gap.suggestedProjects.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                          Suggested Hands-on Project Deliverable
                        </span>
                        <ul className="space-y-1">
                          {gap.suggestedProjects.map((p, pIdx) => (
                            <li key={pIdx} className="text-xs text-slate-600 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CTA Card linking to Roadmap */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">
            Ready to close your skill gaps for {selectedRole?.role || 'your target role'}?
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Follow the stage-by-stage learning roadmap with interactive milestone checkboxes.
          </p>
        </div>
        <Link
          to={`/roadmap?role=${encodeURIComponent(selectedRole?.role || data?.targetRole || 'Data Analyst')}`}
          state={{ selectedRole: selectedRole?.role }}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Explore Career Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
