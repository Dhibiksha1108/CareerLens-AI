import { Router } from 'express';
import { JobController } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/analyze', JobController.analyzeJob);
router.get('/', JobController.getJobAnalyses);
router.get('/:id', JobController.getJobAnalysisById);

export default router;
