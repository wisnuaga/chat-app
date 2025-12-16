import { type OpenRouterClient, openRouterClient } from '@/server/clients/openrouter';
import { type DocumentsRepository, documentsRepository } from '@/server/repositories/documents';
import { DocumentType } from '@/server/types/document';
import { type ChunksRepository, chunksRepository } from '@/server/repositories/chunks';
import { withTransaction } from '@/server/infra/db';

function chunkText(text: string, chunkSize = 2000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const slice = text.slice(start, end).trim();
    if (slice.length > 0) chunks.push(slice);
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}

export class DocumentsService {
  constructor(private docsRepo: DocumentsRepository, private chunksRepo: ChunksRepository, private llm: OpenRouterClient) {}
  async ingest(title: string, text: string, type: DocumentType = DocumentType.UserInput) {
    const chunks = chunkText(text);
    const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    const embeddings: number[][] = [];
    for (const c of chunks) {
      const emb = await this.llm.embedText(c, model);
      embeddings.push(emb);
    }
    const result = await withTransaction(async (client) => {
      const docId = await this.docsRepo.insertDocument(client, title, type);
      for (let i = 0; i < chunks.length; i++) {
        await this.chunksRepo.create(client, docId, chunks[i], embeddings[i]);
      }
      return { documentId: docId, title, chunkCount: chunks.length };
    });
    return result;
  }
  async ingestText(title: string, text: string) {
    return this.ingest(title, text, DocumentType.UserInput);
  }
  async search(query: string, limit = 5, documentId?: string) {
    const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    const embedding = await this.llm.embedText(query, model);
    const items = await this.chunksRepo.searchByEmbedding(embedding, limit, documentId);
    return items;
  }
}

export const defaultDocumentsService = new DocumentsService(documentsRepository, chunksRepository, openRouterClient);
