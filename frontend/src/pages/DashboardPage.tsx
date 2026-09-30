import React from 'react';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { MetricCard } from '../components/dashboard/MetricCard';
import { SkillEvidenceOverview } from '../components/dashboard/SkillEvidenceOverview';
import { JobMatchCard } from '../components/dashboard/JobMatchCard';
import { RecentAnalysisList } from '../components/dashboard/RecentAnalysisList';
import { RecommendedNextSteps } from '../components/dashboard/RecommendedNextSteps';
import { CareerRoadmapTimeline } from '../components/dashboard/CareerRoadmapTimeline';
import { BottomActionBanner } from '../components/dashboard/BottomActionBanner';
import { FolderGit2, Layers, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Hero Greeting Banner */}
      <HeroBanner />

      {/* 2. Four Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Career Readiness"
          value="78%"
          subtitle="↑ 12% from last analysis"
          variant="green"
          progressPercentage={78}
        />
        <MetricCard
          title="Projects Analyzed"
          value={6}
          subtitle="2 strong projects"
          icon={FolderGit2}
          variant="blue"
        />
        <MetricCard
          title="Skills Identified"
          value={12}
          subtitle="4 skill gaps"
          icon={Layers}
          variant="purple"
        />
        <MetricCard
          title="Resume Score"
          value="85%"
          subtitle="Identified 5 improvement points"
          icon={FileText}
          variant="orange"
          actionText="View details →"
          onAction={() => navigate('/resume')}
        />
      </div>

      {/* 3. Skill Evidence & Job Match Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkillEvidenceOverview />
        </div>
        <div className="lg:col-span-1">
          <JobMatchCard />
        </div>
      </div>

      {/* 4. Recent Analysis, Next Steps, and Career Roadmap Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecentAnalysisList />
        <RecommendedNextSteps />
        <CareerRoadmapTimeline />
      </div>

      {/* 5. Bottom Callout Action Banner */}
      <BottomActionBanner />
    </div>
  );
};
