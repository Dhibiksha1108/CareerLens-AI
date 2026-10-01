import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { RecommendationService } from '../services/recommendationService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class RecommendationController {
  static async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const rec = await RecommendationService.getRecommendations(req.user!.userId);
      sendSuccess(res, 'Career recommendations retrieved successfully', rec);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve recommendations', null, 500);
    }
  }

  static async generateRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const rec = await RecommendationService.generateRecommendations(req.user!.userId);
      sendSuccess(res, 'Recommendations generated successfully', rec, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to generate recommendations', null, 500);
    }
  }

  static async updateMilestone(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { stageIndex, milestoneIndex, completed, roleName } = req.body;
      if (typeof stageIndex !== 'number' || typeof milestoneIndex !== 'number' || typeof completed !== 'boolean') {
        sendError(res, 'stageIndex, milestoneIndex, and completed (boolean) are required', null, 400);
        return;
      }
      const rec = await RecommendationService.updateMilestoneStatus(
        req.user!.userId,
        stageIndex,
        milestoneIndex,
        completed,
        roleName
      );
      sendSuccess(res, 'Milestone status updated successfully', rec);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update milestone status', null, 500);
    }
  }
}
