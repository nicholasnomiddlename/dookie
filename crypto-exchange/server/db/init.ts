import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dookie_exchange',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

export async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    throw error;
  }
}

export default pool;
