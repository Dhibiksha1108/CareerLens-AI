import { Router, Response } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { AuthRequest } from '../types/index.js';
import { SkillService } from '../services/skillService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = Router();
router.use(protect);

router.get('/evidence', async (req: AuthRequest, res: Response) => {
  try {
    const evidences = await SkillService.getSkillEvidences(req.user!.userId);
    sendSuccess(res, 'Skill evidence retrieved successfully', evidences);
  } catch (error: any) {
    sendError(res, error.message, null, 400);
  }
});

router.post('/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { skill } = req.body;
    if (!skill) {
      sendError(res, 'Skill name is required', null, 400);
      return;
    }
    const evidence = await SkillService.verifySkillEvidence(req.user!.userId, skill);
    sendSuccess(res, 'Skill evidence verified successfully', evidence);
  } catch (error: any) {
    sendError(res, error.message, null, 400);
  }
});

export default router;
