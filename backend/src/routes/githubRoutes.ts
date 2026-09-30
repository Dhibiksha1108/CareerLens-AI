import { Router } from 'express';
import { GitHubController } from '../controllers/githubController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/sync', GitHubController.syncProfile);
router.get('/me', GitHubController.getMyProfile);

export default router;
