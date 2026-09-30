import mongoose, { Schema, Document } from 'mongoose';

export interface IJobAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  jobTitle: string;
  company?: string;
  jobDescription: string;
  requiredSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  matchResult?: {
    matchPercentage?: number;
    breakdown?: Record<string, number>;
    recommendationsSummary?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobAnalysisSchema = new Schema<IJobAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    jobDescription: { type: String, required: true },
    requiredSkills: [{ type: String }],
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    partialSkills: [{ type: String }],
    matchResult: {
      matchPercentage: Number,
      breakdown: Schema.Types.Mixed,
      recommendationsSummary: String
    }
  },
  { timestamps: true }
);

export const JobAnalysis = mongoose.model<IJobAnalysis>('JobAnalysis', JobAnalysisSchema);
