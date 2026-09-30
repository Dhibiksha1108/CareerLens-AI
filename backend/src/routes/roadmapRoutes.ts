import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', RoadmapController.getRoadmap);
router.post('/generate', RoadmapController.generateRoadmap);
router.patch('/stage/:id', RoadmapController.updateStage);

export default router;
