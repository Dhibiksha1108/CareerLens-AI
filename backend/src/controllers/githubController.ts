import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { GitHubService } from '../services/githubService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class GitHubController {
  static async syncProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username } = req.body;
      if (!username) {
        sendError(res, 'GitHub username is required', null, 400);
        return;
      }
      const profile = await GitHubService.syncGitHubProfile(req.user!.userId, username);
      sendSuccess(res, 'GitHub profile sync initiated', profile);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getMyProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const profile = await GitHubService.getUserGitHubProfile(req.user!.userId);
      sendSuccess(res, 'GitHub profile data retrieved successfully', profile);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
