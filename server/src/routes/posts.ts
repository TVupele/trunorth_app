import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getPosts, createPost, uploadImage, likePost, unlikePost, addComment, retweetPost, unretweetPost } from '../controllers/posts';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/', authMiddleware, getPosts);
router.post('/', authMiddleware, createPost);
router.post('/upload', authMiddleware, upload.single('image'), uploadImage);
router.post('/:id/like', authMiddleware, likePost);
router.delete('/:id/like', authMiddleware, unlikePost);
router.post('/:id/comment', authMiddleware, addComment);
router.post('/:id/retweet', authMiddleware, retweetPost);
router.delete('/:id/retweet', authMiddleware, unretweetPost);

export default router;
