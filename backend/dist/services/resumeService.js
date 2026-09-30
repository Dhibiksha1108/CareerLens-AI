"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeService = void 0;
const Resume_js_1 = require("../models/Resume.js");
const textExtractionService_js_1 = require("./textExtractionService.js");
const env_js_1 = require("../config/env.js");
class ResumeService {
    /**
     * Processes an uploaded PDF/DOCX file, extracts plain text, and persists metadata in MongoDB
     */
    static async uploadResumeFile(userId, file) {
        if (!file || !file.buffer) {
            throw new Error('No file content uploaded.');
        }
        const extractedText = await textExtractionService_js_1.TextExtractionService.extractText(file.buffer, file.originalname, file.mimetype);
        const resume = await Resume_js_1.Resume.create({
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
        console.log(`[ResumeService] Resume created & text extracted for user ${userId}. AI Microservice URL: ${env_js_1.config.aiServiceUrl}`);
        return resume;
    }
    static async uploadResume(userId, data) {
        const resume = await Resume_js_1.Resume.create({
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
    static async getUserResumes(userId) {
        return await Resume_js_1.Resume.find({ userId }).sort({ createdAt: -1 });
    }
    static async getResumeById(resumeId, userId) {
        const resume = await Resume_js_1.Resume.findOne({ _id: resumeId, userId });
        if (!resume)
            throw new Error('Resume not found');
        return resume;
    }
    static async deleteResume(resumeId, userId) {
        const res = await Resume_js_1.Resume.deleteOne({ _id: resumeId, userId });
        if (res.deletedCount === 0)
            throw new Error('Resume not found or unauthorized');
        return { deleted: true };
    }
}
exports.ResumeService = ResumeService;
