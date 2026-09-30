"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const JobAnalysis_js_1 = require("../models/JobAnalysis.js");
const User_js_1 = require("../models/User.js");
class JobService {
    static async analyzeJobDescription(userId, data) {
        const user = await User_js_1.User.findById(userId);
        const userSkills = user?.skills.map(s => s.name.toLowerCase()) || [];
        const reqSkills = data.requiredSkills || [];
        const matchingSkills = reqSkills.filter(s => userSkills.includes(s.toLowerCase()));
        const missingSkills = reqSkills.filter(s => !userSkills.includes(s.toLowerCase()));
        const matchPercentage = reqSkills.length > 0
            ? Math.round((matchingSkills.length / reqSkills.length) * 100)
            : 0;
        const jobAnalysis = await JobAnalysis_js_1.JobAnalysis.create({
            userId,
            jobTitle: data.jobTitle,
            company: data.company,
            jobDescription: data.jobDescription,
            requiredSkills: reqSkills,
            matchingSkills,
            missingSkills,
            partialSkills: [],
            matchResult: {
                matchPercentage,
                breakdown: { matching: matchingSkills.length, missing: missingSkills.length },
                recommendationsSummary: `To improve match score, acquire missing skills: ${missingSkills.join(', ')}`
            }
        });
        return jobAnalysis;
    }
    static async getUserJobAnalyses(userId) {
        return await JobAnalysis_js_1.JobAnalysis.find({ userId }).sort({ createdAt: -1 });
    }
    static async getJobAnalysisById(jobId, userId) {
        const analysis = await JobAnalysis_js_1.JobAnalysis.findOne({ _id: jobId, userId });
        if (!analysis)
            throw new Error('Job analysis record not found');
        return analysis;
    }
}
exports.JobService = JobService;
