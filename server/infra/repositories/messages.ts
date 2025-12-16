import { pool } from '@/server/infra/db';
import type { Message } from '@/server/types/message';
import type { MessagesRepository } from '@/server/repositories/messages';

class MessagesImpl implements MessagesRepository {
  async create(conversationId: string, role: Message['role'], content: string): Promise<string> {
    const res = await pool.query('INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING id', [conversationId, role, content]);
    return String(res.rows[0].id);
  }
  async get(id: string): Promise<Message | null> {
    const res = await pool.query(
      'SELECT id, conversation_id, role, content, created_at, updated_at FROM messages WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rowCount === 0) return null;
    return this.toMessage(res.rows[0]);
  }
  async listByConversation(conversationId: string, limit: number, offset: number): Promise<Message[]> {
    const res = await pool.query(
      'SELECT id, conversation_id, role, content, created_at, updated_at FROM messages WHERE conversation_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC LIMIT $2 OFFSET $3',
      [conversationId, limit, offset]
    );
    return res.rows.map(r => this.toMessage(r));
  }
  async update(id: string, role: Message['role'], content: string): Promise<string | null> {
    const res = await pool.query(
      'UPDATE messages SET role = $2, content = $3, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id, role, content]
    );
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  async destroy(id: string): Promise<string | null> {
    const res = await pool.query('UPDATE messages SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id', [id]);
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  async restore(id: string): Promise<boolean> {
    const res = await pool.query('UPDATE messages SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL', [id]);
    return Boolean(res.rowCount);
  }
  private toMessage(row: { id: string | number; conversation_id: string; role: Message['role']; content: string; created_at: Date; updated_at: Date }): Message {
    return {
      id: String(row.id),
      conversationId: row.conversation_id,
      role: row.role,
      content: row.content,
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
    };
  }
}

export const messagesRepository = new MessagesImpl();
