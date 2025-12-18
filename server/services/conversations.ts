import { type ChatMessage, type OpenRouterClient } from '@/server/clients/openrouter';
import { type ConversationsRepository } from '@/server/repositories/conversations';
import { type MessagesRepository } from '@/server/repositories/messages';
import { type ChunksRepository } from '@/server/repositories/chunks';
import { type ConversationListResponse } from '@/server/types/conversation';
import { type MessagesListResponse } from '@/server/types/message';
import { randomUUID } from 'crypto';
import type { DocumentsService } from '@/server/services/documents';
import { logger } from '@/server/infra/logger';
import { encodeCursor } from '@/server/infra/utils/cursor';

export class ConversationsService {
  constructor(private convRepo: ConversationsRepository, private msgRepo: MessagesRepository, private llm: OpenRouterClient, private docs: DocumentsService, private chunksRepo: ChunksRepository) {}
  private async composePrompt(conversationId: string, question: string): Promise<ChatMessage[]> {
    const persona: ChatMessage = await this.getPersona();
    const contextMsg: ChatMessage = await this.getRelevantContext(conversationId, question);
    const recent = await this.msgRepo.listByConversation(conversationId, 10, undefined, 'desc');
    const history: ChatMessage[] = recent.reverse().map(m => ({ role: m.role, content: m.content }));
    return [persona, contextMsg, ...history];
  }
  private async getPersona(): Promise<ChatMessage> {
    return { role: 'system', content: 'You are a financial consultant from SafraAI\nYour name is Safira' };
  }
  private async getRelevantContext(conversationId: string, question: string): Promise<ChatMessage> {
    const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    const embedding = await this.llm.embedText(question, model);
    const ctx = await this.chunksRepo.searchByEmbedding(embedding, 5, conversationId);
    const contextText = ctx.map(c => c.content).join('\n\n');
    return { role: 'system', content: `Context:\n${contextText}` };
  }

  async list(limit: number, offset: number): Promise<ConversationListResponse> {
    logger.info('service.conversations.list', { limit, offset });
    const items = await this.convRepo.list(limit, offset);
    const total = await this.convRepo.count();
    const meta = {
      total,
      limit,
      offset,
    }
    return { items, meta };
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
    logger.info('service.messages.list', { conversationId, limit, hasCursor: Boolean(cursor) });
    const items = await this.msgRepo.listByConversation(conversationId, limit, cursor, 'desc');
    const tail = items[items.length - 1];
    const nextCursor = items.length === limit && tail ? encodeCursor({ created_at: tail.createdAt, id: tail.id }) : undefined;
    return { items, nextCursor };
  }
  async sendMessageAndReply(conversationId: string, content: string) {
    logger.info('service.messages.send.start', { conversationId });
    let conv = await this.convRepo.get(conversationId);
    if (!conv) conv = await this.create();
    await this.msgRepo.create(conv.id, 'user', content || '');
    const messages = await this.composePrompt(conv.id, content || '');
    const model = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-8b-instruct';
    const ai = await this.llm.chatCompletion(messages, model);
    const assistantId = await this.msgRepo.create(conv.id, 'assistant', ai.content || '');
    logger.info('service.messages.send.done', { conversationId: conv.id });
    return { messageId: assistantId, citations: [], conversationId: conv.id };
  }
}

// Default service instantiation removed in favor of DI container
