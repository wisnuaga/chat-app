import { type ChatMessage, type OpenRouterClient, openRouterClient } from '@/server/clients/openrouter';
import { type ConversationsRepository, conversationsRepository } from '@/server/repositories/conversations';
import { type MessagesRepository, messagesRepository } from '@/server/repositories/messages';
import { type ConversationListResponse } from '@/server/types/conversation';
import { type MessagesListResponse } from '@/server/types/message';
import { randomUUID } from 'crypto';

export class ConversationsService {
  constructor(private convRepo: ConversationsRepository, private msgRepo: MessagesRepository, private llm: OpenRouterClient) {}
  private parseCursor(cursor?: string) {
    const n = Number(cursor);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  async list(limit = 20, cursor?: string): Promise<ConversationListResponse> {
    const offset = this.parseCursor(cursor);
    const items = await this.convRepo.list(limit, offset);
    const nextCursor = items.length === limit ? String(offset + limit) : undefined;
    return { items, nextCursor };
  }
  async create(title?: string) {
    const defaultTitle = `conversation-${randomUUID().slice(0, 8)}`;
    const id = await this.convRepo.create(title || defaultTitle);
    const conv = await this.convRepo.get(id);
    return conv!;
  }
  async rename(id: string, title?: string) {
    const newTitle = title || `conversation-${randomUUID().slice(0, 8)}`;
    await this.convRepo.update(id, newTitle);
    const conv = await this.convRepo.get(id);
    return conv!;
  }
  async remove(id: string) {
    return this.convRepo.destroy(id);
  }
  async restore(id: string) {
    return this.convRepo.restore(id);
  }
  async listMessages(conversationId: string, limit = 50, cursor?: string): Promise<MessagesListResponse> {
    const offset = this.parseCursor(cursor);
    const items = await this.msgRepo.listByConversation(conversationId, limit, offset);
    const nextCursor = items.length === limit ? String(offset + limit) : undefined;
    return { items, nextCursor };
  }
  async sendMessageAndReply(conversationId: string, content: string) {
    let conv = await this.convRepo.get(conversationId);
    if (!conv) conv = await this.create();
    await this.msgRepo.create(conv.id, 'user', content || '');
    const limit = 100;
    let offset = 0;
    const history: ChatMessage[] = [];
    while (true) {
      const batch = await this.msgRepo.listByConversation(conv.id, limit, offset);
      if (batch.length === 0) break;
      history.push(...batch.map(m => ({ role: m.role, content: m.content })));
      offset += batch.length;
      if (offset >= 500) break;
    }
    const model = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-8b-instruct';
    const ai = await this.llm.chatCompletion(history, model);
    const assistantId = await this.msgRepo.create(conv.id, 'assistant', ai.content || '');
    return { messageId: assistantId, citations: [], conversationId: conv.id };
  }
}

export const defaultConversationsService = new ConversationsService(conversationsRepository, messagesRepository, openRouterClient);
