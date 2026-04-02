import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getTravelPackages = async (req: Request, res: Response) => {
  try {
    const packagesResult = await query('SELECT * FROM travel_packages');
    res.json(packagesResult.rows);
  } catch (error) {
    console.error('Get travel packages error:', error);
    res.status(500).json({ error: 'Internal server error while fetching travel packages.' });
  }
};

export const bookTravelPackage = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { packageId, travelerCount, bookingDate } = req.body;

  if (!packageId || !travelerCount || !bookingDate) {
    return res.status(400).json({ error: 'Missing required booking information.' });
  }

  try {
    // TODO: Implement the actual booking logic here.
    // 1. Fetch package details to get the price.
    // 2. Calculate total cost.
    // 3. Check if user has enough balance in their wallet.
    // 4. Create a transaction to deduct the amount from the user's wallet.
    // 5. Create a booking record in the 'bookings' table.
    // 6. Return a success response.

    res.status(200).json({ message: 'Booking successful!' });
  } catch (error) {
    console.error('Book travel package error:', error);
    res.status(500).json({ error: 'Internal server error while booking travel package.' });
  }
};
