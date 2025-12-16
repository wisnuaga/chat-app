import type pg from 'pg';
import { pool } from '@/server/infra/db';
import type { Chunk } from '@/server/types/chunk';
import type { ChunksRepository } from '@/server/repositories/chunks';

export class ChunksImpl implements ChunksRepository {
  async create(client: pg.PoolClient, documentId: string, content: string, embedding: number[]): Promise<string> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    const res = await client.query('INSERT INTO chunks (document_id, content, embedding) VALUES ($1, $2, $3) RETURNING id', [documentId, content, vectorLiteral]);
    return String(res.rows[0].id);
  }
  async listByDocumentId(documentId: string, limit: number, offset: number): Promise<Chunk[]> {
    const res = await pool.query(
      'SELECT id, document_id, content, embedding, created_at, updated_at FROM chunks WHERE document_id = $1 AND deleted_at IS NULL ORDER BY id ASC LIMIT $2 OFFSET $3',
      [documentId, limit, offset]
    );
    return res.rows.map(r => this.toChunk(r));
  }
  async update(id: string, content: string): Promise<string | null> {
    const res = await pool.query(
      'UPDATE chunks SET content = $2, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id, content]
    );
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  async remove(id: string): Promise<string | null> {
    const res = await pool.query('UPDATE chunks SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id', [id]);
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  async searchByEmbedding(embedding: number[], limit: number, documentId?: string): Promise<Chunk[]> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    const params: (string | number)[] = [vectorLiteral, limit];
    let sql = 'SELECT id, document_id, content, embedding, created_at, updated_at FROM chunks WHERE deleted_at IS NULL';
    if (documentId) {
      sql += ' AND document_id = $3';
      params.push(documentId);
    }
    sql += ' ORDER BY embedding <=> $1 LIMIT $2';
    const res = await pool.query(sql, params);
    return res.rows.map(r => this.toChunk(r));
  }
  private toChunk(row: { id: string | number; document_id: string; content: string; embedding: string | number[]; created_at: Date; updated_at: Date }): Chunk {
    const raw = row.embedding;
    let embedding: number[];
    if (Array.isArray(raw)) {
      embedding = raw as number[];
    } else if (typeof raw === 'string') {
      const s = raw.trim();
      const inner = s.startsWith('[') && s.endsWith(']') ? s.slice(1, -1) : s;
      embedding = inner.length ? inner.split(',').map(v => Number(v)) : [];
    } else {
      embedding = [];
    }
    return {
      id: String(row.id),
      documentId: row.document_id,
      content: row.content,
      embedding,
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
    };
  }
}
