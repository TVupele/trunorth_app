import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

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

export const createPost = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { content, image_url } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required.' });
  }
  
  try {
    const result = await query(
      `INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3) RETURNING *`,
      [userId, content, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const uploadImage = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  
  if (!authReq.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }
  
  try {
    const imageUrl = `/uploads/${authReq.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
