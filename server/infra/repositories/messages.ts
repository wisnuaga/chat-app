import { pool } from '@/server/infra/db';
import { logger } from '@/server/infra/logger';
import type { Message } from '@/server/types/message';
import type { MessagesRepository } from '@/server/repositories/messages';

export class MessagesImpl implements MessagesRepository {
  async create(conversationId: string, role: Message['role'], content: string): Promise<string> {
    const res = await pool.query('INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING id', [conversationId, role, content]);
    logger.info('messages.create', { conversationId, role });
    return String(res.rows[0].id);
  }
  async get(id: string): Promise<Message | null> {
    const res = await pool.query(
      'SELECT id, conversation_id, role, content, created_at, updated_at FROM messages WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    logger.debug('messages.get', { id, rowCount: res.rowCount });
    if (res.rowCount === 0) return null;
    return this.toMessage(res.rows[0]);
  }
  async listByConversation(conversationId: string, limit: number, offset: number, order: 'asc' | 'desc' = 'asc'): Promise<Message[]> {
    const dir = order === 'desc' ? 'DESC' : 'ASC';
    const sql = `SELECT id, conversation_id, role, content, created_at, updated_at FROM messages WHERE conversation_id = $1 AND deleted_at IS NULL ORDER BY created_at ${dir} LIMIT $2 OFFSET $3`;
    const res = await pool.query(sql, [conversationId, limit, offset]);
    logger.info('messages.listByConversation', { conversationId, limit, offset, order, rowCount: res.rowCount });
    return res.rows.map(r => this.toMessage(r));
  }
  async update(id: string, role: Message['role'], content: string): Promise<string | null> {
    const res = await pool.query(
      'UPDATE messages SET role = $2, content = $3, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id, role, content]
    );
    logger.info('messages.update', { id, role });
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  async destroy(id: string): Promise<string | null> {
    const res = await pool.query('UPDATE messages SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id', [id]);
    logger.warn('messages.destroy', { id });
    if (res.rowCount === 0) return null;
    return String(res.rows[0].id);
  }
  async restore(id: string): Promise<boolean> {
    const res = await pool.query('UPDATE messages SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL', [id]);
    logger.info('messages.restore', { id, restored: Boolean(res.rowCount) });
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
