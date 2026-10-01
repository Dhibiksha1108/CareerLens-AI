import React, { useState } from 'react';
import { Map, CheckCircle2, Clock, Sparkles, ArrowRight } from 'lucide-react';

export const CareerRoadmapPage: React.FC = () => {
  const [activeStage, setActiveStage] = useState(1);

  const stages = [
    {
      order: 1,
      title: 'Phase 1: Core Fundamentals & Systems Architecture',
      duration: '4 Weeks',
      status: 'completed',
      tasks: [
        { title: 'TypeScript static typing, generics, and strict compiler configs', done: true },
        { title: 'Modern React component lifecycle, custom hooks, and virtual DOM', done: true },
        { title: 'Node.js event loop, streams, and Express RESTful API routing', done: true },
        { title: 'PostgreSQL relational schemas, indexing, and transactional ACID guarantees', done: true }
      ]
    },
    {
      order: 2,
      title: 'Phase 2: Advanced Microservices & Cloud Infrastructure',
      duration: '6 Weeks',
      status: 'in_progress',
      tasks: [
        { title: 'Docker multi-stage container builds and compose networking', done: true },
        { title: 'Continuous Integration / Continuous Delivery (CI/CD) pipelines', done: true },
        { title: 'Kubernetes cluster deployment, pod autoscaling, and ingress routing', done: false },
        { title: 'AWS Cloud operational services: EC2, S3, RDS, and IAM permissions', done: false }
      ]
    },
    {
      order: 3,
      title: 'Phase 3: Production Scale & Intelligent Services',
      duration: '6 Weeks',
      status: 'pending',
      tasks: [
        { title: 'Redis in-memory caching layers and distributed pub/sub queues', done: false },
        { title: 'System design for high-concurrency 10k+ QPS workloads', done: false },
        { title: 'Natural language processing & semantic search integration', done: false }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-600" />
          Career Progression Roadmap
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Target role progression milestones structured to guide your journey from foundational engineering to senior full-stack mastery.
        </p>
      </div>

      <div className="space-y-4">
        {stages.map(stage => {
          const isCompleted = stage.status === 'completed';
          const isInProgress = stage.status === 'in_progress';

          return (
            <div
              key={stage.order}
              className={`p-6 rounded-2xl bg-white border shadow-2xs space-y-4 transition ${
                isInProgress ? 'border-emerald-300 ring-1 ring-emerald-300' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isInProgress
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.order}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">{stage.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {stage.duration}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isInProgress
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Upcoming'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {stage.tasks.map((task, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      task.done
                        ? 'bg-emerald-50/40 border-emerald-200/70 text-slate-800'
                        : 'bg-slate-50 border-slate-200/60 text-slate-600'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        task.done ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    <span>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
