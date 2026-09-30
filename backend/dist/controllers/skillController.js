"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillController = void 0;
const skillService_js_1 = require("../services/skillService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class SkillController {
    static async getEvidences(req, res) {
        try {
            const evidences = await skillService_js_1.SkillService.getSkillEvidences(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Skill evidence matrix retrieved successfully', evidences);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async verifySkill(req, res) {
        try {
            const { skill } = req.body;
            if (!skill) {
                (0, apiResponse_js_1.sendError)(res, 'Skill name is required', null, 400);
                return;
            }
            const result = await skillService_js_1.SkillService.verifySkillEvidence(req.user.userId, skill);
            (0, apiResponse_js_1.sendSuccess)(res, 'Skill verification re-evaluated successfully', result);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.SkillController = SkillController;
