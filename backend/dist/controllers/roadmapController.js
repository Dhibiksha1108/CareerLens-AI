"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoadmapController = void 0;
const roadmapService_js_1 = require("../services/roadmapService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class RoadmapController {
    static async getRoadmap(req, res) {
        try {
            const roadmaps = await roadmapService_js_1.RoadmapService.getUserRoadmaps(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Career roadmaps retrieved successfully', roadmaps);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async generateRoadmap(req, res) {
        try {
            const { targetRole } = req.body;
            if (!targetRole) {
                (0, apiResponse_js_1.sendError)(res, 'Target role is required', null, 400);
                return;
            }
            const roadmap = await roadmapService_js_1.RoadmapService.generateRoadmap(req.user.userId, targetRole);
            (0, apiResponse_js_1.sendSuccess)(res, 'Career roadmap generated successfully', roadmap, 201);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async updateStage(req, res) {
        try {
            const { stageOrder, status } = req.body;
            if (stageOrder === undefined || !status) {
                (0, apiResponse_js_1.sendError)(res, 'stageOrder and status are required', null, 400);
                return;
            }
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const updated = await roadmapService_js_1.RoadmapService.updateStageStatus(id, req.user.userId, Number(stageOrder), status);
            (0, apiResponse_js_1.sendSuccess)(res, 'Roadmap stage updated successfully', updated);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.RoadmapController = RoadmapController;
