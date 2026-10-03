import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { ResumeService } from '../services/resumeService.js';
import { NlpAnalysisService } from '../services/nlpAnalysisService.js';
import { AtsAnalysisService } from '../services/atsAnalysisService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class ResumeController {
  static async uploadResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.file) {
        const resume = await ResumeService.uploadResumeFile(req.user!.userId, req.file);
        sendSuccess(res, 'Resume file uploaded and text extracted successfully', resume, 201);
        return;
      }

      const { originalName, extractedText, mimeType, size } = req.body;
      if (!originalName) {
        sendError(res, 'No file or originalName provided for upload', null, 400);
        return;
      }

      const resume = await ResumeService.uploadResume(req.user!.userId, {
        originalName,
        extractedText,
        mimeType,
        size
      });
      sendSuccess(res, 'Resume text submitted successfully', resume, 201);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getMyResumes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resumes = await ResumeService.getUserResumes(req.user!.userId);
      sendSuccess(res, 'User resumes retrieved successfully', resumes);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getResumeById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const resume = await ResumeService.getResumeById(id, req.user!.userId);
      sendSuccess(res, 'Resume details retrieved successfully', resume);
    } catch (error) {
      sendError(res, (error as Error).message, null, 404);
    }
  }

  static async deleteResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await ResumeService.deleteResume(id, req.user!.userId);
      sendSuccess(res, 'Resume deleted successfully', result);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async analyzeResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await NlpAnalysisService.analyzeResumeText(req.user!.userId, id);
      sendSuccess(res, 'Resume NLP skill extraction completed successfully', result);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getResumeAnalysis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await NlpAnalysisService.getAnalysisResult(req.user!.userId, id);
      if (!result) {
        sendError(res, 'No NLP analysis available for this resume', null, 404);
        return;
      }
      sendSuccess(res, 'Resume NLP analysis retrieved successfully', result);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async analyzeAts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || req.body.resumeId);
      const targetRole = req.body.targetRole || (req.query.targetRole as string);
      const jobDescription = req.body.jobDescription || (req.query.jobDescription as string);

      if (!id) {
        sendError(res, 'Resume ID is required for ATS analysis', null, 400);
        return;
      }

      const result = await AtsAnalysisService.analyzeResumeAts(
        req.user!.userId,
        id,
        targetRole,
        jobDescription
      );
      sendSuccess(res, 'ATS and readability analysis generated successfully', result);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getAtsAnalysis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || (req.query.resumeId as string));
      const targetRole = req.query.targetRole as string;
      const jobDescription = req.query.jobDescription as string;

      if (!id) {
        sendError(res, 'Resume ID is required for ATS analysis', null, 400);
        return;
      }

      const result = await AtsAnalysisService.analyzeResumeAts(
        req.user!.userId,
        id,
        targetRole,
        jobDescription
      );
      sendSuccess(res, 'ATS and readability analysis retrieved successfully', result);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}

