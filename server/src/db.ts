import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // SSL configuration - use proper certificates in production
    ssl: process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: true,
            ca: process.env.DATABASE_CA_CERT || undefined
        }
        : false
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
