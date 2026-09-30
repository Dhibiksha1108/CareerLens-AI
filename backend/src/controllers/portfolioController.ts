import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { PortfolioService } from '../services/portfolioService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class PortfolioController {
  static async analyzePortfolio(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { portfolioUrl } = req.body;
      if (!portfolioUrl) {
        sendError(res, 'Portfolio URL is required', null, 400);
        return;
      }
      const portfolio = await PortfolioService.analyzePortfolio(req.user!.userId, portfolioUrl);
      sendSuccess(res, 'Portfolio analysis initiated successfully', portfolio, 202);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getMyPortfolios(req: AuthRequest, res: Response): Promise<void> {
    try {
      const portfolios = await PortfolioService.getUserPortfolios(req.user!.userId);
      sendSuccess(res, 'User portfolio records retrieved successfully', portfolios);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
