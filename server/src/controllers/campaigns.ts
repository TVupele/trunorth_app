import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT c.*, u.full_name as organizer_name
      FROM campaigns c
      LEFT JOIN users u ON c.organizer_id = u.id
      WHERE c.is_active = true
      ORDER BY c.created_at DESC
    `);
    const campaigns = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image_url,
      description: r.description,
      goal: parseFloat(r.goal_amount),
      raised: parseFloat(r.raised_amount),
      currency: 'NGN',
      donors: 0,
      category: r.category || 'General',
      endDate: r.end_date,
      organizer: r.organizer_name || 'Unknown',
    }));
    // Get donor counts
    for (const campaign of campaigns) {
      const donorResult = await query(
        'SELECT COUNT(*) as count FROM donations WHERE campaign_id = $1',
        [campaign.id]
      );
      campaign.donors = parseInt(donorResult.rows[0]?.count || '0');
    }
    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Internal server error while fetching campaigns.' });
  }
};

export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT c.*, u.full_name as organizer_name
      FROM campaigns c
      LEFT JOIN users u ON c.organizer_id = u.id
      WHERE c.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    const r = result.rows[0];
    const donorResult = await query('SELECT COUNT(*) as count FROM donations WHERE campaign_id = $1', [r.id]);
    res.json({
      id: r.id,
      title: r.title,
      image: r.image_url,
      description: r.description,
      goal: parseFloat(r.goal_amount),
      raised: parseFloat(r.raised_amount),
      currency: 'NGN',
      donors: parseInt(donorResult.rows[0]?.count || '0'),
      category: r.category || 'General',
      endDate: r.end_date,
      organizer: r.organizer_name || 'Unknown',
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { title, description, image_url, goal_amount, end_date, category } = req.body;
  if (!title || !goal_amount) {
    return res.status(400).json({ error: 'Title and goal amount are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO campaigns (organizer_id, title, description, image_url, goal_amount, end_date, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, title, description, image_url || null, goal_amount, end_date || null, category || 'General']
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

export const donateToCampaign = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { campaign_id, amount, is_anonymous } = req.body;

  if (!campaign_id || !amount) {
    return res.status(400).json({ error: 'Campaign ID and amount are required.' });
  }

  try {
    const campaignResult = await query('SELECT * FROM campaigns WHERE id = $1', [campaign_id]);
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const walletResult = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0 || parseFloat(walletResult.rows[0].balance) < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance.' });
    }

    const wallet = walletResult.rows[0];

    await query('UPDATE wallets SET balance = balance - $1 WHERE id = $2', [amount, wallet.id]);
    const txnResult = await query(
      'INSERT INTO transactions (wallet_id, type, status, amount, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [wallet.id, 'payment', 'completed', amount, `Donation to campaign`]
    );
    await query('UPDATE campaigns SET raised_amount = raised_amount + $1 WHERE id = $2', [amount, campaign_id]);
    await query(
      'INSERT INTO donations (user_id, campaign_id, amount, is_anonymous, transaction_id) VALUES ($1, $2, $3, $4, $5)',
      [is_anonymous ? null : userId, campaign_id, amount, is_anonymous || false, txnResult.rows[0].id]
    );

    res.status(200).json({ message: 'Donation successful!' });
  } catch (error) {
    console.error('Donate error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getDonationHistory = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const result = await query(`
      SELECT d.*, c.title as campaign_title
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = $1
      ORDER BY d.created_at DESC
    `, [userId]);
    res.json(result.rows.map(r => ({
      id: r.id,
      campaignTitle: r.campaign_title,
      amount: parseFloat(r.amount),
      currency: 'NGN',
      date: r.created_at,
      anonymous: r.is_anonymous,
      receiptId: `RCP-${r.id.toString().slice(0, 8)}`,
    })));
  } catch (error) {
    console.error('Get donation history error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
