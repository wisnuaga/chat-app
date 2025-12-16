import { NextRequest } from 'next/server';
import { ConversationListResponse } from '@/server/types/conversation';
import { listConversations, createConversation } from '@/server/routes';

export async function GET() {
  const { items } = await listConversations(100);
  const data: ConversationListResponse = { items };
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const title = body?.title as string | undefined;
  const conv = await createConversation(title);
  return Response.json({ conversationId: conv.id });
}
