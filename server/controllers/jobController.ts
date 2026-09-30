import { Response } from 'express';
import { JobService } from '../services/jobService.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class JobController {
  static async analyzeJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { jobTitle, company, jobDescription, requiredSkills } = req.body;
      if (!jobTitle || !jobDescription) {
        sendError(res, 'jobTitle and jobDescription are required', null, 400);
        return;
      }
      const result = await JobService.analyzeJobDescription(req.user!.userId, {
        jobTitle,
        company,
        jobDescription,
        requiredSkills
      });
      sendSuccess(res, 'Job description analyzed successfully', result, 201);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getJobs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const jobs = await JobService.getUserJobAnalyses(req.user!.userId);
      sendSuccess(res, 'Job analyses retrieved successfully', jobs);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getJobById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const job = await JobService.getJobAnalysisById(id, req.user!.userId);
      sendSuccess(res, 'Job analysis retrieved successfully', job);
    } catch (error) {
      sendError(res, (error as Error).message, null, 404);
    }
  }
}
