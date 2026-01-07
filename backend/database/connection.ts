import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

export const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool
    .query('SELECT 1')
    .then(() => console.log('Connected to database'))
    .catch((err: any) => {
        console.error('Database connection error', err);
        process.exit(1);
    });