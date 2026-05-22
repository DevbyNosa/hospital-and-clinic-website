import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();


const pool = new Pool({
  user: process.env.DB_USER || process.env.PG_USER,
  host: process.env.DB_HOST || process.env.PG_HOST,
  database: process.env.DB_DATABASE || process.env.PG_DATABASE,
  password: process.env.DB_PASSWORD || process.env.PG_PASSWORD,
  port: Number(process.env.DB_PORT || process.env.PG_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }
  console.log('🐘 PostgreSQL connected successfully!');
    release();
})

export default pool;