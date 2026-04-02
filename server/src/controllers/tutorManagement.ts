import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getTutorProfile = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const result = await query(`
      SELECT t.*, u.full_name, u.avatar_url, u.bio
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = $1
    `, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor profile not found.' });
    }
    const t = result.rows[0];
    res.json({
      id: t.id,
      name: t.full_name,
      avatar: t.avatar_url,
      subjects: t.subjects || [],
      hourlyRate: parseFloat(t.hourly_rate) || 0,
      rating: parseFloat(t.rating) || 0,
      bio: t.bio,
      available: t.is_available,
      experience: t.experience_level,
    });
  } catch (error) {
    console.error('Get tutor profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateTutorProfile = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { subjects, hourly_rate, experience_level, is_available } = req.body;
  try {
    const result = await query(
      `UPDATE tutors SET subjects = COALESCE($1, subjects), hourly_rate = COALESCE($2, hourly_rate),
       experience_level = COALESCE($3, experience_level), is_available = COALESCE($4, is_available)
       WHERE user_id = $5 RETURNING *`,
      [subjects, hourly_rate, experience_level, is_available, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor profile not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tutor profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getTutorBookings = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const tutorResult = await query('SELECT id FROM tutors WHERE user_id = $1', [userId]);
    if (tutorResult.rows.length === 0) {
      return res.json([]);
    }
    const tutorId = tutorResult.rows[0].id;
    const result = await query(`
      SELECT b.*, u.full_name as student_name, u.avatar_url as student_avatar
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.entity_type = 'tutoring' AND b.entity_id = $1
      ORDER BY b.booking_date DESC
    `, [tutorId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tutor bookings error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getTutorStats = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const tutorResult = await query('SELECT id FROM tutors WHERE user_id = $1', [userId]);
    if (tutorResult.rows.length === 0) {
      return res.json({ totalBookings: 0, totalEarnings: 0, rating: 0 });
    }
    const tutorId = tutorResult.rows[0].id;

    const bookingsResult = await query(
      "SELECT COUNT(*) as count FROM bookings WHERE entity_type = 'tutoring' AND entity_id = $1",
      [tutorId]
    );
    const earningsResult = await query(`
      SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
      JOIN wallets w ON t.wallet_id = w.id
      WHERE w.user_id = $1 AND t.type = 'receive' AND t.status = 'completed'
    `, [userId]);
    const tutorData = await query('SELECT rating FROM tutors WHERE user_id = $1', [userId]);

    res.json({
      totalBookings: parseInt(bookingsResult.rows[0]?.count || '0'),
      totalEarnings: parseFloat(earningsResult.rows[0]?.total || '0'),
      rating: parseFloat(tutorData.rows[0]?.rating || '0'),
    });
  } catch (error) {
    console.error('Get tutor stats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
