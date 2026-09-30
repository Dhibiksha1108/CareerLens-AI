"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulatorController = void 0;
const simulatorService_js_1 = require("../services/simulatorService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class SimulatorController {
    static async simulate(req, res) {
        try {
            const { targetRole, addedSkills, addedProjects } = req.body;
            if (!targetRole) {
                (0, apiResponse_js_1.sendError)(res, 'Target role is required for simulation', null, 400);
                return;
            }
            const simulation = await simulatorService_js_1.SimulatorService.simulateReadiness(req.user.userId, targetRole, addedSkills || [], addedProjects || []);
            (0, apiResponse_js_1.sendSuccess)(res, 'Role readiness simulation completed successfully', simulation);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.SimulatorController = SimulatorController;
