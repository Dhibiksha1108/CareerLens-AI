import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeFileInfo {
  originalName: string;
  mimeType: string;
  size: number;
  filePath?: string;
  uploadedAt: Date;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileInfo: IResumeFileInfo;
  extractedText?: string;
  skills: string[];
  education: Record<string, any>[];
  experience: Record<string, any>[];
  projects: Record<string, any>[];
  certifications: Record<string, any>[];
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  analysisResult?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileInfo: {
      originalName: { type: String, required: true },
      mimeType: String,
      size: Number,
      filePath: String,
      uploadedAt: { type: Date, default: Date.now }
    },
    extractedText: String,
    skills: [{ type: String }],
    education: [Schema.Types.Mixed],
    experience: [Schema.Types.Mixed],
    projects: [Schema.Types.Mixed],
    certifications: [Schema.Types.Mixed],
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    analysisResult: Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);
