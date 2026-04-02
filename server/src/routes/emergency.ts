import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getEmergencyReports, createEmergencyReport, updateEmergencyReportStatus } from '../controllers/emergency';

const router = Router();

router.get('/', authMiddleware, getEmergencyReports);
router.post('/', authMiddleware, createEmergencyReport);
router.put('/:id/status', authMiddleware, updateEmergencyReportStatus);

export default router;
