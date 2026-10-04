import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { RecommendationService } from '../services/recommendationService.js';
import { BenchmarkingService } from '../services/benchmarkingService.js';
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

  static async updateProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, completed, roleName, status } = req.body;
      if (!projectId || typeof completed !== 'boolean') {
        sendError(res, 'projectId and completed (boolean) are required', null, 400);
        return;
      }
      const rec = await RecommendationService.updateProjectStatus(
        req.user!.userId,
        projectId,
        completed,
        roleName,
        status
      );
      sendSuccess(res, 'Project status updated successfully', rec);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update project status', null, 500);
    }
  }

  static async getCareerBenchmark(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roleName = (req.query.role as string) || (req.body?.role as string);
      const benchmark = await BenchmarkingService.getCareerBenchmark(
        req.user!.userId,
        roleName
      );
      sendSuccess(res, 'Career benchmark retrieved successfully', benchmark);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve career benchmark', null, 500);
    }
  }
}
