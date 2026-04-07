import { Router } from 'express';

const router = Router();

// Get notifications for current user
router.get('/', (req, res) => {
  // Placeholder - return empty array for now
  res.json([]);
});

export default router;