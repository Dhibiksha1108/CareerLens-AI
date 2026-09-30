"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const jobService_js_1 = require("../services/jobService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class JobController {
    static async analyzeJob(req, res) {
        try {
            const { jobTitle, jobDescription, company, requiredSkills } = req.body;
            if (!jobTitle || !jobDescription) {
                (0, apiResponse_js_1.sendError)(res, 'Job title and job description are required', null, 400);
                return;
            }
            const analysis = await jobService_js_1.JobService.analyzeJobDescription(req.user.userId, {
                jobTitle,
                company,
                jobDescription,
                requiredSkills
            });
            (0, apiResponse_js_1.sendSuccess)(res, 'Job description analysis completed successfully', analysis, 201);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async getJobAnalyses(req, res) {
        try {
            const analyses = await jobService_js_1.JobService.getUserJobAnalyses(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Job analyses retrieved successfully', analyses);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async getJobAnalysisById(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const analysis = await jobService_js_1.JobService.getJobAnalysisById(id, req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Job analysis details retrieved successfully', analysis);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 404);
        }
    }
}
exports.JobController = JobController;
