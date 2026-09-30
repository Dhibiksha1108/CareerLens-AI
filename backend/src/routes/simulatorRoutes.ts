import { Router } from 'express';
import { SimulatorController } from '../controllers/simulatorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/simulate', SimulatorController.simulate);

export default router;
