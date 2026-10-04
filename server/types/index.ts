import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface IAtsSectionAnalysis {
  name: string;
  found: boolean;
  status: 'optimal' | 'warning' | 'missing';
  feedback: string;
}

export interface IAtsFormattingRisk {
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
}

export interface IBulletPointAnalysis {
  totalBullets: number;
  strongBullets: number;
  weakBullets: number;
  actionVerbsCount: number;
  metricsCount: number;
  score: number;
  sampleStrengths: string[];
  sampleWeaknesses: string[];
  recommendation: string;
}

export interface IAtsAnalysisResult {
  resumeId: string;
  targetRole: string;
  analyzedAt: string;
  atsScore: number;
  keywordMatchPercentage: number;
  relevantSkillsDetected: string[];
  missingKeywords: Array<{
    keyword: string;
    priority: 'high' | 'medium' | 'low';
    frequencyInRole: number;
    category: string;
  }>;
  sectionsAnalysis: IAtsSectionAnalysis[];
  formattingRisks: IAtsFormattingRisk[];
  readabilityScore: number;
  readabilityLevel: 'Very Easy' | 'Easy' | 'Fairly Easy' | 'Standard' | 'Fairly Difficult' | 'Difficult';
  contentClarityScore: number;
  contentClaritySummary: string;
  bulletQuality: IBulletPointAnalysis;
  repetitionAnalysis: {
    overusedWords: Array<{ word: string; count: number }>;
    fillerPhrasesFound: string[];
    repetitionScore: number;
  };
  strengths: string[];
  improvementSuggestions: Array<{
    category: 'Keywords' | 'Formatting' | 'Content' | 'Impact' | 'Sections';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionableFix: string;
  }>;
}

export interface IDomainBenchmark {
  domain: string;
  category: string;
  candidateScore: number;
  industryAverage: number;
  targetExpectation: number;
  percentile: string;
  status: 'exceeds' | 'meets' | 'below';
  verifiedSkills: string[];
  missingSkills: string[];
}

export interface IMeetingSkill {
  skill: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced';
  evidenceStrength: 'low' | 'medium' | 'high' | 'verified';
  confidence: number;
  evidenceType: string;
}

export interface IPortfolioGapItem {
  targetSkill: string;
  recommendedProjectTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  portfolioEvidence: string;
  estimatedHours: number;
  status: 'completed' | 'in_progress' | 'missing';
  keyDeliverables: string[];
}

export interface ICareerBenchmarkResult {
  targetRole: string;
  targetRoleDescription: string;
  overallReadiness: number;
  industryAverageReadiness: number;
  candidatePercentile: string;
  readinessLevel: 'Job Ready' | 'Competitive' | 'Developing';
  totalExpectedSkills: number;
  meetingSkillsCount: number;
  missingSkillsCount: number;
  meetingSkills: IMeetingSkill[];
  missingSkills: Array<{
    skill: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    demandFrequency: number;
    recommendedLearningArea: string;
    estimatedHours: number;
    suggestedProject: string;
  }>;
  domainBenchmarks: IDomainBenchmark[];
  portfolioGapAnalysis: {
    candidateProjectCount: number;
    expectedProjectCount: number;
    portfolioReadinessScore: number;
    gaps: IPortfolioGapItem[];
  };
  experienceGapAnalysis: {
    detectedYears: number;
    expectedLevel: string;
    standing: 'Strong' | 'Adequate' | 'Emerging';
    feedback: string;
  };
  roadmapProgress: {
    totalMilestones: number;
    completedMilestones: number;
    percentComplete: number;
    activeStageTitle: string;
  };
  clearAreasToImprove: Array<{
    area: string;
    category: 'Skill Gap' | 'Portfolio Project' | 'Roadmap Milestone' | 'Experience';
    priority: 'high' | 'medium' | 'low';
    title: string;
    impactScore: string;
    actionableStep: string;
    suggestedActionLink?: string;
  }>;
}

