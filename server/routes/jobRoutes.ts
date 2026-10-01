import { Router } from 'express';
import { JobController } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all job routes
router.use(protect);

router.post('/match', JobController.analyzeJobMatch);
router.get('/matches', JobController.getJobMatches);
router.get('/matches/:id', JobController.getJobMatchById);

export default router;
