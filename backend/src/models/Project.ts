import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectDocumentation {
  readmeContent?: string;
  architectureNotes?: string;
  hasApiDocs?: boolean;
}

export interface IProjectTesting {
  unitTests?: boolean;
  testCoveragePercent?: number;
  framework?: string;
}

export interface IProjectDeployment {
  platform?: string;
  status?: string;
  ciCdPipeline?: boolean;
}

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  technologies: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  screenshots: string[];
  documentation?: IProjectDocumentation;
  testing?: IProjectTesting;
  deployment?: IProjectDeployment;
  analysisResult?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: String,
    technologies: [{ type: String, trim: true }],
    repositoryUrl: String,
    liveUrl: String,
    screenshots: [{ type: String }],
    documentation: {
      readmeContent: String,
      architectureNotes: String,
      hasApiDocs: Boolean
    },
    testing: {
      unitTests: Boolean,
      testCoveragePercent: Number,
      framework: String
    },
    deployment: {
      platform: String,
      status: String,
      ciCdPipeline: Boolean
    },
    analysisResult: Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
