import { Pool } from 'pg';

const isDevelopment = process.env.NODE_ENV === 'development';

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    ssl: {
        rejectUnauthorized: isDevelopment ? false : true,
    }
});

export default pool;
