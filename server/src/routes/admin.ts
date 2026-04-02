import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getDashboardStats, getAllUsers, updateUserRole, getPendingApprovals,
  getAllProducts, getAllEvents, getAllCampaigns, getAllServices,
  requestVendorApproval, requestTutorApproval, deleteUser,
  approveVendorRequest, approveTutorRequest, rejectRequest,
  getAllAdBanners, createAdBanner, updateAdBanner, deleteAdBanner
} from '../controllers/admin';

const router = Router();

// Public route for fetching active ad banners (no auth required)
router.get('/ad-banners', getAllAdBanners);

// Admin-only routes
router.get('/stats', authMiddleware, getDashboardStats);
router.get('/users', authMiddleware, getAllUsers);
router.put('/users/:userId/role', authMiddleware, updateUserRole);
router.delete('/users/:id', authMiddleware, deleteUser);
router.get('/pending-approvals', authMiddleware, getPendingApprovals);
router.post('/pending-approvals/:requestId/approve', authMiddleware, approveVendorRequest);
router.post('/pending-approvals/:requestId/approve-tutor', authMiddleware, approveTutorRequest);
router.post('/pending-approvals/:requestId/reject', authMiddleware, rejectRequest);
router.get('/products', authMiddleware, getAllProducts);
router.get('/events', authMiddleware, getAllEvents);
router.get('/campaigns', authMiddleware, getAllCampaigns);
router.get('/services', authMiddleware, getAllServices);

// Ad Banners management (admin only)
router.post('/ad-banners', authMiddleware, createAdBanner);
router.put('/ad-banners/:bannerId', authMiddleware, updateAdBanner);
router.delete('/ad-banners/:bannerId', authMiddleware, deleteAdBanner);

// Self-service approval request routes (any authenticated user can request)
router.post('/approve-vendor', authMiddleware, requestVendorApproval);
router.post('/approve-tutor', authMiddleware, requestTutorApproval);

export default router;
