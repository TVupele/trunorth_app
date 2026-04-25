import { query } from '../config/db';
import dotenv from 'dotenv';
dotenv.config();

async function setup() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS login_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        device VARCHAR(255),
        location VARCHAR(255),
        ip_address VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('login_history table created or already exists.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
setup();