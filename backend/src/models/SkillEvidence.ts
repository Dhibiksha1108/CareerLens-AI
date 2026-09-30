import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillEvidence extends Document {
  userId: mongoose.Types.ObjectId;
  skill: string;
  resumeEvidence: { textSnippet?: string; sourceSection?: string }[];
  githubEvidence: { repoName?: string; language?: string; commitCount?: number }[];
  projectEvidence: { projectId?: mongoose.Types.ObjectId; projectTitle?: string; usageDescription?: string }[];
  portfolioEvidence: { url?: string; snippet?: string }[];
  certificationEvidence: { certificateName?: string; issuer?: string }[];
  evidenceStrength: 'low' | 'medium' | 'high' | 'verified';
  createdAt: Date;
  updatedAt: Date;
}

const SkillEvidenceSchema = new Schema<ISkillEvidence>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skill: { type: String, required: true, trim: true },
    resumeEvidence: [{ textSnippet: String, sourceSection: String }],
    githubEvidence: [{ repoName: String, language: String, commitCount: Number }],
    projectEvidence: [{ projectId: Schema.Types.ObjectId, projectTitle: String, usageDescription: String }],
    portfolioEvidence: [{ url: String, snippet: String }],
    certificationEvidence: [{ certificateName: String, issuer: String }],
    evidenceStrength: {
      type: String,
      enum: ['low', 'medium', 'high', 'verified'],
      default: 'low'
    }
  },
  { timestamps: true }
);

export const SkillEvidence = mongoose.model<ISkillEvidence>('SkillEvidence', SkillEvidenceSchema);
