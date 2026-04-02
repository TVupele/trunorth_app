import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/express';
import { query } from '../config/db';
import { getMonthlySpending } from '../controllers/wallet';

const router = Router();

// GET /api/wallet - Fetches the logged-in user's wallet balance
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;

  try {
    const walletResult = await query(
      'SELECT id, balance, currency, updated_at FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found for this user.' });
    }

    res.status(200).json(walletResult.rows[0]);
  } catch (error) {
    console.error('Fetch wallet error:', error);
    res.status(500).json({ error: 'Internal server error while fetching wallet.' });
  }
});

// GET /api/wallet/transactions - Fetches the user's transaction history
router.get('/transactions', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;

  try {
     const walletResult = await query('SELECT id FROM wallets WHERE user_id = $1', [userId]);
     if (walletResult.rows.length === 0) {
       return res.status(404).json({ error: 'Wallet not found for this user.' });
     }
     const walletId = walletResult.rows[0].id;

    const transactionsResult = await query(
      'SELECT id, type, status, amount, description, created_at FROM transactions WHERE wallet_id = $1 ORDER BY created_at DESC',
      [walletId]
    );

    res.status(200).json(transactionsResult.rows);
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: 'Internal server error while fetching transactions.' });
  }
});

router.get('/monthly-spending', authMiddleware, getMonthlySpending);

export default router;
