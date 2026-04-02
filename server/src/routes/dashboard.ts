import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, getDashboardStats);

export default router;
