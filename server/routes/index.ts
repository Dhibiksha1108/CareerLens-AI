import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import skillsRoutes from './skillsRoutes.js';
import jobRoutes from './jobRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resume', resumeRoutes);
router.use('/skills', skillsRoutes);
router.use('/jobs', jobRoutes);

export default router;
