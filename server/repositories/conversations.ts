import type { Conversation } from '@/server/types/conversation';

export interface ConversationsRepository {
  create(title: string): Promise<string>;
  get(id: string): Promise<Conversation | null>;
  list(limit: number, offset: number): Promise<Conversation[]>;
  count(): Promise<number>;
  update(id: string, title: string): Promise<string | null>;
  destroy(id: string): Promise<string | null>;
  restore(id: string): Promise<boolean>;
}
