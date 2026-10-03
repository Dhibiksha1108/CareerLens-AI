import mongoose, { Schema, Document } from 'mongoose';

export interface IPracticalProject {
  title: string;
  targetSkill: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  portfolioEvidence: string;
  estimatedHours: number;
  keyDeliverables: string[];
  architectureOverview?: string;
}

export interface IRecommendedRole {
  role: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  reason: string;
  skillGaps?: ISkillGap[];
  roadmap?: IRoadmapStage[];
  practicalProjects?: IPracticalProject[];
}

export interface ISkillGap {
  skill: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  demandFrequency: number;
  recommendedLearningArea: string;
  estimatedHours: number;
  suggestedProjects: string[];
  practicalProjects?: IPracticalProject[];
  learningResources: Array<{
    title: string;
    type: string;
    level: string;
    description: string;
  }>;
}

export interface IRoadmapMilestone {
  description: string;
  completed: boolean;
  skillTarget: string;
  estimatedHours?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
}

export interface IRoadmapStage {
  stage: number;
  stageLevel: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  duration: string;
  estimatedHours: number;
  prerequisites: string[];
  skills: string[];
  milestones: IRoadmapMilestone[];
  recommendedProject: {
    title: string;
    description: string;
    keyDeliverables: string[];
    targetSkill?: string;
    portfolioEvidence?: string;
  };
  practicalProjects?: IPracticalProject[];
}

export interface ICareerRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  recommendedRoles: IRecommendedRole[];
  skillGaps: ISkillGap[];
  roadmap: IRoadmapStage[];
  overallReadiness: number;
  sourceJobAnalysisId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PracticalProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    targetSkill: { type: String, required: true },
    category: { type: String, default: 'General Technical' },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    portfolioEvidence: { type: String, required: true },
    estimatedHours: { type: Number, default: 20 },
    keyDeliverables: [{ type: String }],
    architectureOverview: { type: String }
  },
  { _id: false }
);

const MilestoneSchema = new Schema(
  {
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    skillTarget: { type: String },
    estimatedHours: { type: Number, default: 10 },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' }
  },
  { _id: false }
);

const StageSchema = new Schema(
  {
    stage: { type: Number, required: true },
    stageLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    title: { type: String, required: true },
    duration: { type: String, default: '2-4 Weeks' },
    estimatedHours: { type: Number, default: 30 },
    prerequisites: [{ type: String }],
    skills: [{ type: String }],
    milestones: [MilestoneSchema],
    recommendedProject: {
      title: { type: String },
      description: { type: String },
      keyDeliverables: [{ type: String }],
      targetSkill: { type: String },
      portfolioEvidence: { type: String }
    },
    practicalProjects: [PracticalProjectSchema]
  },
  { _id: false }
);

const CareerRecommendationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetRole: { type: String, required: true },
    recommendedRoles: [
      {
        role: { type: String, required: true },
        matchPercentage: { type: Number, required: true },
        matchedSkills: [{ type: String }],
        missingSkills: [{ type: String }],
        reason: { type: String },
        skillGaps: [{ type: Schema.Types.Mixed }],
        roadmap: [StageSchema],
        practicalProjects: [PracticalProjectSchema]
      }
    ],
    skillGaps: [
      {
        skill: { type: String, required: true },
        category: { type: String, default: 'General Technical' },
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        demandFrequency: { type: Number, default: 1 },
        recommendedLearningArea: { type: String },
        estimatedHours: { type: Number, default: 20 },
        suggestedProjects: [{ type: String }],
        practicalProjects: [PracticalProjectSchema],
        learningResources: [
          {
            title: { type: String },
            type: { type: String },
            level: { type: String },
            description: { type: String }
          }
        ]
      }
    ],
    roadmap: [StageSchema],
    overallReadiness: { type: Number, default: 70 },
    sourceJobAnalysisId: { type: Schema.Types.ObjectId, ref: 'JobAnalysis' }
  },
  {
    timestamps: true
  }
);

export const CareerRecommendation = mongoose.model<ICareerRecommendation>(
  'CareerRecommendation',
  CareerRecommendationSchema
);
