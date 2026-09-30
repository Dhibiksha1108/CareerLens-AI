import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  portfolioUrl: string;
  extractedContent?: {
    rawText?: string;
    sections?: Record<string, string>;
    scrapedAt?: Date;
  };
  projects: Record<string, any>[];
  skills: string[];
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  analysisResult?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    portfolioUrl: { type: String, required: true, trim: true },
    extractedContent: {
      rawText: String,
      sections: Schema.Types.Mixed,
      scrapedAt: Date
    },
    projects: [Schema.Types.Mixed],
    skills: [{ type: String }],
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    analysisResult: Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
