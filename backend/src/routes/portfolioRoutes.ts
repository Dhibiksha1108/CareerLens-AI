import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/analyze', PortfolioController.analyzePortfolio);
router.get('/me', PortfolioController.getMyPortfolios);

export default router;
