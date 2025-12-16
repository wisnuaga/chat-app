import { NextRequest } from 'next/server';
import { restoreConversation } from '@/server/routes';

export async function POST(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ok = await restoreConversation(id);
  return Response.json({ ok });
}
