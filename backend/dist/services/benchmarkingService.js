"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkingService = void 0;
const User_js_1 = require("../models/User.js");
const Project_js_1 = require("../models/Project.js");
const Resume_js_1 = require("../models/Resume.js");
class BenchmarkingService {
    static async getBenchmarkMetrics(userId) {
        const user = await User_js_1.User.findById(userId);
        const projects = await Project_js_1.Project.find({ userId });
        const resumes = await Resume_js_1.Resume.find({ userId });
        const userSkillsCount = user?.skills?.length || 0;
        const projectCount = projects.length;
        const hasResume = resumes.length > 0;
        return {
            userMetrics: {
                skillsCount: userSkillsCount,
                projectCount,
                resumeUploaded: hasResume,
                overallScore: Math.min(100, (userSkillsCount * 10) + (projectCount * 15) + (hasResume ? 25 : 0))
            },
            marketBenchmarks: {
                avgSkillsCount: 8,
                avgProjectCount: 3,
                avgScore: 72,
                topPercentileScore: 88
            },
            rankPercentile: userSkillsCount > 5 ? 78 : 45
        };
    }
}
exports.BenchmarkingService = BenchmarkingService;
