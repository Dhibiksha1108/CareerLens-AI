import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchResult {
  matchPercentage: number;
  breakdown?: Record<string, number>;
  recommendationsSummary?: string;
}

export interface IJobAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  jobTitle: string;
  company?: string;
  jobDescription: string;
  requiredSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  matchResult: IMatchResult;
  createdAt: Date;
  updatedAt: Date;
}

const JobAnalysisSchema = new Schema<IJobAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    jobDescription: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    matchingSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    partialSkills: { type: [String], default: [] },
    matchResult: {
      matchPercentage: { type: Number, default: 0 },
      breakdown: { type: Schema.Types.Mixed },
      recommendationsSummary: { type: String }
    }
  },
  { timestamps: true }
);

export const JobAnalysis = mongoose.model<IJobAnalysis>('JobAnalysis', JobAnalysisSchema);
