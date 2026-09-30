import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Resume } from '../models/Resume.js';

export class BenchmarkingService {
  static async getBenchmarkMetrics(userId: string) {
    const user = await User.findById(userId);
    const projects = await Project.find({ userId });
    const resumes = await Resume.find({ userId });

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
