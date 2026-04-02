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

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM events ORDER BY event_date ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get all events error:', error);
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

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM religious_services ORDER BY service_time ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get all services error:', error);
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
