import { Request, Response } from 'express';
import { query } from '../config/db';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const postsResult = await query(`
      SELECT 
        p.id, p.content, p.image_url, p.likes_count, p.comments_count, p.created_at,
        u.id as user_id, u.full_name, u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(postsResult.rows);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error while fetching posts.' });
  }
};
