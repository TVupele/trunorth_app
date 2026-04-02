import { Router } from 'express';
import { getPosts } from '../controllers/posts';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getPosts);

export default router;
