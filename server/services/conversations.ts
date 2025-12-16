import { type ChatMessage, type OpenRouterClient } from '@/server/clients/openrouter';
import { type ConversationsRepository } from '@/server/repositories/conversations';
import { type MessagesRepository } from '@/server/repositories/messages';
import { type ChunksRepository } from '@/server/repositories/chunks';
import { type ConversationListResponse } from '@/server/types/conversation';
import { type MessagesListResponse } from '@/server/types/message';
import { randomUUID } from 'crypto';
import type { DocumentsService } from '@/server/services/documents';

export class ConversationsService {
  constructor(private convRepo: ConversationsRepository, private msgRepo: MessagesRepository, private llm: OpenRouterClient, private docs: DocumentsService, private chunksRepo: ChunksRepository) {}
  private parseCursor(cursor?: string) {
    const n = Number(cursor);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  private async composePrompt(conversationId: string, question: string): Promise<ChatMessage[]> {
    const persona: ChatMessage = { role: 'system', content: 'You are a financial consultant from SafraAI' };
    const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    const embedding = await this.llm.embedText(question, model);
    const ctx = await this.chunksRepo.searchByEmbedding(embedding, 5);
    const contextText = ctx.map(c => c.content).join('\n\n');
    const contextMsg: ChatMessage = { role: 'system', content: `Context:\n${contextText}` };
    const recent = await this.msgRepo.listByConversation(conversationId, 10, 0, 'desc');
    const history: ChatMessage[] = recent.reverse().map(m => ({ role: m.role, content: m.content }));
    return [persona, contextMsg, ...history];
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
    const messages = await this.composePrompt(conv.id, content || '');
    const model = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-8b-instruct';
    const ai = await this.llm.chatCompletion(messages, model);
    const assistantId = await this.msgRepo.create(conv.id, 'assistant', ai.content || '');
    return { messageId: assistantId, citations: [], conversationId: conv.id };
  }
}

// Default service instantiation removed in favor of DI container
