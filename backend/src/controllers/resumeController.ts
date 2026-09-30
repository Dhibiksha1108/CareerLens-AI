import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { ResumeService } from '../services/resumeService.js';
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
}
