import { SkillEvidence } from '../models/SkillEvidence.js';

export class SkillService {
  static async getSkillEvidences(userId: string) {
    return await SkillEvidence.find({ userId }).sort({ updatedAt: -1 });
  }

  static async verifySkillEvidence(userId: string, skill: string) {
    let evidence = await SkillEvidence.findOne({ userId, skill });

    if (!evidence) {
      evidence = await SkillEvidence.create({
        userId,
        skill,
        resumeEvidence: [],
        githubEvidence: [],
        projectEvidence: [],
        portfolioEvidence: [],
        certificationEvidence: [],
        evidenceStrength: 'low'
      });
    }

    return evidence;
  }
}
