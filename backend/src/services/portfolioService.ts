import { Portfolio } from '../models/Portfolio.js';

export class PortfolioService {
  static async analyzePortfolio(userId: string, portfolioUrl: string) {
    let portfolio = await Portfolio.findOne({ userId, portfolioUrl });

    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId,
        portfolioUrl,
        analysisStatus: 'pending',
        skills: [],
        projects: []
      });
    } else {
      portfolio.analysisStatus = 'pending';
      await portfolio.save();
    }

    return portfolio;
  }

  static async getUserPortfolios(userId: string) {
    return await Portfolio.find({ userId }).sort({ createdAt: -1 });
  }
}
