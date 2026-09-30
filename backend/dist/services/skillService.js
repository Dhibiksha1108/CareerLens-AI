"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillService = void 0;
const SkillEvidence_js_1 = require("../models/SkillEvidence.js");
class SkillService {
    static async getSkillEvidences(userId) {
        return await SkillEvidence_js_1.SkillEvidence.find({ userId }).sort({ updatedAt: -1 });
    }
    static async verifySkillEvidence(userId, skill) {
        let evidence = await SkillEvidence_js_1.SkillEvidence.findOne({ userId, skill });
        if (!evidence) {
            evidence = await SkillEvidence_js_1.SkillEvidence.create({
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
exports.SkillService = SkillService;
