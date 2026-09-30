import mongoose, { Schema, Document } from 'mongoose';

export interface IGitHubRepository {
  name: string;
  description?: string;
  htmlUrl?: string;
  stars?: number;
  forks?: number;
  primaryLanguage?: string;
  topics?: string[];
  updatedAt?: Date;
}

export interface IGitHubProfile extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  repositories: IGitHubRepository[];
  languages: Record<string, number>;
  contributionInfo?: {
    totalContributions?: number;
    publicRepos?: number;
    followers?: number;
    following?: number;
  };
  analyzedSkills: string[];
  analysisResult?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const GitHubProfileSchema = new Schema<IGitHubProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    username: { type: String, required: true, trim: true },
    repositories: [
      {
        name: String,
        description: String,
        htmlUrl: String,
        stars: Number,
        forks: Number,
        primaryLanguage: String,
        topics: [String],
        updatedAt: Date
      }
    ],
    languages: Schema.Types.Mixed,
    contributionInfo: {
      totalContributions: Number,
      publicRepos: Number,
      followers: Number,
      following: Number
    },
    analyzedSkills: [{ type: String }],
    analysisResult: Schema.Types.Mixed
  },
  { timestamps: true }
);

export const GitHubProfile = mongoose.model<IGitHubProfile>('GitHubProfile', GitHubProfileSchema);
