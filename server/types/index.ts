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
