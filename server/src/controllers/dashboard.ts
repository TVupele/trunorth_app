import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    // TODO: implement logic to fetch real data from the database using authReq.user?.userId
    const stats = {
      unreadMessages: 12,
      upcomingBookings: 3,
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};
