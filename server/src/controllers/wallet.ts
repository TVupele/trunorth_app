import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';

export const getMonthlySpending = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    // TODO: implement logic to fetch real data from the database using authReq.user?.userId
    const monthlyData = [
      { month: 'Jan', spending: 45000 },
      { month: 'Feb', spending: 52000 },
      { month: 'Mar', spending: 38000 },
      { month: 'Apr', spending: 61000 },
      { month: 'May', spending: 48000 },
      { month: 'Jun', spending: 55000 },
    ];
    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};
