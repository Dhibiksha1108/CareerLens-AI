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
  };
}

export interface ISkillGap {
  skill: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  demandFrequency: number;
  recommendedLearningArea: string;
  estimatedHours: number;
  suggestedProjects: string[];
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
  }>;
  skillGaps: ISkillGap[];
  roadmap: IRoadmapStage[];
  overallReadiness: number;
  sourceJobAnalysisId?: string;
  createdAt: string;
  updatedAt: string;
}
