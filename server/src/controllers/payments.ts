import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const createStripePaymentIntent = async (req: Request, res: Response) => {
  const { amount, currency } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required.' });
  }
  // In production, use the Stripe SDK: stripe.paymentIntents.create(...)
  // For now, return a mock client secret for frontend integration
  res.json({
    clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    currency: currency || 'ngn',
    status: 'requires_payment_method',
  });
};

export const confirmStripePayment = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { paymentIntentId, amount } = req.body;

  if (!paymentIntentId || !amount) {
    return res.status(400).json({ error: 'Payment intent ID and amount are required.' });
  }

  try {
    const walletResult = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found.' });
    }
    const wallet = walletResult.rows[0];

    await query('UPDATE wallets SET balance = balance + $1 WHERE id = $2', [amount, wallet.id]);
    await query(
      'INSERT INTO transactions (wallet_id, type, status, amount, description) VALUES ($1, $2, $3, $4, $5)',
      [wallet.id, 'top-up', 'completed', amount, 'Wallet top-up via Stripe']
    );

    const updatedWallet = await query('SELECT * FROM wallets WHERE id = $1', [wallet.id]);
    res.json({
      message: 'Payment confirmed and wallet topped up!',
      balance: parseFloat(updatedWallet.rows[0].balance),
    });
  } catch (error) {
    console.error('Confirm Stripe payment error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createPayPalOrder = async (req: Request, res: Response) => {
  const { amount, currency } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required.' });
  }
  // In production, use PayPal SDK to create an order
  res.json({
    orderId: `PAYPAL_ORDER_${Date.now()}`,
    amount,
    currency: currency || 'NGN',
    status: 'CREATED',
    approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=mock_order_${Date.now()}`,
  });
};

export const capturePayPalOrder = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ error: 'Order ID and amount are required.' });
  }

  try {
    const walletResult = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found.' });
    }
    const wallet = walletResult.rows[0];

    await query('UPDATE wallets SET balance = balance + $1 WHERE id = $2', [amount, wallet.id]);
    await query(
      'INSERT INTO transactions (wallet_id, type, status, amount, description) VALUES ($1, $2, $3, $4, $5)',
      [wallet.id, 'top-up', 'completed', amount, 'Wallet top-up via PayPal']
    );

    const updatedWallet = await query('SELECT * FROM wallets WHERE id = $1', [wallet.id]);
    res.json({
      message: 'PayPal payment captured and wallet topped up!',
      balance: parseFloat(updatedWallet.rows[0].balance),
    });
  } catch (error) {
    console.error('Capture PayPal order error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const processBankTransfer = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { amount, reference } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required.' });
  }

  try {
    const walletResult = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found.' });
    }
    const wallet = walletResult.rows[0];

    await query('UPDATE wallets SET balance = balance + $1 WHERE id = $2', [amount, wallet.id]);
    await query(
      'INSERT INTO transactions (wallet_id, type, status, amount, description) VALUES ($1, $2, $3, $4, $5)',
      [wallet.id, 'top-up', 'completed', amount, `Bank transfer top-up${reference ? ` (Ref: ${reference})` : ''}`]
    );

    const updatedWallet = await query('SELECT * FROM wallets WHERE id = $1', [wallet.id]);
    res.json({
      message: 'Bank transfer processed successfully!',
      balance: parseFloat(updatedWallet.rows[0].balance),
    });
  } catch (error) {
    console.error('Process bank transfer error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getPaymentMethods = async (req: Request, res: Response) => {
  res.json({
    methods: [
      { id: 'stripe', name: 'Credit/Debit Card (Stripe)', enabled: true, icon: 'credit-card' },
      { id: 'paypal', name: 'PayPal', enabled: true, icon: 'paypal' },
      { id: 'paystack', name: 'Paystack', enabled: true, icon: 'credit-card' },
      { id: 'bank_transfer', name: 'Bank Transfer', enabled: true, icon: 'building' },
      { id: 'card_topup', name: 'Card Top-up', enabled: true, icon: 'credit-card' },
    ],
  });
};
