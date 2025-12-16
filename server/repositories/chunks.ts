import type pg from 'pg';
import type { Chunk } from '@/server/types/chunk';

export interface ChunksRepository {
  create(client: pg.PoolClient, documentId: string, content: string, embedding: number[]): Promise<string>;
  listByDocumentId(documentId: string, limit: number, offset: number): Promise<Chunk[]>;
  update(id: string, content: string): Promise<string | null>;
  remove(id: string): Promise<string | null>;
  searchByEmbedding(embedding: number[], limit: number, documentId?: string): Promise<Chunk[]>;
}
