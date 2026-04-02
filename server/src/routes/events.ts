import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent, purchaseTicket } from '../controllers/events';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authMiddleware, createEvent);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);
router.post('/purchase', authMiddleware, purchaseTicket);

export default router;
