import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export { pool };