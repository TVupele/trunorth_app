import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getDashboardStats, getAllUsers, updateUserRole, getPendingApprovals,
  getAllProducts, createProduct, updateProduct, deleteProduct,
  getAllEvents, createEvent, updateEvent, deleteEvent,
  getAllCampaigns, createCampaign, updateCampaign, deleteCampaign,
  getAllServices, createService, updateService, deleteService,
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

// Products management
router.get('/products', authMiddleware, getAllProducts);
router.post('/products', authMiddleware, createProduct);
router.put('/products/:id', authMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, deleteProduct);

// Events management
router.get('/events', authMiddleware, getAllEvents);
router.post('/events', authMiddleware, createEvent);
router.put('/events/:id', authMiddleware, updateEvent);
router.delete('/events/:id', authMiddleware, deleteEvent);

// Campaigns management
router.get('/campaigns', authMiddleware, getAllCampaigns);
router.post('/campaigns', authMiddleware, createCampaign);
router.put('/campaigns/:id', authMiddleware, updateCampaign);
router.delete('/campaigns/:id', authMiddleware, deleteCampaign);

// Services management
router.get('/services', authMiddleware, getAllServices);
router.post('/services', authMiddleware, createService);
router.put('/services/:id', authMiddleware, updateService);
router.delete('/services/:id', authMiddleware, deleteService);

// Ad Banners management (admin only)
router.post('/ad-banners', authMiddleware, createAdBanner);
router.put('/ad-banners/:bannerId', authMiddleware, updateAdBanner);
router.delete('/ad-banners/:bannerId', authMiddleware, deleteAdBanner);

// Self-service approval request routes (any authenticated user can request)
router.post('/approve-vendor', authMiddleware, requestVendorApproval);
router.post('/approve-tutor', authMiddleware, requestTutorApproval);

export default router;
