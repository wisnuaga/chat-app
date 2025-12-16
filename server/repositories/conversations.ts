import type { Conversation } from '@/server/types/conversation';
import { conversationsRepository as defaultRepo } from '@/server/infra/repositories/conversations';

export interface ConversationsRepository {
  create(title: string): Promise<string>;
  get(id: string): Promise<Conversation | null>;
  list(limit: number, offset: number): Promise<Conversation[]>;
  update(id: string, title: string): Promise<string | null>;
  destroy(id: string): Promise<string | null>;
  restore(id: string): Promise<boolean>;
}

export const conversationsRepository: ConversationsRepository = defaultRepo;
