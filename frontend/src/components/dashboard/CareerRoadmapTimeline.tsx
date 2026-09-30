import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface RoadmapStep {
  order: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'active' | 'pending';
}

const defaultRoadmapSteps: RoadmapStep[] = [
  {
    order: 1,
    title: 'Build Core Skills',
    subtitle: 'SQL, Python, Data Visualization',
    status: 'completed'
  },
  {
    order: 2,
    title: 'Complete Recommended Projects',
    subtitle: '2 projects suggested',
    status: 'active'
  },
  {
    order: 3,
    title: 'Fill Skill Gaps',
    subtitle: 'Machine Learning, Statistics',
    status: 'pending'
  },
  {
    order: 4,
    title: 'Apply for Target Roles',
    subtitle: 'Data Analyst / Business Analyst',
    status: 'pending'
  }
];

export const CareerRoadmapTimeline: React.FC<{ steps?: RoadmapStep[] }> = ({
  steps = defaultRoadmapSteps
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between relative overflow-hidden h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Career Roadmap
          </h2>
          <Link
            to="/roadmap"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            View Full Roadmap →
          </Link>
        </div>

        {/* Vertical Stepper Timeline */}
        <div className="relative pl-2 my-2 space-y-4">
          {/* Vertical connecting line */}
          <div className="absolute left-[17px] top-3 bottom-5 w-0.5 bg-slate-200 z-0" />

          {steps.map((step) => {
            return (
              <div key={step.order} className="flex items-start space-x-3.5 relative z-10">
                {/* Stage Circle Indicator */}
                {step.status === 'completed' ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs shrink-0 ring-4 ring-white">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 ring-4 ring-emerald-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-white">
                    {step.order}
                  </div>
                )}

                {/* Step Text */}
                <div className="leading-tight pt-0.5">
                  <h3 className={`text-xs font-bold ${step.status === 'completed' ? 'text-slate-800' : step.status === 'active' ? 'text-emerald-800 font-extrabold' : 'text-slate-700'}`}>
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mountain Trail Graphic Decoration */}
      <div className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none opacity-20">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-emerald-600">
          <path d="M10 90 Q 40 40, 70 60 T 90 20" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
          <polygon points="90,15 95,20 90,25" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};
