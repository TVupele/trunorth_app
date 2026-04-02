import { Router } from 'express';
import { getTutors } from '../controllers/tutors';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getTutors);

export default router;
