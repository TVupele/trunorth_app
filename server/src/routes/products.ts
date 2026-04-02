import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/products';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
