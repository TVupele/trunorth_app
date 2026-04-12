import { Router } from 'express';
import { getPosts, createPost, uploadImage } from '../controllers/posts';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getPosts);
router.post('/', authMiddleware, createPost);
router.post('/upload', authMiddleware, uploadImage);

export default router;
