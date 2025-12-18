import { headers } from 'next/headers';
import type { ConversationListResponse } from '@/server/types/conversation';

const BASE_URL = process.env.BASE_URL;

export class ConversationsApi {
  async list(offset = 0, limit = 20): Promise<ConversationListResponse> {
    const u = new URL('/api/v1/conversations', BASE_URL);
    u.searchParams.set('offset', String(Math.max(0, offset)));
    u.searchParams.set('limit', String(Math.max(1, limit)));
    const res = await fetch(u.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`ConversationsApi.list failed: ${res.status}`);
    return res.json() as Promise<ConversationListResponse>;
  }
}
