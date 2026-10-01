import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.put('/roles', UserController.updateTargetRoles);

export default router;
