import { NextRequest } from 'next/server';
import { logger } from '@/server/infra/logger';
import { MessagesListResponse } from '@/server/types/message';
import { listConversationMessages, sendMessage } from '@/server/routes';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const params = req.nextUrl.searchParams;
  const limitParam = params.get('limit');
  const cursor = params.get('cursor') ?? undefined;
  const limit = Number.parseInt(limitParam ?? '100', 10);
  logger.info('api.messages.list', { conversationId: id, limit, hasCursor: Boolean(cursor) });
  const { items, nextCursor } = await listConversationMessages(id, limit, cursor);
  const data: MessagesListResponse = { items, nextCursor };
  return Response.json(data);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const content = body?.content as string;
  logger.info('api.messages.create', { conversationId: id });
  const result = await sendMessage(id, content);
  return Response.json(result);
}
