import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import portfolioRoutes from './portfolioRoutes.js';
import githubRoutes from './githubRoutes.js';
import projectRoutes from './projectRoutes.js';
import jobRoutes from './jobRoutes.js';
import skillRoutes from './skillRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import roadmapRoutes from './roadmapRoutes.js';
import benchmarkingRoutes from './benchmarkingRoutes.js';
import simulatorRoutes from './simulatorRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resume', resumeRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/github', githubRoutes);
router.use('/projects', projectRoutes);
router.use('/jobs', jobRoutes);
router.use('/skills', skillRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/benchmarking', benchmarkingRoutes);
router.use('/simulator', simulatorRoutes);

export default router;
