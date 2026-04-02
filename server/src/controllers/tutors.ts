import { Request, Response } from 'express';
import { query } from '../config/db';

export const getTutors = async (req: Request, res: Response) => {
  try {
    const tutorsResult = await query(`
      SELECT 
        t.id, t.subjects, t.hourly_rate, t.rating, t.experience_level, t.is_available,
        u.id as user_id, u.full_name, u.avatar_url, u.bio
      FROM tutors t
      JOIN users u ON t.user_id = u.id
    `);
    
    const tutors = tutorsResult.rows.map(tutor => ({
        id: tutor.id,
        name: tutor.full_name,
        avatar: tutor.avatar_url,
        subjects: tutor.subjects,
        hourlyRate: tutor.hourly_rate,
        currency: 'NGN', // Assuming NGN for now
        rating: tutor.rating,
        totalReviews: 0, // This should be calculated or stored
        bio: tutor.bio,
        available: tutor.is_available,
        experience: tutor.experience_level,
    }));

    res.json(tutors);
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ error: 'Internal server error while fetching tutors.' });
  }
};
