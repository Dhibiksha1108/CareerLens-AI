import { SkillEvidence } from '../models/SkillEvidence.js';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';

export class SkillsService {
  static async getSkillEvidence(userId: string) {
    return await SkillEvidence.find({ userId }).sort({ evidenceStrength: -1, skill: 1 });
  }

  static async verifySkill(userId: string, skillName: string) {
    const skill = await SkillEvidence.findOne({ userId, skill: { $regex: new RegExp(`^${skillName}$`, 'i') } });

    if (!skill) {
      const newSkill = await SkillEvidence.create({
        userId,
        skill: skillName,
        category: 'Technical',
        confidence: 0,
        proficiencyLevel: 'beginner',
        evidenceStrength: 'low'
      });
      return newSkill;
    }

    const resumeCount = skill.resumeEvidence?.length || 0;
    const githubCount = skill.githubEvidence?.length || 0;
    const projectCount = skill.projectEvidence?.length || 0;
    const totalSources = resumeCount + githubCount + projectCount;

    if (totalSources >= 3) {
      skill.evidenceStrength = 'verified';
    } else if (totalSources >= 2) {
      skill.evidenceStrength = 'high';
    } else if (totalSources >= 1) {
      skill.evidenceStrength = 'medium';
    } else {
      skill.evidenceStrength = 'low';
    }

    skill.confidence = Math.min(0.5 + totalSources * 0.15, 0.98);
    await skill.save();
    return skill;
  }
}
