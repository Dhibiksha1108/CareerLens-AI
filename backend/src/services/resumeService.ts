import { Resume } from '../models/Resume.js';
import { TextExtractionService } from './textExtractionService.js';
import { config } from '../config/env.js';

export class ResumeService {
  /**
   * Processes an uploaded PDF/DOCX file, extracts plain text, and persists metadata in MongoDB
   */
  static async uploadResumeFile(userId: string, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new Error('No file content uploaded.');
    }

    const extractedText = await TextExtractionService.extractText(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    const resume = await Resume.create({
      userId,
      fileInfo: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date()
      },
      extractedText,
      skills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      analysisStatus: 'completed'
    });

    console.log(`[ResumeService] Resume created & text extracted for user ${userId}. AI Microservice URL: ${config.aiServiceUrl}`);

    return resume;
  }

  static async uploadResume(userId: string, data: { originalName: string; extractedText?: string; mimeType?: string; size?: number }) {
    const resume = await Resume.create({
      userId,
      fileInfo: {
        originalName: data.originalName,
        mimeType: data.mimeType || 'text/plain',
        size: data.size || 0,
        uploadedAt: new Date()
      },
      extractedText: data.extractedText || '',
      skills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      analysisStatus: 'completed'
    });

    return resume;
  }

  static async getUserResumes(userId: string) {
    return await Resume.find({ userId }).sort({ createdAt: -1 });
  }

  static async getResumeById(resumeId: string, userId: string) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) throw new Error('Resume not found');
    return resume;
  }

  static async deleteResume(resumeId: string, userId: string) {
    const res = await Resume.deleteOne({ _id: resumeId, userId });
    if (res.deletedCount === 0) throw new Error('Resume not found or unauthorized');
    return { deleted: true };
  }
}
