import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM events ORDER BY event_date ASC');
    const events = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image_url,
      date: r.event_date,
      time: new Date(r.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      location: r.location,
      ticketPrice: parseFloat(r.ticket_price) || 0,
      currency: 'NGN',
      availableSeats: r.available_seats || 0,
      totalSeats: r.total_seats || 0,
      category: r.category || 'General',
      description: r.description,
      isExternal: r.is_external || false,
      externalUrl: r.external_url || null,
    }));
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error while fetching events.' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const r = result.rows[0];
    res.json({
      id: r.id,
      title: r.title,
      image: r.image_url,
      date: r.event_date,
      time: new Date(r.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      location: r.location,
      ticketPrice: parseFloat(r.ticket_price) || 0,
      currency: 'NGN',
      availableSeats: r.available_seats || 0,
      totalSeats: r.total_seats || 0,
      category: r.category || 'General',
      description: r.description,
      isExternal: r.is_external || false,
      externalUrl: r.external_url || null,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const { title, description, image_url, event_date, location, ticket_price, total_seats, category, is_external, external_url } = req.body;
  if (!title || !event_date) {
    return res.status(400).json({ error: 'Title and event date are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO events (title, description, image_url, event_date, location, ticket_price, total_seats, available_seats, category, is_external, external_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10) RETURNING *`,
      [title, description, image_url || null, event_date, location, ticket_price || 0, total_seats || 0, category || 'General', is_external || false, external_url || null]
    );

    const event = result.rows[0];

    // Automatically create an ad banner for the event
    const bannerImageUrl = event.image_url || '/placeholder.svg';
    await query(
      `INSERT INTO ad_banners (title, description, type, image_url, cta, link, is_active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        event.title,
        event.description || `Join us for ${event.title}`,
        'event',
        bannerImageUrl,
        'View Event',
        '/events',
        true,
        0
      ]
    );

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const { title, description, image_url, event_date, location, ticket_price, total_seats, available_seats, category, is_external, external_url } = req.body;
  try {
    const result = await query(
      `UPDATE events SET title = COALESCE($1, title), description = COALESCE($2, description),
       image_url = COALESCE($3, image_url), event_date = COALESCE($4, event_date),
       location = COALESCE($5, location), ticket_price = COALESCE($6, ticket_price),
       total_seats = COALESCE($7, total_seats), available_seats = COALESCE($8, available_seats),
       category = COALESCE($9, category), is_external = COALESCE($10, is_external),
       external_url = COALESCE($11, external_url)
       WHERE id = $12 RETURNING *`,
      [title, description, image_url, event_date, location, ticket_price, total_seats, available_seats, category, is_external, external_url, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM events WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const purchaseTicket = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { event_id, quantity } = req.body;

  if (!event_id || !quantity) {
    return res.status(400).json({ error: 'Event ID and quantity are required.' });
  }

  try {
    const eventResult = await query('SELECT * FROM events WHERE id = $1', [event_id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const event = eventResult.rows[0];

    if (event.available_seats < quantity) {
      return res.status(400).json({ error: 'Not enough seats available.' });
    }

    // Check if user already booked this event
    const existingBooking = await query(
      'SELECT id FROM bookings WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3',
      [userId, 'event', event_id]
    );
    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ error: 'You have already booked this event.' });
    }

    const totalAmount = parseFloat(event.ticket_price) * quantity;

    const walletResult = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0 || parseFloat(walletResult.rows[0].balance) < totalAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance.' });
    }

    const wallet = walletResult.rows[0];

    // Start transaction
    await query('BEGIN');
    try {
      // Deduct from wallet
      await query('UPDATE wallets SET balance = balance - $1 WHERE id = $2', [totalAmount, wallet.id]);

      // Create payment transaction
      const txResult = await query(
        `INSERT INTO transactions (wallet_id, type, status, amount, description, related_entity_id) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [wallet.id, 'payment', 'completed', totalAmount, `Ticket purchase for ${event.title} (${quantity}x)`, event_id]
      );
      const transactionId = txResult.rows[0].id;

      // Decrease available seats
      await query('UPDATE events SET available_seats = available_seats - $1 WHERE id = $2', [quantity, event_id]);

      // Generate unique QR code
      const qrCode = `TN-${event_id.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      // Create booking
      await query(
        `INSERT INTO bookings (user_id, entity_type, entity_id, quantity, total_amount, qr_code, transaction_id, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, 'event', event_id, quantity, totalAmount, qrCode, transactionId, 'confirmed']
      );

      await query('COMMIT');

      res.status(200).json({ 
        message: 'Ticket purchased successfully!', 
        totalAmount,
        bookingId: qrCode
      });
    } catch (innerError) {
      await query('ROLLBACK');
      throw innerError;
    }
  } catch (error) {
    console.error('Purchase ticket error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
