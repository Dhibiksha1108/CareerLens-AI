export interface User {
  _id: string;
  name: string;
  email: string;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
    gpa?: string;
  }>;
  targetRoles: string[];
  skills: Array<{
    name: string;
    category?: string;
    proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
  profileInfo?: {
    bio?: string;
    avatar?: string;
    location?: string;
    websiteUrl?: string;
    githubUsername?: string;
    linkedinUrl?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export type SkillCategory =
  | 'Programming'
  | 'Database'
  | 'Web'
  | 'Data/ML'
  | 'Cloud/Tools'
  | 'Soft Skills';

export interface ExtractedSkill {
  name: string;
  category: SkillCategory;
  confidence: number;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  evidenceStrength: 'low' | 'medium' | 'high' | 'verified';
  frequency: number;
  snippets: string[];
  tfidfScore: number;
  cosineSimilarity: number;
}

export interface NlpAnalysisResult {
  resumeId: string;
  originalName: string;
  extractedSkills: ExtractedSkill[];
  categories: Record<SkillCategory, ExtractedSkill[]>;
  categoryDistribution: Record<SkillCategory, number>;
  topKeywords: { term: string; score: number }[];
  statistics: {
    totalWords: number;
    uniqueWords: number;
    totalSkillsFound: number;
    technicalSkillsCount: number;
    softSkillsCount: number;
    topCategory: SkillCategory | 'None';
    profileCompletenessScore: number;
  };
  summary: string;
  analyzedAt: string;
}

export interface ResumeRecord {
  _id: string;
  userId: string;
  fileInfo: {
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  };
  extractedText?: string;
  skills: string[];
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  analysisResult?: NlpAnalysisResult;
  createdAt: string;
}

export interface ProjectRecord {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  technologies: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  screenshots?: string[];
  createdAt: string;
}

export interface JobAnalysisRecord {
  _id: string;
  userId: string;
  resumeId?: string;
  jobTitle: string;
  company?: string;
  jobDescription: string;
  requiredSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  extractedJobSkills?: Array<{
    name: string;
    category: SkillCategory | string;
    importance: 'required' | 'preferred';
  }>;
  matchedSkillsDetails?: Array<{
    skill: string;
    category: SkillCategory | string;
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
    evidenceStrength: 'low' | 'medium' | 'high' | 'verified';
    snippets: string[];
    tfidfScore?: number;
    cosineSimilarity?: number;
  }>;
  partialSkills?: Array<{
    jobSkill: string;
    candidateSkill: string;
    category: string;
    relationType: string;
    reason: string;
  }>;
  compatibilityBreakdown?: {
    skillMatchPercentage: number;
    textCosineSimilarity: number;
    finalWeightedScore: number;
    requiredSkillsCount: number;
    matchedSkillsCount: number;
    partialSkillsCount: number;
    missingSkillsCount: number;
  };
  explanation?: string;
  recommendations?: string[];
  matchResult?: {
    matchPercentage: number;
    breakdown?: Record<string, any>;
    recommendationsSummary?: string;
  };
  createdAt: string;
}

export interface SkillEvidenceRecord {
  _id: string;
  skill: string;
  category?: string;
  confidence?: number;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced';
  resumeEvidence: any[];
  githubEvidence: any[];
  projectEvidence: any[];
  portfolioEvidence: any[];
  certificationEvidence: any[];
  evidenceStrength: 'low' | 'medium' | 'high' | 'verified';
}

export interface RecommendationRecord {
  _id: string;
  type: 'project' | 'skill_acquisition' | 'resume_improvement' | 'course' | 'github_enhancement';
  title: string;
  description: string;
  relatedSkill?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

export interface IPracticalProject {
  title: string;
  targetSkill: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  portfolioEvidence: string;
  estimatedHours: number;
  keyDeliverables: string[];
  architectureOverview?: string;
}

export interface IRoadmapMilestone {
  description: string;
  completed: boolean;
  skillTarget: string;
  estimatedHours?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
}

export interface IRoadmapStage {
  stage: number;
  stageLevel: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  duration: string;
  estimatedHours: number;
  prerequisites: string[];
  skills: string[];
  milestones: IRoadmapMilestone[];
  recommendedProject: {
    title: string;
    description: string;
    keyDeliverables: string[];
    targetSkill?: string;
    portfolioEvidence?: string;
  };
  practicalProjects?: IPracticalProject[];
}

export interface ISkillGap {
  skill: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  demandFrequency: number;
  recommendedLearningArea: string;
  estimatedHours: number;
  suggestedProjects: string[];
  practicalProjects?: IPracticalProject[];
  learningResources: Array<{
    title: string;
    type: string;
    level: string;
    description: string;
  }>;
}

export interface CareerRecommendationRecord {
  _id: string;
  userId: string;
  targetRole: string;
  recommendedRoles: Array<{
    role: string;
    matchPercentage: number;
    matchedSkills: string[];
    missingSkills: string[];
    reason: string;
    skillGaps?: ISkillGap[];
    roadmap?: IRoadmapStage[];
    practicalProjects?: IPracticalProject[];
  }>;
  skillGaps: ISkillGap[];
  roadmap: IRoadmapStage[];
  overallReadiness: number;
  sourceJobAnalysisId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISimulatedCertification {
  id: string;
  name: string;
  issuer: string;
  relatedSkills: string[];
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ISimulatedPortfolioEvidence {
  id: string;
  title: string;
  type: 'github_repo' | 'live_deployment' | 'technical_case_study' | 'benchmark_report';
  targetSkill: string;
  estimatedHours: number;
  description: string;
  evidenceValue: string;
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
}
