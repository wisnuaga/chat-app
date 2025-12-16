import { pool } from '@/server/infra/db';
import type { Conversation } from '@/server/types/conversation';
import type { ConversationsRepository } from '@/server/repositories/conversations';

class ConversationsImpl implements ConversationsRepository {
  async create(title: string): Promise<string> {
    const res = await pool.query('INSERT INTO conversations (title) VALUES ($1) RETURNING id', [title]);
    return String(res.rows[0].id);
  }
  async get(id: string): Promise<Conversation | null> {
    const res = await pool.query('SELECT id, title, created_at, updated_at FROM conversations WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rowCount === 0) return null;
    return this.toConversation(res.rows[0]);
  }
  async list(limit: number, offset: number): Promise<Conversation[]> {
    const res = await pool.query(
      'SELECT id, title, created_at, updated_at FROM conversations WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return res.rows.map(r => this.toConversation(r));
  }
  async update(id: string, title: string): Promise<string | null> {
    const res = await pool.query(
      'UPDATE conversations SET title = $2, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id, title]
    );
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  async destroy(id: string): Promise<string | null> {
    const res = await pool.query('UPDATE conversations SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id', [id]);
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  async restore(id: string): Promise<boolean> {
    const res = await pool.query('UPDATE conversations SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL', [id]);
    return Boolean(res.rowCount);
  }
  private toConversation(row: { id: number; title: string; created_at: Date; updated_at: Date }): Conversation {
    return {
      id: String(row.id),
      title: row.title,
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
    };
  }
}

export const conversationsRepository = new ConversationsImpl();
