import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getReligiousServices, getReligiousServiceById, createReligiousService,
  updateReligiousService, deleteReligiousService, registerForService, getMyServiceRegistrations
} from '../controllers/religiousServices';

const router = Router();

router.get('/', getReligiousServices);
router.get('/my-registrations', authMiddleware, getMyServiceRegistrations);
router.get('/:id', getReligiousServiceById);
router.post('/', authMiddleware, createReligiousService);
router.put('/:id', authMiddleware, updateReligiousService);
router.delete('/:id', authMiddleware, deleteReligiousService);
router.post('/register', authMiddleware, registerForService);

export default router;
