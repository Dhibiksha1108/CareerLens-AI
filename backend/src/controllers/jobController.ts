import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { JobService } from '../services/jobService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class JobController {
  static async analyzeJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { jobTitle, jobDescription, company, requiredSkills } = req.body;
      if (!jobTitle || !jobDescription) {
        sendError(res, 'Job title and job description are required', null, 400);
        return;
      }
      const analysis = await JobService.analyzeJobDescription(req.user!.userId, {
        jobTitle,
        company,
        jobDescription,
        requiredSkills
      });
      sendSuccess(res, 'Job description analysis completed successfully', analysis, 201);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getJobAnalyses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const analyses = await JobService.getUserJobAnalyses(req.user!.userId);
      sendSuccess(res, 'Job analyses retrieved successfully', analyses);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getJobAnalysisById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const analysis = await JobService.getJobAnalysisById(id, req.user!.userId);
      sendSuccess(res, 'Job analysis details retrieved successfully', analysis);
    } catch (error) {
      sendError(res, (error as Error).message, null, 404);
    }
  }
}
