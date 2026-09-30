"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationController = void 0;
const recommendationService_js_1 = require("../services/recommendationService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class RecommendationController {
    static async getRecommendations(req, res) {
        try {
            const recs = await recommendationService_js_1.RecommendationService.getUserRecommendations(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Recommendations retrieved successfully', recs);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async updateStatus(req, res) {
        try {
            const { status } = req.body;
            if (!status) {
                (0, apiResponse_js_1.sendError)(res, 'Status is required', null, 400);
                return;
            }
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const updated = await recommendationService_js_1.RecommendationService.updateRecommendationStatus(id, req.user.userId, status);
            (0, apiResponse_js_1.sendSuccess)(res, 'Recommendation status updated successfully', updated);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.RecommendationController = RecommendationController;
