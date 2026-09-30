import { Router } from 'express';
import { JobController } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/analyze', JobController.analyzeJob);
router.get('/', JobController.getJobs);
router.get('/:id', JobController.getJobById);

export default router;
