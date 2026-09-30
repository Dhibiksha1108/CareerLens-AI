import { Router } from 'express';
import { SkillsController } from '../controllers/skillsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/evidence', SkillsController.getEvidence);
router.post('/verify', SkillsController.verifySkill);

export default router;
