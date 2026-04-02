// src/config/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the PostgreSQL connection pool
export const pool = new Pool({
  // Using a connection string is the standard approach
  // Example: postgres://username:password@localhost:5432/trunorth_db
  connectionString: process.env.DATABASE_URL,
});

// Centralized query function
export const query = (text: string, params?: any[]) => pool.query(text, params);


// Test the connection when this file is imported
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database successfully'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err.stack));