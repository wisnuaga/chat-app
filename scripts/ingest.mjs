import { config } from 'dotenv';
import { readFile } from 'fs/promises';
import pg from 'pg';
import crypto from 'node:crypto';

config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://chatapp:chatapp@localhost:5444/chatapp';
const OPENROUTER_KEY = process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

function chunkText(text, chunkSize = 2000, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const slice = text.slice(start, end).trim();
    if (slice.length > 0) chunks.push(slice);
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}

async function embedText(input) {
  if (!OPENROUTER_KEY) throw new Error('Missing OPENROUTER_KEY');
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input })
  });
  if (!res.ok) throw new Error(`Embeddings error: ${res.status}`);
  const json = await res.json();
  return json.data[0].embedding;
}

async function insertDocumentWithChunks(title, chunks, embeddings) {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const docId = crypto.randomUUID();
    await client.query('INSERT INTO documents (id, title) VALUES ($1, $2)', [docId, title]);
    for (let i = 0; i < chunks.length; i++) {
      const id = crypto.randomUUID();
      await client.query(
        'INSERT INTO chunks (id, document_id, content, embedding) VALUES ($1, $2, $3, $4)',
        [id, docId, chunks[i], `[${embeddings[i].join(',')}]`]
      );
    }
    await client.query('COMMIT');
    return { documentId: docId, inserted: chunks.length };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: npm run ingest -- <filePath> [title]');
    process.exit(1);
  }
  const filePath = args[0];
  const title = args[1] || filePath.split('/').pop();
  const text = await readFile(filePath, 'utf8');
  const chunks = chunkText(text);
  const embeddings = [];
  for (const c of chunks) {
    embeddings.push(await embedText(c));
  }
  const result = await insertDocumentWithChunks(title, chunks, embeddings);
  process.stdout.write(JSON.stringify(result) + '\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
