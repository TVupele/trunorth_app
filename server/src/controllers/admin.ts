import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const vendorsResult = await query("SELECT COUNT(*) as count FROM users WHERE role = 'vendor'");
    const tutorsResult = await query("SELECT COUNT(*) as count FROM users WHERE role = 'tutor'");
    const productsResult = await query('SELECT COUNT(*) as count FROM products');
    const eventsResult = await query('SELECT COUNT(*) as count FROM events');
    const campaignsResult = await query('SELECT COUNT(*) as count FROM campaigns WHERE is_active = true');
    const servicesResult = await query('SELECT COUNT(*) as count FROM religious_services');
    const bookingsResult = await query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'");
    const donationsResult = await query('SELECT COALESCE(SUM(amount), 0) as total FROM donations');
    const revenueResult = await query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'payment' AND status = 'completed'");
    const pendingResult = await query("SELECT COUNT(*) as count FROM pending_requests WHERE status = 'pending'");

    res.json({
      totalUsers: parseInt(usersResult.rows[0]?.count || '0'),
      totalVendors: parseInt(vendorsResult.rows[0]?.count || '0'),
      totalTutors: parseInt(tutorsResult.rows[0]?.count || '0'),
      totalProducts: parseInt(productsResult.rows[0]?.count || '0'),
      totalEvents: parseInt(eventsResult.rows[0]?.count || '0'),
      activeCampaigns: parseInt(campaignsResult.rows[0]?.count || '0'),
      totalServices: parseInt(servicesResult.rows[0]?.count || '0'),
      totalBookings: parseInt(bookingsResult.rows[0]?.count || '0'),
      totalDonations: parseFloat(donationsResult.rows[0]?.total || '0'),
      totalRevenue: parseFloat(revenueResult.rows[0]?.total || '0'),
      pendingApprovals: parseInt(pendingResult.rows[0]?.count || '0'),
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT id, email, full_name, avatar_url, role, is_verified, created_at
      FROM users ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required.' });
  }
  try {
    const result = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, role',
      [role, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (role === 'tutor') {
      const existing = await query('SELECT id FROM tutors WHERE user_id = $1', [userId]);
      if (existing.rows.length === 0) {
        await query(
          'INSERT INTO tutors (user_id, subjects, hourly_rate, experience_level) VALUES ($1, $2, $3, $4)',
          [userId, '{}', 0, 'Beginner']
        );
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*, u.full_name as seller_name
      FROM products p
      LEFT JOIN users u ON p.vendor_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, image_url, price, currency, category, stock_quantity } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }
  try {
    const adminResult = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const vendorId = adminResult.rows[0]?.id;
    
    const result = await query(
      `INSERT INTO products (vendor_id, name, description, image_url, price, currency, category, stock_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [vendorId, name, description, image_url, price, currency || 'NGN', category || 'General', stock_quantity || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { name, description, image_url, price, currency, category, stock_quantity } = req.body;
  try {
    const result = await query(
      `UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description),
       image_url = COALESCE($3, image_url), price = COALESCE($4, price),
       currency = COALESCE($5, currency), category = COALESCE($6, category),
       stock_quantity = COALESCE($7, stock_quantity)
       WHERE id = $8 RETURNING *`,
      [name, description, image_url, price, currency, category, stock_quantity, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM events ORDER BY event_date ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const { title, description, image_url, event_date, location, ticket_price, total_seats, category } = req.body;
  if (!title || !event_date) {
    return res.status(400).json({ error: 'Title and event date are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO events (title, description, image_url, event_date, location, ticket_price, total_seats, available_seats, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8) RETURNING *`,
      [title, description, image_url, event_date, location, ticket_price || 0, total_seats || 0, category || 'General']
    );
    
    const event = result.rows[0];
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
  const { title, description, image_url, event_date, location, ticket_price, total_seats, available_seats, category } = req.body;
  try {
    const result = await query(
      `UPDATE events SET title = COALESCE($1, title), description = COALESCE($2, description),
       image_url = COALESCE($3, image_url), event_date = COALESCE($4, event_date),
       location = COALESCE($5, location), ticket_price = COALESCE($6, ticket_price),
       total_seats = COALESCE($7, total_seats), available_seats = COALESCE($8, available_seats),
       category = COALESCE($9, category)
       WHERE id = $10 RETURNING *`,
      [title, description, image_url, event_date, location, ticket_price, total_seats, available_seats, category, req.params.id]
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

export const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT c.*, u.full_name as organizer_name
      FROM campaigns c
      LEFT JOIN users u ON c.organizer_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all campaigns error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  const { title, description, image_url, goal_amount, end_date, is_active, category } = req.body;
  if (!title || !goal_amount) {
    return res.status(400).json({ error: 'Title and goal amount are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO campaigns (organizer_id, title, description, image_url, goal_amount, end_date, is_active, category)
       VALUES ((SELECT id FROM users WHERE role = 'admin' LIMIT 1), $1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, image_url, goal_amount, end_date, is_active ?? true, category || 'General']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateCampaign = async (req: Request, res: Response) => {
  const { title, description, image_url, goal_amount, end_date, is_active, category } = req.body;
  try {
    const result = await query(
      `UPDATE campaigns SET title = COALESCE($1, title), description = COALESCE($2, description),
       image_url = COALESCE($3, image_url), goal_amount = COALESCE($4, goal_amount),
       end_date = COALESCE($5, end_date), is_active = COALESCE($6, is_active), category = COALESCE($7, category)
       WHERE id = $8 RETURNING *`,
      [title, description, image_url, goal_amount, end_date, is_active, category, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM campaigns WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    res.json({ message: 'Campaign deleted successfully.' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM religious_services ORDER BY service_time ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createService = async (req: Request, res: Response) => {
  const { name, type, venue, service_time, denomination, capacity, description, organizer } = req.body;
  if (!name || !service_time) {
    return res.status(400).json({ error: 'Name and service time are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO religious_services (name, type, venue, service_time, denomination, capacity, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, type || 'other', venue, service_time, denomination, capacity || 0, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateService = async (req: Request, res: Response) => {
  const { name, type, venue, service_time, denomination, capacity, description } = req.body;
  try {
    const result = await query(
      `UPDATE religious_services SET name = COALESCE($1, name), type = COALESCE($2, type),
       venue = COALESCE($3, venue), service_time = COALESCE($4, service_time),
       denomination = COALESCE($5, denomination), capacity = COALESCE($6, capacity),
       description = COALESCE($7, description)
       WHERE id = $8 RETURNING *`,
      [name, type, venue, service_time, denomination, capacity, description, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM religious_services WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const requestVendorApproval = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const existingPending = await query(
      "SELECT id FROM pending_requests WHERE user_id = $1 AND request_type = 'vendor' AND status = 'pending'",
      [userId]
    );
    if (existingPending.rows.length > 0) {
      return res.status(400).json({ error: 'Vendor approval request already pending.' });
    }

    await query(
      "INSERT INTO pending_requests (user_id, request_type, status) VALUES ($1, 'vendor', 'pending')",
      [userId]
    );
    res.json({ message: 'Vendor approval request submitted. Waiting for admin approval.' });
  } catch (error) {
    console.error('Vendor approval request error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const requestTutorApproval = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const existingPending = await query(
      "SELECT id FROM pending_requests WHERE user_id = $1 AND request_type = 'tutor' AND status = 'pending'",
      [userId]
    );
    if (existingPending.rows.length > 0) {
      return res.status(400).json({ error: 'Tutor approval request already pending.' });
    }

    await query(
      "INSERT INTO pending_requests (user_id, request_type, status) VALUES ($1, 'tutor', 'pending')",
      [userId]
    );
    res.json({ message: 'Tutor approval request submitted. Waiting for admin approval.' });
  } catch (error) {
    console.error('Tutor approval request error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT pr.id, pr.request_type, pr.status, pr.created_at, u.id as user_id, u.email, u.full_name
      FROM pending_requests pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.status = 'pending'
      ORDER BY pr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const approveVendorRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  try {
    const pendingResult = await query(
      "SELECT * FROM pending_requests WHERE id = $1 AND request_type = 'vendor' AND status = 'pending'",
      [requestId]
    );
    if (pendingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending request not found.' });
    }

    const userId = pendingResult.rows[0].user_id;

    await query("UPDATE users SET role = 'vendor' WHERE id = $1", [userId]);
    await query(
      "UPDATE pending_requests SET status = 'approved', updated_at = now() WHERE id = $1",
      [requestId]
    );
    res.json({ message: 'Vendor request approved.' });
  } catch (error) {
    console.error('Approve vendor request error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const approveTutorRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  try {
    const pendingResult = await query(
      "SELECT * FROM pending_requests WHERE id = $1 AND request_type = 'tutor' AND status = 'pending'",
      [requestId]
    );
    if (pendingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending request not found.' });
    }

    const userId = pendingResult.rows[0].user_id;

    await query("UPDATE users SET role = 'tutor' WHERE id = $1", [userId]);
    await query(
      "INSERT INTO tutors (user_id, subjects, hourly_rate, experience_level) VALUES ($1, '{}', 0, 'Beginner')",
      [userId]
    );
    await query(
      "UPDATE pending_requests SET status = 'approved', updated_at = now() WHERE id = $1",
      [requestId]
    );
    res.json({ message: 'Tutor request approved.' });
  } catch (error) {
    console.error('Approve tutor request error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  try {
    const result = await query(
      "UPDATE pending_requests SET status = 'rejected', updated_at = now() WHERE id = $1 AND status = 'pending' RETURNING id",
      [requestId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pending request not found.' });
    }
    res.json({ message: 'Request rejected.' });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getAllAdBanners = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM ad_banners ORDER BY display_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get all ad banners error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createAdBanner = async (req: Request, res: Response) => {
  const { title, description, type, image_url, cta, link, is_active, display_order } = req.body;
  try {
    const result = await query(
      `INSERT INTO ad_banners (title, description, type, image_url, cta, link, is_active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, type, image_url, cta, link, is_active ?? true, display_order ?? 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create ad banner error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateAdBanner = async (req: Request, res: Response) => {
  const { bannerId } = req.params;
  const { title, description, type, image_url, cta, link, is_active, display_order } = req.body;
  try {
    const result = await query(
      `UPDATE ad_banners SET title = $1, description = $2, type = $3, image_url = $4, cta = $5, link = $6, is_active = $7, display_order = $8, updated_at = now()
       WHERE id = $9 RETURNING *`,
      [title, description, type, image_url, cta, link, is_active, display_order ?? 0, bannerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad banner not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update ad banner error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteAdBanner = async (req: Request, res: Response) => {
  const { bannerId } = req.params;
  try {
    const result = await query('DELETE FROM ad_banners WHERE id = $1 RETURNING id', [bannerId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad banner not found.' });
    }
    res.json({ message: 'Ad banner deleted successfully.' });
  } catch (error) {
    console.error('Delete ad banner error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
