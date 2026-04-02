import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { query } from './db';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const API_URL = process.env.API_URL || 'http://localhost:5000';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials are not set in .env file. Google login will not work.');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      callbackURL: `${API_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id: googleId, displayName: fullName, emails, photos } = profile;
      const email = emails?.[0].value;
      const avatarUrl = photos?.[0].value;

      if (!email) {
        return done(new Error('No email found from Google profile'), undefined);
      }

      try {
        // Check if user already exists
        const existingUserResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (existingUserResult.rows.length > 0) {
          // User exists, log them in
          const user = existingUserResult.rows[0];
          // Optionally, update their googleId or avatar if they don't have one
          if (!user.google_id || !user.avatar_url) {
            await query('UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3', [googleId, avatarUrl, user.id]);
          }
          return done(null, user);
        } else {
          // User doesn't exist, create a new one
          const newUserResult = await query(
            'INSERT INTO users (full_name, email, google_id, avatar_url, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [fullName, email, googleId, avatarUrl, true] // Mark as verified since email is from Google
          );
          const newUser = newUserResult.rows[0];

          // Create a wallet for the new user
          await query(
            'INSERT INTO wallets (user_id, balance, currency) VALUES ($1, $2, $3)',
            [newUser.id, 0, 'NGN']
          );

          return done(null, newUser);
        }
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);


passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const result = await query('SELECT id, role FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            done(null, { userId: user.id, role: user.role });
        } else {
            done(new Error('User not found'), null);
        }
    } catch (error) {
        done(error, null);
    }
});

