import { User } from '../models/User.js';

export class SimulatorService {
  static async simulateReadiness(userId: string, targetRole: string, addedSkills: string[], addedProjects: string[]) {
    const user = await User.findById(userId);
    const existingSkills = user?.skills.map(s => s.name.toLowerCase()) || [];

    const baseScore = Math.min(60, existingSkills.length * 10);
    const skillBoost = addedSkills.length * 8;
    const projectBoost = addedProjects.length * 12;

    const projectedScore = Math.min(100, baseScore + skillBoost + projectBoost);

    return {
      targetRole,
      currentMatchScore: baseScore,
      projectedMatchScore: projectedScore,
      delta: projectedScore - baseScore,
      simulatedAdditions: {
        addedSkills,
        addedProjects
      },
      keyRequirementsRemaining: ['System Architecture Design', 'Production Testing Pipeline']
    };
  }
}
