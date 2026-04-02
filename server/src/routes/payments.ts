import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createStripePaymentIntent, confirmStripePayment,
  createPayPalOrder, capturePayPalOrder,
  processBankTransfer, getPaymentMethods
} from '../controllers/payments';

const router = Router();

router.get('/methods', getPaymentMethods);
router.post('/stripe/create-intent', authMiddleware, createStripePaymentIntent);
router.post('/stripe/confirm', authMiddleware, confirmStripePayment);
router.post('/paypal/create-order', authMiddleware, createPayPalOrder);
router.post('/paypal/capture', authMiddleware, capturePayPalOrder);
router.post('/bank-transfer', authMiddleware, processBankTransfer);

export default router;
