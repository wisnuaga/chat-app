import { NextRequest } from 'next/server';
import { logger } from '@/server/infra/logger';
import { renameConversation, removeConversation } from '@/server/routes';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const name = (body?.name as string) || (body?.title as string) || undefined;
  logger.info('api.conversations.rename', { id, hasTitle: Boolean(name) });
  const conv = await renameConversation(id, name);
  return Response.json({ id: conv.id, name: conv.title, title: conv.title });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  logger.warn('api.conversations.remove', { id });
  const removedId = await removeConversation(id);
  return Response.json({ id: removedId });
}
