import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getVendorProducts, createVendorProduct, updateVendorProduct,
  deleteVendorProduct, getVendorStats
} from '../controllers/vendor';

const router = Router();

router.get('/stats', authMiddleware, getVendorStats);
router.get('/products', authMiddleware, getVendorProducts);
router.post('/products', authMiddleware, createVendorProduct);
router.put('/products/:id', authMiddleware, updateVendorProduct);
router.delete('/products/:id', authMiddleware, deleteVendorProduct);

export default router;
