import { Router } from 'express';
import authRoutes from './authRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import skillRoutes from './skillRoutes.js';
import jobRoutes from './jobRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/skills', skillRoutes);
router.use('/jobs', jobRoutes);
router.use('/users', userRoutes);

export default router;
