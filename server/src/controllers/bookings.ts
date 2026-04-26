import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getMyBookings = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;

  try {
    // Fetch bookings for the user with event details
    const result = await query(
      `SELECT 
         b.id as booking_id,
         b.quantity,
         b.total_amount,
         b.qr_code,
         b.booking_date,
         b.status,
         e.id as event_id,
         e.title as event_title,
         e.image_url as event_image,
         e.event_date,
         e.location,
         e.ticket_price
       FROM bookings b
       JOIN events e ON b.entity_id = e.id
       WHERE b.user_id = $1 AND b.entity_type = 'event'
       ORDER BY b.booking_date DESC`,
      [userId]
    );

    const bookings = result.rows.map((row: any) => ({
      id: row.booking_id,
      eventId: row.event_id,
      eventTitle: row.event_title,
      eventImage: row.event_image,
      eventDate: row.event_date,
      eventLocation: row.location,
      quantity: row.quantity,
      totalAmount: parseFloat(row.total_amount),
      qrCode: row.qr_code,
      purchaseDate: row.booking_date,
      ticketPrice: parseFloat(row.ticket_price),
    }));

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error while fetching bookings.' });
  }
};
