import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);

router.get('/profile', UserController.getProfile);
router.get('/dashboard', UserController.getDashboardSummary);
router.get('/analytics', UserController.getCareerAnalytics);
router.put('/profile', UserController.updateProfile);
router.put('/roles', UserController.updateTargetRoles);

export default router;
