import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { UserService } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await UserService.getUserProfile(req.user!.userId);
      sendSuccess(res, 'User profile retrieved successfully', user);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const updatedUser = await UserService.updateUserProfile(req.user!.userId, req.body);
      sendSuccess(res, 'Profile updated successfully', updatedUser);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async updateTargetRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { targetRoles, skills } = req.body;
      const updatedUser = await UserService.updateTargetRoles(req.user!.userId, targetRoles || [], skills);
      sendSuccess(res, 'Target roles updated successfully', updatedUser);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
