import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ICareerAnalyticsData } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  Map,
  CheckCircle2,
  Clock,
  Layers,
  FolderGit2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Target,
  FileCheck2,
  Sparkles,
  Zap,
  Check,
  CheckCheck,
  BookOpen
} from 'lucide-react';

interface ProgressTrackingViewProps {
  analytics: ICareerAnalyticsData;
  onSelectRole: (role: string) => void;
}

export const ProgressTrackingView: React.FC<ProgressTrackingViewProps> = ({
  analytics,
  onSelectRole
}) => {
  const {
    targetRole,
    progressTracking
  } = analytics;

  const [activeStageFilter, setActiveStageFilter] = useState<number | 'all'>('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'missing'>('all');

  if (!progressTracking) {
    return null;
  }

  const {
    roadmapMilestones,
    skillAcquisition,
    practicalProjects,
    portfolioEvidence,
    overallReadinessProgress
  } = progressTracking;

  // Filter practical projects
  const filteredProjects = practicalProjects.projectsList.filter(p => {
    if (projectStatusFilter === 'all') return true;
    return p.status === projectStatusFilter;
  });

  // Filter milestones by stage
  const filteredMilestones = roadmapMilestones.milestonesList.filter(m => {
    if (activeStageFilter === 'all') return true;
    return m.stage === activeStageFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Overview & Multi-Track Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Track 1: Roadmap Milestones */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-4 h-4 text-emerald-600" /> Learning Milestones
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {roadmapMilestones.percentComplete}% Complete
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{roadmapMilestones.completedMilestones}</span>
              <span className="text-xs text-slate-400 font-medium">/ {roadmapMilestones.totalMilestones} Milestones</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(roadmapMilestones.percentComplete, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Remaining: <strong className="text-slate-800">{roadmapMilestones.remainingMilestones}</strong></span>
            <span>{roadmapMilestones.stages.length} Stages</span>
          </div>
        </div>

        {/* Track 2: Skill Acquisition */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" /> Skill Acquisition
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              {skillAcquisition.acquisitionRate}% Acquired
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-700">{skillAcquisition.acquiredSkillsCount}</span>
              <span className="text-xs text-slate-400 font-medium">/ {skillAcquisition.totalSkillsRequired} Skills</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(skillAcquisition.acquisitionRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Gaps: <strong className="text-rose-600">{skillAcquisition.remainingSkillsCount}</strong></span>
            <span>{skillAcquisition.remainingLearningHours} hrs needed</span>
          </div>
        </div>

        {/* Track 3: Practical Projects */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-purple-600" /> Practical Projects
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              {practicalProjects.completionPercentage}% Done
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-700">{practicalProjects.completedCount}</span>
              <span className="text-xs text-slate-400 font-medium">/ {practicalProjects.totalProjects} Projects</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(practicalProjects.completionPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>In Progress: <strong className="text-amber-600">{practicalProjects.inProgressCount}</strong></span>
            <span>Pending: <strong className="text-slate-800">{practicalProjects.remainingCount}</strong></span>
          </div>
        </div>

        {/* Track 4: Portfolio Evidence */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Portfolio Evidence
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {portfolioEvidence.overallEvidenceScore}% Readiness
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{portfolioEvidence.verifiedProofCount}</span>
              <span className="text-xs text-slate-400 font-medium">Verified Proofs</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(portfolioEvidence.overallEvidenceScore, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Sources: <strong className="text-slate-800">{portfolioEvidence.evidenceSources.filter(s => s.verified).length} Active</strong></span>
            <span className="text-emerald-700 font-bold">Production-Ready</span>
          </div>
        </div>
      </div>

      {/* 2. Overall Career-Readiness Progress Timeline / Stepper */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Overall Career-Readiness Stage Trajectory
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tracking journey from initial profile baseline through verified milestones toward market threshold for {targetRole}.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500">Current Standing:</span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {overallReadinessProgress.currentReadiness}% Readiness
            </span>
          </div>
        </div>

        {/* Multi-Stage Step Progress Visualizer */}
        <div className="pt-3 pb-2 grid grid-cols-1 md:grid-cols-5 gap-3">
          {overallReadinessProgress.trajectoryStages.map((st, idx) => {
            const isCompleted = st.status === 'completed';
            const isCurrent = st.status === 'current';
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border relative transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200/70 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Stage {idx + 1}
                  </span>
                  {isCompleted ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[10px]">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : isCurrent ? (
                    <span className="text-emerald-800 bg-emerald-100 font-extrabold px-1.5 py-0.2 rounded text-[9px] uppercase">
                      Current
                    </span>
                  ) : (
                    <span className="text-slate-400 font-semibold text-[10px]">
                      Target
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {st.stage}
                  </span>
                  <span className={`text-lg font-black ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                    {st.score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Career Roadmap Milestones & Learning Progress by Stage */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-4 h-4 text-emerald-600" /> Roadmap Learning Milestones by Stage
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Progressive milestone achievements across beginner foundational, intermediate systems, and advanced production stages.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/roadmap?role=${encodeURIComponent(targetRole)}`}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>Full Roadmap View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stage Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {roadmapMilestones.stages.map(st => (
            <div
              key={st.stageNumber}
              className={`p-3.5 rounded-xl border transition-all ${
                activeStageFilter === st.stageNumber
                  ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/10'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Stage {st.stageNumber}</span>
                <span className="font-extrabold text-emerald-700">{st.percent}%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{st.title}</p>

              <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${st.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 mt-1">
                <span>Completed: <strong className="text-slate-800">{st.completed}</strong></span>
                <span>Remaining: <strong className="text-slate-800">{st.remaining}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Milestone Item List */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span className="font-bold text-slate-700">Milestone Audit Log:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveStageFilter('all')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  activeStageFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                All Stages
              </button>
              {roadmapMilestones.stages.map(st => (
                <button
                  key={st.stageNumber}
                  onClick={() => setActiveStageFilter(st.stageNumber)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    activeStageFilter === st.stageNumber ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Stage {st.stageNumber}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {filteredMilestones.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 ${
                  m.completed ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded uppercase">
                      Stage {m.stage}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{m.skill}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                </div>
                <div className="shrink-0 mt-0.5">
                  {m.completed ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Skill Acquisition Progress & Priority Gap Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Acquired vs Remaining Skills Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" /> Skill Acquisition Status
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Verified technical competencies vs remaining skill gaps to acquire for {targetRole}.
              </p>
            </div>
            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              {skillAcquisition.acquisitionRate}%
            </span>
          </div>

          <div className="space-y-3">
            {/* Acquired Skills */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Acquired Competencies ({skillAcquisition.acquiredSkillsCount})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillAcquisition.acquiredSkills.map(s => (
                  <span
                    key={s.skill}
                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    {s.skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Remaining Skills */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Remaining Competencies to Acquire ({skillAcquisition.remainingSkillsCount})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillAcquisition.remainingSkills.map(g => (
                  <span
                    key={g.skill}
                    className={`px-2.5 py-1 border text-xs font-medium rounded-lg flex items-center gap-1 ${
                      g.priority === 'high'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{g.skill}</span>
                    <span className="text-[10px] opacity-75 font-mono">({g.estimatedHours}h)</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Practical Project Completion & Portfolio Evidence Sources */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-purple-600" /> Practical Project Deliverables & Evidence
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Proof-of-work deliverables verifying candidate production competence.
              </p>
            </div>
            <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              {practicalProjects.completedCount} / {practicalProjects.totalProjects} Complete
            </span>
          </div>

          {/* Project List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {practicalProjects.projectsList.map((p, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">{p.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Target: <strong>{p.targetSkill}</strong></span>
                    <span>·</span>
                    <span>{p.difficulty}</span>
                    <span>·</span>
                    <span>{p.estimatedHours} hrs</span>
                  </div>
                </div>

                <div className="shrink-0 mt-0.5">
                  {p.status === 'completed' ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : p.status === 'in_progress' ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      In Progress
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Evidence Sources Audit */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
            {portfolioEvidence.evidenceSources.map(es => (
              <div key={es.source} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-600 truncate">{es.source}</span>
                {es.verified ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5 shrink-0 ml-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium shrink-0 ml-1">Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTrackingView;
