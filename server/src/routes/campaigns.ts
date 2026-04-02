import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign, donateToCampaign, getDonationHistory } from '../controllers/campaigns';

const router = Router();

router.get('/', getCampaigns);
router.get('/history', authMiddleware, getDonationHistory);
router.get('/:id', getCampaignById);
router.post('/', authMiddleware, createCampaign);
router.put('/:id', authMiddleware, updateCampaign);
router.delete('/:id', authMiddleware, deleteCampaign);
router.post('/donate', authMiddleware, donateToCampaign);

export default router;
