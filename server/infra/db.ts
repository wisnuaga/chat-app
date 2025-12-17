import pg from 'pg';
import { logger } from '@/server/infra/logger';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://chatapp:chatapp@localhost:5444/chatapp';
const pool = new pg.Pool({ connectionString: DATABASE_URL });
logger.info('db_pool_init', { env: process.env.NODE_ENV });

export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export { pool };
