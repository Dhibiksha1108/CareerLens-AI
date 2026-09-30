import mongoose, { Schema, Document } from 'mongoose';

export interface IFileInfo {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileInfo: IFileInfo;
  extractedText: string;
  skills: string[];
  education: any[];
  experience: any[];
  projects: any[];
  certifications: any[];
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  analysisResult: any;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileInfo: {
      originalName: { type: String, required: true },
      mimeType: { type: String, default: 'text/plain' },
      size: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: Date.now }
    },
    extractedText: { type: String, default: '' },
    skills: { type: [String], default: [] },
    education: [{ type: Schema.Types.Mixed, default: {} }],
    experience: [{ type: Schema.Types.Mixed, default: {} }],
    projects: [{ type: Schema.Types.Mixed, default: {} }],
    certifications: [{ type: Schema.Types.Mixed, default: {} }],
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    analysisResult: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);
