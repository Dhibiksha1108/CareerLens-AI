import { JobAnalysis } from '../models/JobAnalysis.js';
import { User } from '../models/User.js';

export class JobService {
  static async analyzeJobDescription(userId: string, data: { jobTitle: string; company?: string; jobDescription: string; requiredSkills?: string[] }) {
    const user = await User.findById(userId);
    const userSkills = user?.skills.map(s => s.name.toLowerCase()) || [];

    const reqSkills = data.requiredSkills || [];
    const matchingSkills = reqSkills.filter(s => userSkills.includes(s.toLowerCase()));
    const missingSkills = reqSkills.filter(s => !userSkills.includes(s.toLowerCase()));

    const matchPercentage = reqSkills.length > 0
      ? Math.round((matchingSkills.length / reqSkills.length) * 100)
      : 0;

    const jobAnalysis = await JobAnalysis.create({
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

  static async getUserJobAnalyses(userId: string) {
    return await JobAnalysis.find({ userId }).sort({ createdAt: -1 });
  }

  static async getJobAnalysisById(jobId: string, userId: string) {
    const analysis = await JobAnalysis.findOne({ _id: jobId, userId });
    if (!analysis) throw new Error('Job analysis record not found');
    return analysis;
  }
}
