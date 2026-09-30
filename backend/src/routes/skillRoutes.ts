import { Router } from 'express';
import { SkillController } from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/evidence', SkillController.getEvidences);
router.post('/verify', SkillController.verifySkill);

export default router;
