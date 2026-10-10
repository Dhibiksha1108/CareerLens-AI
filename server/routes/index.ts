import { Router } from 'express';
import authRoutes from './authRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import skillRoutes from './skillRoutes.js';
import jobRoutes from './jobRoutes.js';
import userRoutes from './userRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import projectRoutes from './projectRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/resumes', resumeRoutes);
router.use('/skills', skillRoutes);
router.use('/jobs', jobRoutes);
router.use('/users', userRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/projects', projectRoutes);

export default router;
