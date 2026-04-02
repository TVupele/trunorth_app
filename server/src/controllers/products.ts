import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*, u.full_name as seller_name
      FROM products p
      LEFT JOIN users u ON p.vendor_id = u.id
      ORDER BY p.created_at DESC
    `);
    const products = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      image: r.image_url,
      price: parseFloat(r.price),
      currency: r.currency,
      seller: r.seller_name || 'Unknown',
      sellerId: r.vendor_id,
      rating: parseFloat(r.rating) || 0,
      reviews: 0,
      category: r.category,
      stock: r.stock_quantity,
      description: r.description,
    }));
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error while fetching products.' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*, u.full_name as seller_name
      FROM products p
      LEFT JOIN users u ON p.vendor_id = u.id
      WHERE p.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const r = result.rows[0];
    res.json({
      id: r.id,
      name: r.name,
      image: r.image_url,
      price: parseFloat(r.price),
      currency: r.currency,
      seller: r.seller_name || 'Unknown',
      sellerId: r.vendor_id,
      rating: parseFloat(r.rating) || 0,
      reviews: 0,
      category: r.category,
      stock: r.stock_quantity,
      description: r.description,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { name, description, image_url, price, currency, category, stock_quantity } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }

  try {
    const result = await query(
      `INSERT INTO products (vendor_id, name, description, image_url, price, currency, category, stock_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, name, description, image_url || null, price, currency || 'NGN', category, stock_quantity || 0]
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
