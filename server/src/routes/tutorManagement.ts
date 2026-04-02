import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getTutorProfile, updateTutorProfile, getTutorBookings, getTutorStats
} from '../controllers/tutorManagement';

const router = Router();

router.get('/profile', authMiddleware, getTutorProfile);
router.put('/profile', authMiddleware, updateTutorProfile);
router.get('/bookings', authMiddleware, getTutorBookings);
router.get('/stats', authMiddleware, getTutorStats);

export default router;
