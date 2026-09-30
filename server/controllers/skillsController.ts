import { Response } from 'express';
import { SkillsService } from '../services/skillsService.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class SkillsController {
  static async getEvidence(req: AuthRequest, res: Response): Promise<void> {
    try {
      const evidences = await SkillsService.getSkillEvidence(req.user!.userId);
      sendSuccess(res, 'Skill evidence retrieved successfully', evidences);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async verifySkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { skill } = req.body;
      if (!skill) {
        sendError(res, 'Skill name is required', null, 400);
        return;
      }
      const result = await SkillsService.verifySkill(req.user!.userId, skill);
      sendSuccess(res, 'Skill evidence verified successfully', result);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
