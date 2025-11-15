// run npm install pg 
// the DB Connection and a test to see if it is configured correctly

import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
host: process.env.DB_HOST || 'localhost',
port: parseInt(process.env.DB_PORT || '5432'),
user: process.env.DB_USER || 'postgres', //change this
password: process.env.DB_PASS || 'password', //change this 
database: process.env.DB_NAME || 'metacampus_db',
max: 20,
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 2000,
});

// Optional: Verify connection at startup
async function verifyConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  } catch (error) {
    console.error('❌ Error connecting to the database:', error);
  }
}

verifyConnection();

export default pool;   