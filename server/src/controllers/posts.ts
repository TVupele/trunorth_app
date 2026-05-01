import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const postsResult = await query(`
      SELECT 
        p.id, p.content, p.image_url, p.likes_count, p.comments_count, p.retweets_count, p.created_at,
        u.id as user_id, u.full_name, u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    const posts = await Promise.all(
      postsResult.rows.map(async (post) => {
        // Check if current user liked this post
        const likeResult = await query(
          'SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2',
          [userId, post.id]
        );
        const isLiked = likeResult.rows.length > 0;

        // Check if current user retweeted this post
        const retweetResult = await query(
          'SELECT 1 FROM post_retweets WHERE user_id = $1 AND post_id = $2',
          [userId, post.id]
        );
        const isRetweeted = retweetResult.rows.length > 0;

        // Fetch comments for this post with user info
        const commentsResult = await query(
          `SELECT c.id, c.content, c.created_at, u.id as user_id, u.full_name, u.avatar_url
           FROM comments c
           JOIN users u ON c.user_id = u.id
           WHERE c.post_id = $1
           ORDER BY c.created_at ASC`,
          [post.id]
        );
        const comments = commentsResult.rows.map((c: any) => {
          // Prepend base URL to avatar if it's a relative upload path
          let avatarUrl = c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.full_name}`;
          if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
            avatarUrl = `${baseUrl}${avatarUrl}`;
          }
          return {
            id: c.id,
            userId: c.user_id,
            userName: c.full_name,
            userAvatar: avatarUrl,
            content: c.content,
            timestamp: c.created_at,
          };
        });

        // Prepend base URL to user avatar if it's a relative upload path
        let userAvatarUrl = post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.full_name}`;
        if (userAvatarUrl && userAvatarUrl.startsWith('/uploads/')) {
          userAvatarUrl = `${baseUrl}${userAvatarUrl}`;
        }

        return {
          id: post.id,
          userId: post.user_id,
          userName: post.full_name,
          userAvatar: userAvatarUrl,
          content: post.content,
          imageUrl: post.image_url ? (post.image_url.startsWith('http') || post.image_url.startsWith('data:') ? post.image_url : `${baseUrl}${post.image_url}`) : null,
          likes: post.likes_count,
          comments,
          retweets: post.retweets_count,
          isLiked,
          isRetweeted,
          timestamp: post.created_at,
        };
      })
    );

    res.json(posts);
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
      `INSERT INTO posts (user_id, content, image_url, likes_count, comments_count, retweets_count)
       VALUES ($1, $2, $3, 0, 0, 0) RETURNING *`,
      [userId, content, image_url || null]
    );

    const post = result.rows[0];

    // Fetch the post with user info
    const postWithUser = await query(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.comments_count, p.retweets_count, p.created_at,
              u.id as user_id, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [post.id]
    );

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const p = postWithUser.rows[0];
    // Prepend base URL to user avatar if it's a relative upload path
    let userAvatarUrl = p.avatar_url;
    if (userAvatarUrl && userAvatarUrl.startsWith('/uploads/')) {
      userAvatarUrl = `${baseUrl}${userAvatarUrl}`;
    }
    const fullPost = {
      id: p.id,
      user_id: p.user_id,
      full_name: p.full_name,
      avatar_url: userAvatarUrl,
      content: p.content,
      image_url: p.image_url,
      likes_count: p.likes_count,
      comments_count: p.comments_count,
      retweets_count: p.retweets_count,
      created_at: p.created_at,
      imageUrl: p.image_url ? (p.image_url.startsWith('http') || p.image_url.startsWith('data:') ? p.image_url : `${baseUrl}${p.image_url}`) : null,
      isLiked: false,
      isRetweeted: false,
      comments: [],
    };

    res.status(201).json(fullPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const likePost = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const postId = req.params.id;

  try {
    // Check if already liked
    const existing = await query(
      'SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Post already liked.' });
    }

    // Insert like
    await query('INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)', [userId, postId]);

    // Increment likes_count
    await query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [postId]);

    // Return updated count
    const result = await query('SELECT likes_count FROM posts WHERE id = $1', [postId]);
    res.json({ likes: result.rows[0].likes_count, liked: true });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const unlikePost = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const postId = req.params.id;

  try {
    await query('DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    await query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1', [postId]);
    const result = await query('SELECT likes_count FROM posts WHERE id = $1', [postId]);
    res.json({ likes: result.rows[0].likes_count, liked: false });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const retweetPost = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const postId = req.params.id;

  try {
    // Check if already retweeted
    const existing = await query(
      'SELECT 1 FROM post_retweets WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Post already retweeted.' });
    }

    await query('INSERT INTO post_retweets (user_id, post_id) VALUES ($1, $2)', [userId, postId]);
    await query('UPDATE posts SET retweets_count = retweets_count + 1 WHERE id = $1', [postId]);

    const result = await query('SELECT retweets_count FROM posts WHERE id = $1', [postId]);
    res.json({ retweets: result.rows[0].retweets_count, retweeted: true });
  } catch (error) {
    console.error('Retweet post error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const unretweetPost = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const postId = req.params.id;

  try {
    await query('DELETE FROM post_retweets WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    await query('UPDATE posts SET retweets_count = retweets_count - 1 WHERE id = $1', [postId]);

    const result = await query('SELECT retweets_count FROM posts WHERE id = $1', [postId]);
    res.json({ retweets: result.rows[0].retweets_count, retweeted: false });
  } catch (error) {
    console.error('Unretweet post error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const postId = req.params.id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content is required.' });
  }

  try {
    // Insert comment
    const result = await query(
      `INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [postId, userId, content.trim()]
    );

    // Increment comments_count
    await query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);

    // Fetch the created comment with user info
    const commentResult = await query(
      `SELECT c.*, u.full_name as userName, u.avatar_url as userAvatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );

    // Return updated comment count and the new comment
    const postResult = await query('SELECT comments_count FROM posts WHERE id = $1', [postId]);

    const comment = commentResult.rows[0];
    res.status(201).json({
      comment: {
        id: comment.id,
        userId: comment.user_id,
        userName: comment.userName,
        userAvatar: comment.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`,
        content: comment.content,
        timestamp: comment.created_at,
      },
      comments: postResult.rows[0].comments_count,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const uploadImage = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  
  if (!authReq.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }
  
  try {
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    // Return the full URL
    const imageUrl = `${baseUrl}/uploads/${authReq.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
