import type pg from 'pg';
import type { Document } from '@/server/types/document';
import { DocumentType } from '@/server/types/document';

export interface DocumentsRepository {
  create(title: string, type: DocumentType): Promise<string>;
  insertDocument(client: pg.PoolClient, title: string, type: DocumentType): Promise<string>;
  get(id: string): Promise<Document | null>;
  list(limit: number, offset: number): Promise<Document[]>;
  update(id: string, title: string, type: DocumentType): Promise<string | null>;
  destroy(id: string): Promise<string | null>;
}
