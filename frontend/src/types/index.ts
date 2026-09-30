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
  analysisResult?: any;
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
  jobTitle: string;
  company?: string;
  jobDescription: string;
  requiredSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  matchResult?: {
    matchPercentage: number;
    breakdown?: Record<string, number>;
    recommendationsSummary?: string;
  };
  createdAt: string;
}

export interface SkillEvidenceRecord {
  _id: string;
  skill: string;
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

export interface CareerRoadmapRecord {
  _id: string;
  targetRole: string;
  stages: Array<{
    order: number;
    title: string;
    description?: string;
    durationWeeks?: number;
    status: 'pending' | 'in_progress' | 'completed';
    tasks: Array<{ id: string; title: string; completed: boolean }>;
  }>;
  skills: string[];
  recommendedProjects: string[];
  progress: number;
}
