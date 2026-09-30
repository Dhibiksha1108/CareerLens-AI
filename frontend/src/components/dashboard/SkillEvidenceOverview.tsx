import React from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, Code2, Database, BarChart2, Cpu, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SkillEvidenceItem {
  skill: string;
  percentage: number;
  color: string;
  barColor: string;
  icon: any;
  evidence: {
    resume: 'check' | 'dash' | 'dot';
    github: 'check' | 'dash' | 'dot';
    projects: 'check' | 'dash' | 'dot';
    jobMatch: 'check' | 'dash' | 'dot';
  };
}

const defaultSkillItems: SkillEvidenceItem[] = [
  {
    skill: 'Python',
    percentage: 92,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    barColor: 'bg-emerald-500',
    icon: Code2,
    evidence: { resume: 'check', github: 'check', projects: 'check', jobMatch: 'check' }
  },
  {
    skill: 'SQL',
    percentage: 85,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
    barColor: 'bg-sky-500',
    icon: Database,
    evidence: { resume: 'check', github: 'check', projects: 'dash', jobMatch: 'check' }
  },
  {
    skill: 'Power BI',
    percentage: 78,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    barColor: 'bg-amber-500',
    icon: BarChart2,
    evidence: { resume: 'check', github: 'dash', projects: 'check', jobMatch: 'check' }
  },
  {
    skill: 'Machine Learning',
    percentage: 60,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    barColor: 'bg-purple-500',
    icon: Cpu,
    evidence: { resume: 'dot', github: 'dash', projects: 'dot', jobMatch: 'dash' }
  },
  {
    skill: 'Data Visualization',
    percentage: 70,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    barColor: 'bg-rose-500',
    icon: PieChart,
    evidence: { resume: 'dash', github: 'check', projects: 'dot', jobMatch: 'dot' }
  }
];

export const SkillEvidenceOverview: React.FC<{ items?: SkillEvidenceItem[] }> = ({
  items = defaultSkillItems
}) => {
  const renderBadge = (status: 'check' | 'dash' | 'dot') => {
    if (status === 'check') {
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      );
    }
    if (status === 'dash') {
      return (
        <div className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-2xs">
          <Minus className="w-3 h-3 stroke-[3]" />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      </div>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Skill Evidence Overview
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-source evidence verification across profiles
            </p>
          </div>
          <Link
            to="/skills"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            View All →
          </Link>
        </div>

        {/* Evidence Column Headers */}
        <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 mb-3 px-2">
          <div className="col-span-6">Skill Name & Proficiency</div>
          <div className="col-span-6 grid grid-cols-4 text-center">
            <span>Resume</span>
            <span>GitHub</span>
            <span>Projects</span>
            <span>Job Match</span>
          </div>
        </div>

        {/* Skill Evidence Rows */}
        <div className="space-y-3.5">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.skill}
                className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors"
              >
                {/* Skill Name & Animated Bar */}
                <div className="col-span-6 pr-4">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-800 mb-1.5">
                    <span className="flex items-center space-x-2">
                      <div className={`p-1 rounded-lg ${item.color} border`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800">{item.skill}</span>
                    </span>
                    <span className="font-bold text-slate-600">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${item.barColor} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Evidence Column Checkmarks */}
                <div className="col-span-6 grid grid-cols-4 justify-items-center">
                  {renderBadge(item.evidence.resume)}
                  {renderBadge(item.evidence.github)}
                  {renderBadge(item.evidence.projects)}
                  {renderBadge(item.evidence.jobMatch)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
