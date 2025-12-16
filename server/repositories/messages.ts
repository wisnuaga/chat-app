import type { Message } from '@/server/types/message';
import { messagesRepository as defaultRepo } from '@/server/infra/repositories/messages';

export interface MessagesRepository {
  create(conversationId: string, role: Message['role'], content: string): Promise<string>;
  get(id: string): Promise<Message | null>;
  listByConversation(conversationId: string, limit: number, offset: number): Promise<Message[]>;
  update(id: string, role: Message['role'], content: string): Promise<string | null>;
  destroy(id: string): Promise<string | null>;
  restore(id: string): Promise<boolean>;
}

export const messagesRepository: MessagesRepository = defaultRepo;
