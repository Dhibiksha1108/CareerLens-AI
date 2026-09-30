import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmapTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export interface IRoadmapStage {
  order: number;
  title: string;
  description?: string;
  durationWeeks?: number;
  status: 'pending' | 'in_progress' | 'completed';
  tasks: IRoadmapTask[];
}

export interface ICareerRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  stages: IRoadmapStage[];
  skills: string[];
  recommendedProjects: string[];
  progress: number; // Percentage 0 - 100
  createdAt: Date;
  updatedAt: Date;
}

const CareerRoadmapSchema = new Schema<ICareerRoadmap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetRole: { type: String, required: true, trim: true },
    stages: [
      {
        order: { type: Number, required: true },
        title: { type: String, required: true },
        description: String,
        durationWeeks: Number,
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        tasks: [
          {
            id: String,
            title: String,
            description: String,
            completed: { type: Boolean, default: false }
          }
        ]
      }
    ],
    skills: [{ type: String }],
    recommendedProjects: [{ type: String }],
    progress: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const CareerRoadmap = mongoose.model<ICareerRoadmap>('CareerRoadmap', CareerRoadmapSchema);
