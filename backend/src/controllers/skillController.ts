import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { SkillService } from '../services/skillService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class SkillController {
  static async getEvidences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const evidences = await SkillService.getSkillEvidences(req.user!.userId);
      sendSuccess(res, 'Skill evidence matrix retrieved successfully', evidences);
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
      const result = await SkillService.verifySkillEvidence(req.user!.userId, skill);
      sendSuccess(res, 'Skill verification re-evaluated successfully', result);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
