import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { RecommendationService } from '../services/recommendationService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class RecommendationController {
  static async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const recs = await RecommendationService.getUserRecommendations(req.user!.userId);
      sendSuccess(res, 'Recommendations retrieved successfully', recs);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!status) {
        sendError(res, 'Status is required', null, 400);
        return;
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await RecommendationService.updateRecommendationStatus(id, req.user!.userId, status);
      sendSuccess(res, 'Recommendation status updated successfully', updated);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
