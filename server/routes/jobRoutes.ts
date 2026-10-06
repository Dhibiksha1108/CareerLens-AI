import { Router } from 'express';
import { JobController } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all job routes
router.use(protect);

router.get('/', JobController.getJobMatches);
router.post('/', JobController.analyzeJobMatch);
router.post('/analyze', JobController.analyzeJobMatch);
router.post('/match', JobController.analyzeJobMatch);
router.get('/matches', JobController.getJobMatches);
router.get('/matches/:id', JobController.getJobMatchById);
router.get('/:id', JobController.getJobMatchById);

export default router;
