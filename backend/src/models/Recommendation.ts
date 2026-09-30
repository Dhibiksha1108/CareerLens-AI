import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'project' | 'skill_acquisition' | 'resume_improvement' | 'course' | 'github_enhancement';
  title: string;
  description: string;
  relatedSkill?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['project', 'skill_acquisition', 'resume_improvement', 'course', 'github_enhancement'],
      required: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    relatedSkill: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'dismissed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
