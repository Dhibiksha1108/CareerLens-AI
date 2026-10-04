import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { UserService } from '../services/userService.js';
import { DashboardService } from '../services/dashboardService.js';
import { AnalyticsService } from '../services/analyticsService.js';
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

  static async getDashboardSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roleName = (req.query.role as string) || (req.body?.role as string);
      const dashboard = await DashboardService.getDashboardSummary(
        req.user!.userId,
        roleName
      );
      sendSuccess(res, 'Unified career dashboard summary retrieved successfully', dashboard);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve career dashboard summary', null, 500);
    }
  }

  static async getCareerAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roleName = (req.query.role as string) || (req.body?.role as string);
      const analytics = await AnalyticsService.getCareerAnalytics(
        req.user!.userId,
        roleName
      );
      sendSuccess(res, 'Career visual analytics retrieved successfully', analytics);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve career analytics', null, 500);
    }
  }
}
