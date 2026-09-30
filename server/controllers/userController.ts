import { Response } from 'express';
import { UserService } from '../services/userService.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await UserService.getUserProfile(req.user!.userId);
      sendSuccess(res, 'User profile retrieved', user);
    } catch (error) {
      sendError(res, (error as Error).message, null, 404);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await UserService.updateUserProfile(req.user!.userId, req.body);
      sendSuccess(res, 'Profile updated successfully', user);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async updateTargetRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { targetRoles, skills } = req.body;
      if (!targetRoles || !Array.isArray(targetRoles)) {
        sendError(res, 'targetRoles must be an array', null, 400);
        return;
      }
      const user = await UserService.updateTargetRoles(req.user!.userId, targetRoles, skills);
      sendSuccess(res, 'Target roles updated successfully', user);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
