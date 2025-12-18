import { NextRequest } from 'next/server';
import { logger } from '@/server/infra/logger';
import { ConversationListResponse } from '@/server/types/conversation';
import { listConversations, createConversation } from '@/server/routes';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const limitParam = params.get('limit');
  const offsetParam = params.get('offset');
  const limit = Number.parseInt(limitParam ?? '20', 10);
  const offset = Number.parseInt(offsetParam ?? '0', 10);
  logger.info('api.conversations.list', { limit, offset });
  const { items, meta } = await listConversations(limit, offset);
  const data: ConversationListResponse = { items, meta };
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const title = body?.title as string | undefined;
  logger.info('api.conversations.create', { hasTitle: Boolean(title) });
  const conv = await createConversation(title);
  return Response.json({ conversationId: conv.id });
}
