import React from 'react';
import { Lightbulb, BookOpen, FileCode, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface NextStepItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconBg: string;
  link: string;
}

const defaultSteps: NextStepItem[] = [
  {
    id: '1',
    title: 'Build a Python Data Analysis Project',
    description: 'Strengthen your Python and data analysis skills.',
    icon: Lightbulb,
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    link: '/projects'
  },
  {
    id: '2',
    title: 'Learn Machine Learning Basics',
    description: 'This skill is required for your target role.',
    icon: BookOpen,
    iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
    link: '/recommendations'
  },
  {
    id: '3',
    title: 'Improve Project Documentation',
    description: 'Add better README files and live demos.',
    icon: FileCode,
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    link: '/projects'
  }
];

export const RecommendedNextSteps: React.FC<{ steps?: NextStepItem[] }> = ({
  steps = defaultSteps
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recommended Next Steps
          </h2>
          <Link
            to="/recommendations"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                to={step.link}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl ${step.iconBg} border flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
