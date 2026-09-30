import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { RoadmapService } from '../services/roadmapService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class RoadmapController {
  static async getRoadmap(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roadmaps = await RoadmapService.getUserRoadmaps(req.user!.userId);
      sendSuccess(res, 'Career roadmaps retrieved successfully', roadmaps);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async generateRoadmap(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { targetRole } = req.body;
      if (!targetRole) {
        sendError(res, 'Target role is required', null, 400);
        return;
      }
      const roadmap = await RoadmapService.generateRoadmap(req.user!.userId, targetRole);
      sendSuccess(res, 'Career roadmap generated successfully', roadmap, 201);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async updateStage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { stageOrder, status } = req.body;
      if (stageOrder === undefined || !status) {
        sendError(res, 'stageOrder and status are required', null, 400);
        return;
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await RoadmapService.updateStageStatus(id, req.user!.userId, Number(stageOrder), status);
      sendSuccess(res, 'Roadmap stage updated successfully', updated);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
