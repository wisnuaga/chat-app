import { NextRequest } from 'next/server';
import { logger } from '@/server/infra/logger';
import { ingestTextDocument } from '@/server/routes';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const fileField = form.get('file');
  if (!(fileField instanceof File)) {
    return new Response('file is required', { status: 400 });
  }
  const title = (form.get('title') as string) || fileField.name || 'document';
  const text = await fileField.text();
  logger.info('api.documents.ingest', { title });
  const result = await ingestTextDocument(title, text);
  return Response.json(result);
}
