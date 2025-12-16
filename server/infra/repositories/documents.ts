import type pg from 'pg';
import { pool } from '@/server/infra/db';
import { DocumentType, type Document } from '@/server/types/document';
import type { DocumentsRepository } from '@/server/repositories/documents';

class DocumentsImpl implements DocumentsRepository {
  async create(title: string, type: DocumentType): Promise<string> {
    const res = await pool.query('INSERT INTO documents (title, type) VALUES ($1, $2) RETURNING id', [title, type]);
    return String(res.rows[0].id);
  }
  async insertDocument(client: pg.PoolClient, title: string, type: DocumentType): Promise<string> {
    const res = await client.query('INSERT INTO documents (title, type) VALUES ($1, $2) RETURNING id', [title, type]);
    return String(res.rows[0].id);
  }
  async get(id: string): Promise<Document | null> {
    const res = await pool.query(
      'SELECT id, title, type, created_at FROM documents WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rowCount === 0) return null;
    return this.toDocument(res.rows[0]);
  }
  async list(limit: number, offset: number): Promise<Document[]> {
    const res = await pool.query(
      'SELECT id, title, type, created_at FROM documents WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return res.rows.map(r => this.toDocument(r));
  }
  async update(id: string, title: string, type: DocumentType): Promise<string | null> {
    const res = await pool.query(
      'UPDATE documents SET title = $2, type = $3, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id, title, type]
    );
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  async destroy(id: string): Promise<string | null> {
    const res = await pool.query(
      'UPDATE documents SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  private toDocument(row: { id: number; title: string; type: number; created_at: Date }): Document {
    return {
      id: String(row.id),
      title: row.title,
      type: (row.type as DocumentType) ?? DocumentType.UserInput,
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.created_at).getTime(),
    };
  }
}

export const documentsRepository = new DocumentsImpl();
