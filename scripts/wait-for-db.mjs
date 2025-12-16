import { config } from 'dotenv';
import pg from 'pg';

config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://chatapp:chatapp@localhost:5444/chatapp';

async function waitForDb(timeoutMs = 30000, intervalMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const pool = new pg.Pool({ connectionString: DATABASE_URL });
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      await pool.end();
      process.stdout.write('Database is ready\n');
      return;
    } catch (_) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  throw new Error('Database not ready in time');
}

waitForDb().catch((e) => {
  console.error(e);
  process.exit(1);
});