export interface IUnifiedDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    selectedTargetRole: string;
    availableRoles: string[];
  };
  profileStrength: {
    overallScore: number;
    readinessLevel: 'Job Ready' | 'Competitive' | 'Developing';
    percentileStanding: string;
    strengths: string[];
    weaknesses: string[];
  };
  resumeAnalysis: {
    hasResume: boolean;
    resumeId?: string;
    originalName?: string;
    atsScore: number;
    readabilityScore: number;
    readabilityLevel: string;
    formattingRisksCount: number;
    keySuggestions: Array<{
      category: string;
      priority: 'high' | 'medium' | 'low';
      title: string;
      actionableFix: string;
    }>;
  };
  skillMatchesAndGaps: {
    totalSkillsFound: number;
    matchedSkills: string[];
    missingSkills: Array<{
      skill: string;
      priority: 'high' | 'medium' | 'low';
      category: string;
      estimatedHours: number;
    }>;
    gapSummary: {
      highCount: number;
      mediumCount: number;
      lowCount: number;
    };
  };
  jobCompatibility: {
    targetRole: string;
    compatibilityScore: number;
    matchingRequirements: string[];
    missingRequirements: string[];
    compatibilitySummary: string;
  };
  careerRoadmapProgress: {
    currentStageNumber: number;
    currentStageTitle: string;
    totalStages: number;
    totalMilestones: number;
    completedMilestones: number;
    remainingMilestones: number;
    percentComplete: number;
    nextMilestone: {
      description: string;
      skillTarget: string;
    } | null;
  };
  practicalProjects: {
    totalProjectsCount: number;
    completedProjectsCount: number;
    portfolioEvidenceProgress: number;
    recommendedProjects: Array<{
      title: string;
      targetSkill: string;
      category: string;
      difficulty: string;
      portfolioEvidence: string;
      status: 'completed' | 'in_progress' | 'missing';
    }>;
  };
  portfolioImprovement: {
    currentScore: number;
    potentialScore: number;
    projectedUplift: number;
    topSimulationLevers: Array<{
      type: 'skill' | 'project' | 'certification';
      title: string;
      estimatedGain: number;
    }>;
  };
  careerBenchmarking: {
    readinessScore: number;
    industryAverage: number;
    candidatePercentile: string;
    standing: 'Strong' | 'Adequate' | 'Emerging';
    topCompetencyGaps: Array<{
      domain: string;
      candidateScore: number;
      industryAverage: number;
      percentile: string;
      status: 'exceeds' | 'meets' | 'below';
    }>;
  };
}

export interface ICareerAnalyticsData {
  targetRole: string;
  availableRoles: string[];
  readinessSummary: {
    overallReadiness: number;
    industryBaseline: number;
    potentialUplift: number;
    candidatePercentile: string;
    readinessTrend: Array<{ stage: string; score: number }>;
  };
  jobCompatibilityAnalytics: {
    selectedRoleMatch: number;
    roleComparison: Array<{
      role: string;
      matchPercentage: number;
      matchedCount: number;
      missingCount: number;
      isSelected: boolean;
    }>;
  };
  skillGapDistribution: {
    priorityDistribution: Array<{
      priority: 'High' | 'Medium' | 'Low';
      count: number;
      totalHours: number;
      color: string;
    }>;
    categoryDistribution: Array<{
      category: string;
      count: number;
      totalHours: number;
    }>;
  };
  learningRoadmapAnalytics: {
    stages: Array<{
      stageNumber: number;
      title: string;
      totalMilestones: number;
      completedMilestones: number;
      percentComplete: number;
    }>;
    overallMilestoneProgress: {
      total: number;
      completed: number;
      remaining: number;
      percent: number;
    };
  };
  projectPortfolioProgress: {
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    missingProjects: number;
    portfolioReadinessScore: number;
  };
  careerBenchmarkComparison: {
    readinessScore: number;
    industryAverage: number;
    domainComparisons: Array<{
      domain: string;
      candidateScore: number;
      industryAverage: number;
      targetExpectation: number;
      percentile: string;
      status: 'exceeds' | 'meets' | 'below';
    }>;
  };
  skillChartsData: {
    verifiedVsMissing: {
      verifiedCount: number;
      missingCount: number;
      totalCount: number;
      verifiedPercent: number;
      missingPercent: number;
    };
    priorityBreakdown: Array<{
      name: string;
      value: number;
      fill: string;
    }>;
    categoryCoverage: Array<{
      category: string;
      verifiedCount: number;
      missingCount: number;
      totalCount: number;
      coveragePercent: number;
    }>;
    roleSkillCoverage: Array<{
      skill: string;
      status: 'verified' | 'missing';
      priority: 'high' | 'medium' | 'low';
      category: string;
      confidence: number;
      proficiency: string;
    }>;
    milestoneSkillProgress: Array<{
      skill: string;
      completed: boolean;
      stage: number;
      description: string;
    }>;
  };
  readinessVisualization: {
    overallScore: number;
    targetRoleThreshold: number;
    gapToTargetThreshold: number;
    readinessLevel: 'Job Ready' | 'Competitive' | 'Developing';
    candidatePercentile: string;
    strengthsVsGaps: {
      strengthsCount: number;
      gapsCount: number;
      strengthsRatio: number;
      strengths: Array<{ skill: string; category: string; proficiency: string }>;
      gaps: Array<{ skill: string; category: string; priority: 'high' | 'medium' | 'low'; estimatedHours: number }>;
    };
    currentVsTargetComparison: Array<{
      metric: string;
      candidateScore: number;
      targetExpectation: number;
      industryAverage: number;
    }>;
    industryBenchmarkSummary: {
      candidateAverage: number;
      industryAverage: number;
      targetAverage: number;
      domains: Array<{
        domain: string;
        candidateScore: number;
        industryAverage: number;
        targetExpectation: number;
        status: 'exceeds' | 'meets' | 'below';
      }>;
    };
    improvementPotential: {
      currentReadiness: number;
      projectedReadiness: number;
      potentialGain: number;
      levers: Array<{ title: string; category: string; gainPercent: number }>;
    };
    roleReadinessComparison: Array<{
      role: string;
      readinessScore: number;
      matchPercentage: number;
      isSelected: boolean;
      status: string;
    }>;
  };
}
