import { Router } from 'express';
import multer from 'multer';
import { getPosts, createPost, uploadImage } from '../controllers/posts';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const upload = multer({ dest: 'uploads/' });

router.get('/', authMiddleware, getPosts);
router.post('/', authMiddleware, createPost);
router.post('/upload', authMiddleware, upload.single('image'), uploadImage);

export default router;
