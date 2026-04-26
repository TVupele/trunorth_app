import { Router } from 'express';
import { getMyBookings } from '../controllers/bookings';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get user's event bookings (tickets)
router.get('/event-tickets', authMiddleware, getMyBookings);

export default router;
