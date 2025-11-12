// the DB Connection

import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
host: process.env.DB_HOST || 'localhost',
port: parseInt(process.env.DB_PORT || '5432'),
user: process.env.DB_USER || 'postgres',
password: process.env.DB_PASS || '',
database: process.env.DB_NAME || 'academy',
max: 20,
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 2000,
});

export default pool;