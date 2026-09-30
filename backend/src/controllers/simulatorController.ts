import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { SimulatorService } from '../services/simulatorService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class SimulatorController {
  static async simulate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { targetRole, addedSkills, addedProjects } = req.body;
      if (!targetRole) {
        sendError(res, 'Target role is required for simulation', null, 400);
        return;
      }
      const simulation = await SimulatorService.simulateReadiness(
        req.user!.userId,
        targetRole,
        addedSkills || [],
        addedProjects || []
      );
      sendSuccess(res, 'Role readiness simulation completed successfully', simulation);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
