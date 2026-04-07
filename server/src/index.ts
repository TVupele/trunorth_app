// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';

// Import database configuration to initialize connection on startup
import './config/db'; 

// Passport configuration
import './config/passport';

// Import Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import walletRoutes from './routes/wallet';
import dashboardRoutes from './routes/dashboard';
import postsRoutes from './routes/posts';
import travelRoutes from './routes/travel';
import tutorsRoutes from './routes/tutors';
import productsRoutes from './routes/products';
import eventsRoutes from './routes/events';
import campaignsRoutes from './routes/campaigns';
import religiousServicesRoutes from './routes/religiousServices';
import adminRoutes from './routes/admin';
import paymentsRoutes from './routes/payments';
import vendorRoutes from './routes/vendor';
import tutorManagementRoutes from './routes/tutorManagement';
import emergencyRoutes from './routes/emergency';
import notificationsRoutes from './routes/notifications';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://trunorth-app.vercel.app'
  ],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-default-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/tutors', tutorsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/religious-services', religiousServicesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/tutor-management', tutorManagementRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/notifications', notificationsRoutes);

// Simple root endpoint (Health Check)
app.get('/', (req, res) => {
  res.send('TruNorth API Server is running...');
});

// Public endpoint to get active ad banners (for homepage)
app.get('/api/public/ad-banners', async (req, res) => {
  try {
    const { query } = await import('./config/db');
    const result = await query('SELECT * FROM ad_banners WHERE is_active = true ORDER BY display_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get public ad banners error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Global Error Handler (Optional but recommended)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Vercel serverless handler
export default app;