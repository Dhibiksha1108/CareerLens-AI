"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const Recommendation_js_1 = require("../models/Recommendation.js");
class RecommendationService {
    static async getUserRecommendations(userId) {
        return await Recommendation_js_1.Recommendation.find({ userId }).sort({ createdAt: -1 });
    }
    static async updateRecommendationStatus(recommendationId, userId, status) {
        const rec = await Recommendation_js_1.Recommendation.findOneAndUpdate({ _id: recommendationId, userId }, { status }, { new: true });
        if (!rec)
            throw new Error('Recommendation not found or unauthorized');
        return rec;
    }
}
exports.RecommendationService = RecommendationService;
