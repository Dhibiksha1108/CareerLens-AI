import { Router } from 'express';
import { BenchmarkingController } from '../controllers/benchmarkingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', BenchmarkingController.getBenchmarks);

export default router;
