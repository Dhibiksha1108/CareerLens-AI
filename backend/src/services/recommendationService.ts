import { Recommendation } from '../models/Recommendation.js';

export class RecommendationService {
  static async getUserRecommendations(userId: string) {
    return await Recommendation.find({ userId }).sort({ createdAt: -1 });
  }

  static async updateRecommendationStatus(recommendationId: string, userId: string, status: 'pending' | 'in_progress' | 'completed' | 'dismissed') {
    const rec = await Recommendation.findOneAndUpdate(
      { _id: recommendationId, userId },
      { status },
      { new: true }
    );
    if (!rec) throw new Error('Recommendation not found or unauthorized');
    return rec;
  }
}
