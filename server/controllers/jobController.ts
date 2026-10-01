import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { JobMatchingService } from '../services/jobMatchingService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class JobController {
  static async analyzeJobMatch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { jobTitle, company, jobDescription, resumeId } = req.body;

      if (!jobDescription || typeof jobDescription !== 'string') {
        sendError(res, 'Job description text is required', null, 400);
        return;
      }

      const matchResult = await JobMatchingService.matchJobWithResume(req.user!.userId, {
        jobTitle: jobTitle || 'Target Position',
        company: company || '',
        jobDescription,
        resumeId
      });

      sendSuccess(res, 'Job compatibility analysis completed successfully', matchResult, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to analyze job match', null, 400);
    }
  }

  static async getJobMatches(req: AuthRequest, res: Response): Promise<void> {
    try {
      const matches = await JobMatchingService.getUserJobMatches(req.user!.userId);
      sendSuccess(res, 'User job matches retrieved successfully', matches);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve job matches', null, 400);
    }
  }

  static async getJobMatchById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const match = await JobMatchingService.getJobMatchById(id, req.user!.userId);

      if (!match) {
        sendError(res, 'Job match record not found', null, 404);
        return;
      }

      sendSuccess(res, 'Job match details retrieved successfully', match);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve job match record', null, 404);
    }
  }
}
