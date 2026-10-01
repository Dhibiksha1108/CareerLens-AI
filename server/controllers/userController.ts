import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { UserService } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await UserService.getUserProfile(req.user!.userId);
      sendSuccess(res, 'Profile retrieved successfully', user);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve profile', null, 404);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await UserService.updateUserProfile(req.user!.userId, req.body);
      sendSuccess(res, 'Profile updated successfully', user);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update profile', null, 400);
    }
  }

  static async updateTargetRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { targetRoles, skills } = req.body;
      const user = await UserService.updateTargetRoles(req.user!.userId, targetRoles, skills);
      sendSuccess(res, 'Target roles updated successfully', user);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update target roles', null, 400);
    }
  }
}
