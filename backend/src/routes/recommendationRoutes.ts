import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', RecommendationController.getRecommendations);
router.patch('/:id/status', RecommendationController.updateStatus);

export default router;
