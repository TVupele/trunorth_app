import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { query } from '../config/db';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
if (JWT_SECRET === 'your-super-secret-key') {
  console.warn('Warning: JWT_SECRET is not set in .env file. Using a default, insecure key.');
}

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8080';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user into the database
    const newUserResult = await query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
      [email, passwordHash, fullName]
    );

    const newUser = newUserResult.rows[0];

    // Create a wallet for the new user
    await query(
      'INSERT INTO wallets (user_id, balance, currency) VALUES ($1, $2, $3)',
      [newUser.id, 0, 'NGN']
    );

    // Generate a JWT
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate a JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/google - Initiates Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback - Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${CLIENT_URL}/#/login?error=google_login_failed`,
  }),
  (req: any, res) => {
    const user = req.user as any;
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    // This is tricky. We need to get the token to the client.
    // One way is to redirect with the token in a query param.
    // The client can then grab it and store it.
    res.redirect(`${CLIENT_URL}/#/auth/token?token=${token}`);
  }
);

// GET /api/auth/status - Get user's auth status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user,
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null,
    });
  }
});

// GET /api/auth/logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out.' });
      }
      res.clearCookie('connect.sid'); // clear the session cookie
      res.status(200).json({ message: 'Logout successful' });
    });
  });
});

export default router;

