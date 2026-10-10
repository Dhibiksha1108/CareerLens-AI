import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  technologies: string[];
  repositoryUrl?: string;
  liveDemoUrl?: string;
  liveUrl?: string;
  screenshots?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    technologies: [{ type: String, trim: true }],
    repositoryUrl: { type: String, trim: true, default: '' },
    liveDemoUrl: { type: String, trim: true, default: '' },
    liveUrl: { type: String, trim: true, default: '' },
    screenshots: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
