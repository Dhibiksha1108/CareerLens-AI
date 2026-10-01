import mongoose, { Schema, Document } from 'mongoose';

export interface IJobAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId?: mongoose.Types.ObjectId;
  jobTitle: string;
  company?: string;
  jobDescription: string;
  requiredSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  extractedJobSkills?: Array<{
    name: string;
    category: string;
    importance: 'required' | 'preferred';
  }>;
  matchedSkillsDetails?: Array<{
    skill: string;
    category: string;
    proficiencyLevel: string;
    evidenceStrength: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const JobAnalysisSchema = new Schema<IJobAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume' },
    jobTitle: { type: String, required: true },
    company: { type: String, default: '' },
    jobDescription: { type: String, required: true },
    requiredSkills: [{ type: String }],
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    extractedJobSkills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'General' },
        importance: { type: String, enum: ['required', 'preferred'], default: 'required' }
      }
    ],
    matchedSkillsDetails: [
      {
        skill: { type: String, required: true },
        category: { type: String, default: 'Technical' },
        proficiencyLevel: { type: String, default: 'intermediate' },
        evidenceStrength: { type: String, default: 'medium' },
        snippets: [{ type: String }],
        tfidfScore: { type: Number, default: 0 },
        cosineSimilarity: { type: Number, default: 0 }
      }
    ],
    partialSkills: [
      {
        jobSkill: { type: String, required: true },
        candidateSkill: { type: String, required: true },
        category: { type: String, default: 'General' },
        relationType: { type: String, default: 'Related Technology' },
        reason: { type: String, default: '' }
      }
    ],
    compatibilityBreakdown: {
      skillMatchPercentage: { type: Number, default: 0 },
      textCosineSimilarity: { type: Number, default: 0 },
      finalWeightedScore: { type: Number, default: 0 },
      requiredSkillsCount: { type: Number, default: 0 },
      matchedSkillsCount: { type: Number, default: 0 },
      partialSkillsCount: { type: Number, default: 0 },
      missingSkillsCount: { type: Number, default: 0 }
    },
    explanation: { type: String, default: '' },
    recommendations: [{ type: String }],
    matchResult: {
      matchPercentage: { type: Number, default: 0 },
      breakdown: { type: Schema.Types.Mixed },
      recommendationsSummary: { type: String }
    }
  },
  { timestamps: true }
);

export const JobAnalysis = mongoose.model<IJobAnalysis>('JobAnalysis', JobAnalysisSchema);
