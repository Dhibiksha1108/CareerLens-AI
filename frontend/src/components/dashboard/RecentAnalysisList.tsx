import React from 'react';
import { FileText, GitBranch, FolderCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface RecentAnalysisItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  icon: any;
  iconBg: string;
  link: string;
}

const defaultItems: RecentAnalysisItem[] = [
  {
    id: '1',
    title: 'Resume Analysis',
    subtitle: 'Identified 5 improvement points',
    timestamp: '2 hours ago',
    icon: FileText,
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    link: '/resume'
  },
  {
    id: '2',
    title: 'GitHub Analysis',
    subtitle: 'Analyzed 8 repositories',
    timestamp: '5 hours ago',
    icon: GitBranch,
    iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
    link: '/github'
  },
  {
    id: '3',
    title: 'Project Quality',
    subtitle: '2 projects need improvement',
    timestamp: '1 day ago',
    icon: FolderCheck,
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    link: '/projects'
  }
];

export const RecentAnalysisList: React.FC<{ items?: RecentAnalysisItem[] }> = ({
  items = defaultItems
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Analysis
          </h2>
          <Link
            to="/resume"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl ${item.iconBg} border flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    {item.timestamp}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
