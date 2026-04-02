import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/express';
import { query } from '../config/db';

const router = Router();

// GET /api/users/profile - Fetches the logged-in user's profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication error.' });
  }

  try {
    const userResult = await query(
      'SELECT id, email, full_name, avatar_url, bio, phone_number, role, is_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userProfile = userResult.rows[0];

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Internal server error while fetching profile.' });
  }
});

// PUT /api/users/profile - Updates the logged-in user's profile
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const { fullName, bio, phoneNumber } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication error.' });
    }

    try {
        const updateResult = await query(
            'UPDATE users SET full_name = $1, bio = $2, phone_number = $3, updated_at = now() WHERE id = $4 RETURNING id, email, full_name, avatar_url, bio, phone_number, role, is_verified, created_at, updated_at',
            [fullName, bio, phoneNumber, userId]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found or could not be updated.' });
        }

        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error while updating profile.' });
    }
});

export default router;
