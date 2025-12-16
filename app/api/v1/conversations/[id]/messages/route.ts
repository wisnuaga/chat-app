import { NextRequest } from 'next/server';
import { MessagesListResponse } from '@/server/types/message';
import { listConversationMessages, sendMessage } from '@/server/routes';

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { items } = await listConversationMessages(id, 100);
  const data: MessagesListResponse = { items };
  return Response.json(data);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const content = body?.content as string;
  const result = await sendMessage(id, content);
  return Response.json(result);
}
