import { Router } from 'express';
import { getTravelPackages, bookTravelPackage } from '../controllers/travel';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getTravelPackages);
router.post('/book', authMiddleware, bookTravelPackage);

export default router;
