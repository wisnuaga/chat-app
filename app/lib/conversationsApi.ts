import type { ConversationListResponse } from '@/server/types/conversation';
import type { MessagesListResponse } from '@/server/types/message';

const BASE_URL = process.env.BASE_URL;
type SendMessageResult = { messageId: string; citations: unknown[]; conversationId: string };
type RenameResult = { id: string; name: string; title: string };
type CreateResult = { conversationId: string };
type RemoveResult = { id: string };

export class ConversationsApi {
  private getBase(): string {
    if (BASE_URL && /^https?:\/\//.test(BASE_URL)) return BASE_URL;
    if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
    return 'http://localhost:3000';
  }
  async list(offset = 0, limit = 20): Promise<ConversationListResponse> {
    const u = new URL('/api/v1/conversations', this.getBase());
    u.searchParams.set('offset', String(Math.max(0, offset)));
    u.searchParams.set('limit', String(Math.max(1, limit)));
    const res = await fetch(u.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`ConversationsApi.list failed: ${res.status}`);
    return res.json() as Promise<ConversationListResponse>;
  }
  async create(): Promise<CreateResult> {
    const res = await fetch(new URL('/api/v1/conversations', this.getBase()).toString(), { method: 'POST' });
    if (!res.ok) throw new Error(`ConversationsApi.create failed: ${res.status}`);
    return res.json() as Promise<CreateResult>;
  }
  async rename(id: string, name: string): Promise<RenameResult> {
    const res = await fetch(new URL(`/api/v1/conversations/${id}`, this.getBase()).toString(), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error(`ConversationsApi.rename failed: ${res.status}`);
    return res.json() as Promise<RenameResult>;
  }
  async remove(id: string): Promise<RemoveResult> {
    const res = await fetch(new URL(`/api/v1/conversations/${id}`, this.getBase()).toString(), { method: 'DELETE' });
    if (!res.ok) throw new Error(`ConversationsApi.remove failed: ${res.status}`);
    return res.json() as Promise<RemoveResult>;
  }
  async listMessages(conversationId: string, cursor?: string, limit = 50): Promise<MessagesListResponse> {
    const u = new URL(`/api/v1/conversations/${conversationId}/messages`, this.getBase());
    if (cursor) u.searchParams.set('cursor', cursor);
    u.searchParams.set('limit', String(Math.max(1, limit)));
    const res = await fetch(u.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`ConversationsApi.listMessages failed: ${res.status}`);
    return res.json() as Promise<MessagesListResponse>;
  }
  async sendMessage(conversationId: string, content: string): Promise<SendMessageResult> {
    const res = await fetch(new URL(`/api/v1/conversations/${conversationId}/messages`, this.getBase()).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error(`ConversationsApi.sendMessage failed: ${res.status}`);
    return res.json() as Promise<SendMessageResult>;
  }
}
