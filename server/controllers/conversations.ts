import { services } from '@/server/di/container';
import type { ConversationListResponse } from '@/server/types/conversation';
import type { MessagesListResponse } from '@/server/types/message';

export class ConversationsController {
  async list(limit: number, offset: number): Promise<ConversationListResponse> {
    return services.conversations.list(limit, offset);
  }
  async create(title?: string) {
    return services.conversations.create(title);
  }
  async listMessages(conversationId: string, limit = 50, cursor?: string): Promise<MessagesListResponse> {
    return services.conversations.listMessages(conversationId, limit, cursor);
  }
  async sendMessage(conversationId: string, content: string) {
    return services.conversations.sendMessageAndReply(conversationId, content);
  }
  async restore(id: string) {
    return services.conversations.restore(id);
  }
  async rename(id: string, title?: string) {
    return services.conversations.rename(id, title);
  }
  async remove(id: string) {
    return services.conversations.remove(id);
  }
}

export const conversationsController = new ConversationsController();
