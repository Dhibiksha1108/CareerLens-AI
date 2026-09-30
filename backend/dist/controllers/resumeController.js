"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeController = void 0;
const resumeService_js_1 = require("../services/resumeService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class ResumeController {
    static async uploadResume(req, res) {
        try {
            if (req.file) {
                const resume = await resumeService_js_1.ResumeService.uploadResumeFile(req.user.userId, req.file);
                (0, apiResponse_js_1.sendSuccess)(res, 'Resume file uploaded and text extracted successfully', resume, 201);
                return;
            }
            const { originalName, extractedText, mimeType, size } = req.body;
            if (!originalName) {
                (0, apiResponse_js_1.sendError)(res, 'No file or originalName provided for upload', null, 400);
                return;
            }
            const resume = await resumeService_js_1.ResumeService.uploadResume(req.user.userId, {
                originalName,
                extractedText,
                mimeType,
                size
            });
            (0, apiResponse_js_1.sendSuccess)(res, 'Resume text submitted successfully', resume, 201);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async getMyResumes(req, res) {
        try {
            const resumes = await resumeService_js_1.ResumeService.getUserResumes(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'User resumes retrieved successfully', resumes);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async getResumeById(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const resume = await resumeService_js_1.ResumeService.getResumeById(id, req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Resume details retrieved successfully', resume);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 404);
        }
    }
    static async deleteResume(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const result = await resumeService_js_1.ResumeService.deleteResume(id, req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Resume deleted successfully', result);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.ResumeController = ResumeController;
