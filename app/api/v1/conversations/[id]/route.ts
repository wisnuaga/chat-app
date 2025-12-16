import { NextRequest } from 'next/server';
import { renameConversation, removeConversation } from '@/server/routes';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const name = (body?.name as string) || (body?.title as string) || undefined;
  const conv = await renameConversation(id, name);
  return Response.json({ id: conv.id, name: conv.title, title: conv.title });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const removedId = await removeConversation(id);
  return Response.json({ id: removedId });
}
