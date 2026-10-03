import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);

router.get('/', RecommendationController.getRecommendations);
router.post('/generate', RecommendationController.generateRecommendations);
router.patch('/roadmap/milestone', RecommendationController.updateMilestone);
router.patch('/roadmap/project', RecommendationController.updateProject);

export default router;
