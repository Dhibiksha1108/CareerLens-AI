import { Router } from 'express';
import { ResumeController } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResumeSingle } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(protect);

router.post('/upload', uploadResumeSingle, ResumeController.uploadResume);
router.get('/me', ResumeController.getMyResumes);
router.post('/ats/analyze', ResumeController.analyzeAts);
router.get('/:id/ats', ResumeController.getAtsAnalysis);
router.post('/:id/ats', ResumeController.analyzeAts);
router.get('/:id/analysis', ResumeController.getResumeAnalysis);
router.post('/:id/analyze', ResumeController.analyzeResume);
router.get('/:id', ResumeController.getResumeById);
router.delete('/:id', ResumeController.deleteResume);

export default router;
