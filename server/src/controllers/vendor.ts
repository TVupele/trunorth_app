import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getVendorProducts = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const result = await query(
      'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createVendorProduct = async (req: Request, res: Response) => {
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
      [userId, name, description, image_url || null, price, currency || 'NGN', category || 'General', stock_quantity || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create vendor product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateVendorProduct = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { name, description, image_url, price, currency, category, stock_quantity } = req.body;
  try {
    const result = await query(
      `UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description),
       image_url = COALESCE($3, image_url), price = COALESCE($4, price),
       currency = COALESCE($5, currency), category = COALESCE($6, category),
       stock_quantity = COALESCE($7, stock_quantity)
       WHERE id = $8 AND vendor_id = $9 RETURNING *`,
      [name, description, image_url, price, currency, category, stock_quantity, req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or not owned by you.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update vendor product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteVendorProduct = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const result = await query(
      'DELETE FROM products WHERE id = $1 AND vendor_id = $2 RETURNING id',
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or not owned by you.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete vendor product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getVendorStats = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const productsResult = await query('SELECT COUNT(*) as count FROM products WHERE vendor_id = $1', [userId]);
    const ordersResult = await query(`
      SELECT COUNT(*) as count FROM bookings b
      JOIN products p ON b.entity_id = p.id
      WHERE p.vendor_id = $1 AND b.entity_type = 'product'
    `, [userId]);
    const revenueResult = await query(`
      SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
      JOIN wallets w ON t.wallet_id = w.id
      WHERE w.user_id = $1 AND t.type = 'receive' AND t.status = 'completed'
    `, [userId]);

    res.json({
      totalProducts: parseInt(productsResult.rows[0]?.count || '0'),
      totalOrders: parseInt(ordersResult.rows[0]?.count || '0'),
      totalRevenue: parseFloat(revenueResult.rows[0]?.total || '0'),
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
